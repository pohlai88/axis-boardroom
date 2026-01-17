-- ===========================================================================
-- AXIS BOARDROOM - MULTI-TENANT SCHEMA WITH RLS
-- ===========================================================================
-- Description: Complete multi-tenant setup with:
--   1. Organizations (top-level tenants)
--   2. Teams (sub-organizations within tenants)
--   3. Memberships (user-org-team relationships)
--   4. Row-Level Security (RLS) policies for data isolation
--   5. Sync with Neon Auth tables
-- ===========================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================================================================
-- SCHEMA: axis_tenant (Multi-tenant core tables)
-- ===========================================================================
CREATE SCHEMA IF NOT EXISTS axis_tenant;

-- ---------------------------------------------------------------------------
-- Table: axis_tenant.organizations
-- Description: Top-level tenant organizations
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS axis_tenant.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Core fields
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    domain TEXT UNIQUE,  -- Custom domain (e.g., acme.example.com)
    
    -- Branding
    logo_url TEXT,
    primary_color TEXT DEFAULT '#3b82f6',
    
    -- Settings
    settings JSONB DEFAULT '{}'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Status
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'archived')),
    
    -- Sync with Neon Auth
    neon_auth_org_id UUID UNIQUE,  -- References neon_auth.organization.id
    
    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,
    
    -- Constraints
    CONSTRAINT valid_slug CHECK (slug ~ '^[a-z0-9-]+$'),
    CONSTRAINT valid_domain CHECK (domain IS NULL OR domain ~ '^[a-z0-9.-]+$')
);

-- Indexes
CREATE INDEX idx_org_slug ON axis_tenant.organizations(slug);
CREATE INDEX idx_org_domain ON axis_tenant.organizations(domain) WHERE domain IS NOT NULL;
CREATE INDEX idx_org_status ON axis_tenant.organizations(status);
CREATE INDEX idx_org_neon_auth ON axis_tenant.organizations(neon_auth_org_id) WHERE neon_auth_org_id IS NOT NULL;

-- ---------------------------------------------------------------------------
-- Table: axis_tenant.teams
-- Description: Sub-organizations within a tenant (e.g., departments)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS axis_tenant.teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES axis_tenant.organizations(id) ON DELETE CASCADE,
    
    -- Core fields
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    
    -- Hierarchy
    parent_team_id UUID REFERENCES axis_tenant.teams(id) ON DELETE SET NULL,
    
    -- Settings
    settings JSONB DEFAULT '{}'::jsonb,
    
    -- Status
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived')),
    
    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,
    
    -- Constraints
    UNIQUE(organization_id, slug),
    CONSTRAINT no_self_parent CHECK (id != parent_team_id)
);

-- Indexes
CREATE INDEX idx_team_org ON axis_tenant.teams(organization_id);
CREATE INDEX idx_team_parent ON axis_tenant.teams(parent_team_id) WHERE parent_team_id IS NOT NULL;
CREATE INDEX idx_team_status ON axis_tenant.teams(status);

-- ---------------------------------------------------------------------------
-- Table: axis_tenant.memberships
-- Description: User-Organization-Team relationships with roles
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS axis_tenant.memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Relationships
    user_id UUID NOT NULL,  -- Can reference either axis.users or neon_auth.user
    organization_id UUID NOT NULL REFERENCES axis_tenant.organizations(id) ON DELETE CASCADE,
    team_id UUID REFERENCES axis_tenant.teams(id) ON DELETE CASCADE,
    
    -- Role & Permissions
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'manager', 'member', 'viewer')),
    permissions JSONB DEFAULT '[]'::jsonb,  -- Custom permissions array
    
    -- Status
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'invited', 'suspended')),
    invited_by UUID,
    invitation_token TEXT,
    invitation_expires_at TIMESTAMPTZ,
    
    -- Sync with Neon Auth
    neon_auth_member_id UUID UNIQUE,  -- References neon_auth.member.id
    
    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    accepted_at TIMESTAMPTZ,
    
    -- Constraints
    UNIQUE(user_id, organization_id, team_id),
    CONSTRAINT team_belongs_to_org CHECK (
        team_id IS NULL OR 
        EXISTS (SELECT 1 FROM axis_tenant.teams WHERE id = team_id AND organization_id = memberships.organization_id)
    )
);

-- Indexes
CREATE INDEX idx_membership_user ON axis_tenant.memberships(user_id);
CREATE INDEX idx_membership_org ON axis_tenant.memberships(organization_id);
CREATE INDEX idx_membership_team ON axis_tenant.memberships(team_id) WHERE team_id IS NOT NULL;
CREATE INDEX idx_membership_role ON axis_tenant.memberships(role);
CREATE INDEX idx_membership_status ON axis_tenant.memberships(status);
CREATE INDEX idx_membership_neon_auth ON axis_tenant.memberships(neon_auth_member_id) WHERE neon_auth_member_id IS NOT NULL;

-- ---------------------------------------------------------------------------
-- Table: axis_tenant.tenant_contexts
-- Description: Current tenant context for RLS (set via session variables)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS axis_tenant.tenant_contexts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    organization_id UUID NOT NULL REFERENCES axis_tenant.organizations(id),
    team_id UUID REFERENCES axis_tenant.teams(id),
    session_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '24 hours'
);

CREATE INDEX idx_tenant_context_user ON axis_tenant.tenant_contexts(user_id);
CREATE INDEX idx_tenant_context_session ON axis_tenant.tenant_contexts(session_id);

-- ===========================================================================
-- FUNCTIONS: Helper functions for RLS and tenant management
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- Function: current_user_id()
-- Description: Get current user ID from session (supports both auth methods)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION axis_tenant.current_user_id()
RETURNS UUID AS $$
BEGIN
    -- Try to get from Neon Auth session first
    RETURN NULLIF(current_setting('neon_auth.user_id', true), '')::uuid;
EXCEPTION
    WHEN OTHERS THEN
        -- Fallback to custom session variable
        RETURN NULLIF(current_setting('axis.user_id', true), '')::uuid;
END;
$$ LANGUAGE plpgsql STABLE;

-- ---------------------------------------------------------------------------
-- Function: current_organization_id()
-- Description: Get current organization ID from session
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION axis_tenant.current_organization_id()
RETURNS UUID AS $$
BEGIN
    RETURN NULLIF(current_setting('axis.organization_id', true), '')::uuid;
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;

-- ---------------------------------------------------------------------------
-- Function: current_team_id()
-- Description: Get current team ID from session
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION axis_tenant.current_team_id()
RETURNS UUID AS $$
BEGIN
    RETURN NULLIF(current_setting('axis.team_id', true), '')::uuid;
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;

-- ---------------------------------------------------------------------------
-- Function: has_org_access(organization_id, min_role)
-- Description: Check if current user has access to organization with minimum role
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION axis_tenant.has_org_access(
    org_id UUID,
    min_role TEXT DEFAULT 'member'
)
RETURNS BOOLEAN AS $$
DECLARE
    user_role TEXT;
    role_hierarchy TEXT[] := ARRAY['viewer', 'member', 'manager', 'admin', 'owner'];
    user_level INT;
    min_level INT;
BEGIN
    -- Get user's role in the organization
    SELECT role INTO user_role
    FROM axis_tenant.memberships
    WHERE user_id = axis_tenant.current_user_id()
      AND organization_id = org_id
      AND status = 'active';
    
    IF user_role IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Compare role levels
    SELECT array_position(role_hierarchy, user_role) INTO user_level;
    SELECT array_position(role_hierarchy, min_role) INTO min_level;
    
    RETURN user_level >= min_level;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ---------------------------------------------------------------------------
-- Function: has_team_access(team_id, min_role)
-- Description: Check if current user has access to team with minimum role
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION axis_tenant.has_team_access(
    t_id UUID,
    min_role TEXT DEFAULT 'member'
)
RETURNS BOOLEAN AS $$
DECLARE
    user_role TEXT;
    org_id UUID;
BEGIN
    -- Get team's organization
    SELECT organization_id INTO org_id
    FROM axis_tenant.teams
    WHERE id = t_id;
    
    -- Check if user has access to the team or its parent organization
    SELECT role INTO user_role
    FROM axis_tenant.memberships
    WHERE user_id = axis_tenant.current_user_id()
      AND organization_id = org_id
      AND (team_id = t_id OR team_id IS NULL)  -- Team member or org member
      AND status = 'active';
    
    RETURN user_role IS NOT NULL;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ===========================================================================
-- ROW-LEVEL SECURITY (RLS): Enable and create policies
-- ===========================================================================

-- Enable RLS on all tenant tables
ALTER TABLE axis_tenant.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE axis_tenant.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE axis_tenant.memberships ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- RLS Policies: Organizations
-- ---------------------------------------------------------------------------

-- SELECT: Users can see organizations they're members of
CREATE POLICY org_select_policy ON axis_tenant.organizations
    FOR SELECT
    USING (
        id IN (
            SELECT organization_id 
            FROM axis_tenant.memberships 
            WHERE user_id = axis_tenant.current_user_id() 
              AND status = 'active'
        )
    );

-- INSERT: Only system/superusers can create organizations
CREATE POLICY org_insert_policy ON axis_tenant.organizations
    FOR INSERT
    WITH CHECK (false);  -- Disable for normal users, enable via service role

-- UPDATE: Org admins and owners can update
CREATE POLICY org_update_policy ON axis_tenant.organizations
    FOR UPDATE
    USING (
        axis_tenant.has_org_access(id, 'admin')
    );

-- DELETE: Only org owners can delete
CREATE POLICY org_delete_policy ON axis_tenant.organizations
    FOR DELETE
    USING (
        axis_tenant.has_org_access(id, 'owner')
    );

-- ---------------------------------------------------------------------------
-- RLS Policies: Teams
-- ---------------------------------------------------------------------------

-- SELECT: Users can see teams in their organizations
CREATE POLICY team_select_policy ON axis_tenant.teams
    FOR SELECT
    USING (
        organization_id IN (
            SELECT organization_id 
            FROM axis_tenant.memberships 
            WHERE user_id = axis_tenant.current_user_id() 
              AND status = 'active'
        )
    );

-- INSERT: Org admins can create teams
CREATE POLICY team_insert_policy ON axis_tenant.teams
    FOR INSERT
    WITH CHECK (
        axis_tenant.has_org_access(organization_id, 'admin')
    );

-- UPDATE: Org admins and team managers can update
CREATE POLICY team_update_policy ON axis_tenant.teams
    FOR UPDATE
    USING (
        axis_tenant.has_org_access(organization_id, 'admin') OR
        axis_tenant.has_team_access(id, 'manager')
    );

-- DELETE: Org admins can delete teams
CREATE POLICY team_delete_policy ON axis_tenant.teams
    FOR DELETE
    USING (
        axis_tenant.has_org_access(organization_id, 'admin')
    );

-- ---------------------------------------------------------------------------
-- RLS Policies: Memberships
-- ---------------------------------------------------------------------------

-- SELECT: Users can see memberships in their organizations
CREATE POLICY membership_select_policy ON axis_tenant.memberships
    FOR SELECT
    USING (
        organization_id IN (
            SELECT organization_id 
            FROM axis_tenant.memberships 
            WHERE user_id = axis_tenant.current_user_id() 
              AND status = 'active'
        )
    );

-- INSERT: Org admins can add members
CREATE POLICY membership_insert_policy ON axis_tenant.memberships
    FOR INSERT
    WITH CHECK (
        axis_tenant.has_org_access(organization_id, 'admin')
    );

-- UPDATE: Org admins can update, users can update their own status
CREATE POLICY membership_update_policy ON axis_tenant.memberships
    FOR UPDATE
    USING (
        axis_tenant.has_org_access(organization_id, 'admin') OR
        user_id = axis_tenant.current_user_id()
    );

-- DELETE: Org admins can remove members
CREATE POLICY membership_delete_policy ON axis_tenant.memberships
    FOR DELETE
    USING (
        axis_tenant.has_org_access(organization_id, 'admin')
    );

-- ===========================================================================
-- TRIGGERS: Auto-update timestamps
-- ===========================================================================

CREATE OR REPLACE FUNCTION axis_tenant.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER organizations_updated_at
    BEFORE UPDATE ON axis_tenant.organizations
    FOR EACH ROW
    EXECUTE FUNCTION axis_tenant.update_updated_at();

CREATE TRIGGER teams_updated_at
    BEFORE UPDATE ON axis_tenant.teams
    FOR EACH ROW
    EXECUTE FUNCTION axis_tenant.update_updated_at();

CREATE TRIGGER memberships_updated_at
    BEFORE UPDATE ON axis_tenant.memberships
    FOR EACH ROW
    EXECUTE FUNCTION axis_tenant.update_updated_at();

-- ===========================================================================
-- VIEWS: Sync status and unified queries
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- View: Neon Auth sync status
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW axis_tenant.v_neon_auth_sync_status AS
SELECT 
    o.id AS axis_org_id,
    o.neon_auth_org_id,
    no.name AS neon_auth_org_name,
    o.name AS axis_org_name,
    CASE 
        WHEN o.neon_auth_org_id IS NULL THEN 'not_synced'
        WHEN no.id IS NULL THEN 'orphaned'
        ELSE 'synced'
    END AS sync_status
FROM axis_tenant.organizations o
LEFT JOIN neon_auth.organization no ON o.neon_auth_org_id = no.id;

-- ---------------------------------------------------------------------------
-- View: User memberships with organization details
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW axis_tenant.v_user_memberships AS
SELECT 
    m.id,
    m.user_id,
    m.organization_id,
    m.team_id,
    m.role,
    m.status,
    o.name AS organization_name,
    o.slug AS organization_slug,
    o.logo_url AS organization_logo,
    t.name AS team_name,
    t.slug AS team_slug
FROM axis_tenant.memberships m
JOIN axis_tenant.organizations o ON m.organization_id = o.id
LEFT JOIN axis_tenant.teams t ON m.team_id = t.id;

-- ===========================================================================
-- GRANTS: Permissions for authenticated users
-- ===========================================================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA axis_tenant TO authenticated;

-- Grant permissions on tables
GRANT SELECT, INSERT, UPDATE, DELETE ON axis_tenant.organizations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON axis_tenant.teams TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON axis_tenant.memberships TO authenticated;
GRANT SELECT ON axis_tenant.v_neon_auth_sync_status TO authenticated;
GRANT SELECT ON axis_tenant.v_user_memberships TO authenticated;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION axis_tenant.current_user_id() TO authenticated;
GRANT EXECUTE ON FUNCTION axis_tenant.current_organization_id() TO authenticated;
GRANT EXECUTE ON FUNCTION axis_tenant.current_team_id() TO authenticated;
GRANT EXECUTE ON FUNCTION axis_tenant.has_org_access(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION axis_tenant.has_team_access(UUID, TEXT) TO authenticated;

-- ===========================================================================
-- COMMENTS: Documentation
-- ===========================================================================

COMMENT ON SCHEMA axis_tenant IS 'Multi-tenant core schema with organizations, teams, and RLS policies';

COMMENT ON TABLE axis_tenant.organizations IS 'Top-level tenant organizations';
COMMENT ON TABLE axis_tenant.teams IS 'Sub-organizations within tenants (departments, projects, etc.)';
COMMENT ON TABLE axis_tenant.memberships IS 'User-Organization-Team relationships with role-based access';

COMMENT ON COLUMN axis_tenant.organizations.neon_auth_org_id IS 'Sync with Neon Auth organization';
COMMENT ON COLUMN axis_tenant.memberships.neon_auth_member_id IS 'Sync with Neon Auth member';

COMMENT ON FUNCTION axis_tenant.current_user_id() IS 'Get current authenticated user ID from session';
COMMENT ON FUNCTION axis_tenant.has_org_access(UUID, TEXT) IS 'Check if user has minimum role in organization';

-- ===========================================================================
-- END OF MULTI-TENANT SETUP
-- ===========================================================================
