-- ===========================================================================
-- MULTI-TENANT SEED DATA
-- ===========================================================================
-- Description: Seed data for testing multi-tenant setup
--   - Organizations (3 types: enterprise, mid-size, personal)
--   - Teams within organizations
--   - Memberships with various roles
-- ===========================================================================

-- ===========================================================================
-- SEED: Organizations
-- ===========================================================================

-- Organization 1: Enterprise Organization (ACME Corp)
INSERT INTO axis_tenant.organizations (id, name, slug, domain, logo_url, primary_color, settings, metadata, status)
VALUES (
    'a0000000-0000-0000-0000-000000000001'::uuid,
    'ACME Corporation',
    'acme-corp',
    'acme.axis-board.com',
    'https://via.placeholder.com/150/FF6B6B/FFFFFF?text=ACME',
    '#FF6B6B',
    '{"features": ["advanced_analytics", "custom_workflows", "api_access"], "max_users": 500}'::jsonb,
    '{"industry": "Technology", "founded": "2015", "employees": "1000+"}'::jsonb,
    'active'
)
ON CONFLICT (id) DO NOTHING;

-- Organization 2: Mid-Size Organization (TechStart Inc)
INSERT INTO axis_tenant.organizations (id, name, slug, domain, logo_url, primary_color, settings, metadata, status)
VALUES (
    'a0000000-0000-0000-0000-000000000002'::uuid,
    'TechStart Inc',
    'techstart',
    'techstart.axis-board.com',
    'https://via.placeholder.com/150/4ECDC4/FFFFFF?text=TS',
    '#4ECDC4',
    '{"features": ["basic_analytics", "custom_workflows"], "max_users": 100}'::jsonb,
    '{"industry": "SaaS", "founded": "2020", "employees": "50-200"}'::jsonb,
    'active'
)
ON CONFLICT (id) DO NOTHING;

-- Organization 3: Personal/Individual Organization
INSERT INTO axis_tenant.organizations (id, name, slug, domain, logo_url, primary_color, settings, metadata, status)
VALUES (
    'a0000000-0000-0000-0000-000000000003'::uuid,
    'My Personal Workspace',
    'personal-workspace',
    NULL,
    'https://via.placeholder.com/150/95E1D3/FFFFFF?text=PW',
    '#95E1D3',
    '{"features": ["basic_features"], "max_users": 5}'::jsonb,
    '{"type": "individual"}'::jsonb,
    'active'
)
ON CONFLICT (id) DO NOTHING;

-- ===========================================================================
-- SEED: Teams
-- ===========================================================================

-- ACME Corp Teams
INSERT INTO axis_tenant.teams (id, organization_id, name, slug, description, parent_team_id, status)
VALUES 
    ('b0000000-0000-0000-0000-000000000001'::uuid, 'a0000000-0000-0000-0000-000000000001'::uuid, 'Engineering', 'engineering', 'Product development and engineering', NULL, 'active'),
    ('b0000000-0000-0000-0000-000000000002'::uuid, 'a0000000-0000-0000-0000-000000000001'::uuid, 'Frontend Team', 'frontend', 'Web and mobile frontend development', 'b0000000-0000-0000-0000-000000000001'::uuid, 'active'),
    ('b0000000-0000-0000-0000-000000000003'::uuid, 'a0000000-0000-0000-0000-000000000001'::uuid, 'Backend Team', 'backend', 'API and backend services', 'b0000000-0000-0000-0000-000000000001'::uuid, 'active'),
    ('b0000000-0000-0000-0000-000000000004'::uuid, 'a0000000-0000-0000-0000-000000000001'::uuid, 'Sales', 'sales', 'Sales and business development', NULL, 'active'),
    ('b0000000-0000-0000-0000-000000000005'::uuid, 'a0000000-0000-0000-0000-000000000001'::uuid, 'Marketing', 'marketing', 'Marketing and growth', NULL, 'active')
ON CONFLICT (id) DO NOTHING;

-- TechStart Inc Teams
INSERT INTO axis_tenant.teams (id, organization_id, name, slug, description, parent_team_id, status)
VALUES 
    ('b0000000-0000-0000-0000-000000000006'::uuid, 'a0000000-0000-0000-0000-000000000002'::uuid, 'Product Team', 'product', 'Product development', NULL, 'active'),
    ('b0000000-0000-0000-0000-000000000007'::uuid, 'a0000000-0000-0000-0000-000000000002'::uuid, 'Customer Success', 'customer-success', 'Customer support and success', NULL, 'active')
ON CONFLICT (id) DO NOTHING;

-- ===========================================================================
-- SEED: Test Users in axis.users (if not exist)
-- ===========================================================================

-- Create test users if they don't exist
INSERT INTO axis.users (id, name, email, role, created_at, updated_at)
VALUES 
    ('u0000000-0000-0000-0000-000000000001'::uuid, 'Alice Admin', 'alice@acme.com', 'admin', NOW(), NOW()),
    ('u0000000-0000-0000-0000-000000000002'::uuid, 'Bob Manager', 'bob@acme.com', 'manager', NOW(), NOW()),
    ('u0000000-0000-0000-0000-000000000003'::uuid, 'Charlie Member', 'charlie@acme.com', 'member', NOW(), NOW()),
    ('u0000000-0000-0000-0000-000000000004'::uuid, 'David Owner', 'david@techstart.com', 'admin', NOW(), NOW()),
    ('u0000000-0000-0000-0000-000000000005'::uuid, 'Eve User', 'eve@techstart.com', 'member', NOW(), NOW()),
    ('u0000000-0000-0000-0000-000000000006'::uuid, 'Frank Personal', 'frank@personal.com', 'admin', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ===========================================================================
-- SEED: Memberships
-- ===========================================================================

-- ACME Corp Memberships
INSERT INTO axis_tenant.memberships (id, user_id, organization_id, team_id, role, status, accepted_at)
VALUES 
    -- Alice: Owner, no specific team (org-level)
    ('c0000000-0000-0000-0000-000000000001'::uuid, 'u0000000-0000-0000-0000-000000000001'::uuid, 'a0000000-0000-0000-0000-000000000001'::uuid, NULL, 'owner', 'active', NOW()),
    
    -- Bob: Manager in Engineering team
    ('c0000000-0000-0000-0000-000000000002'::uuid, 'u0000000-0000-0000-0000-000000000002'::uuid, 'a0000000-0000-0000-0000-000000000001'::uuid, 'b0000000-0000-0000-0000-000000000001'::uuid, 'manager', 'active', NOW()),
    
    -- Charlie: Member in Frontend team
    ('c0000000-0000-0000-0000-000000000003'::uuid, 'u0000000-0000-0000-0000-000000000003'::uuid, 'a0000000-0000-0000-0000-000000000001'::uuid, 'b0000000-0000-0000-0000-000000000002'::uuid, 'member', 'active', NOW())
ON CONFLICT (id) DO NOTHING;

-- TechStart Inc Memberships
INSERT INTO axis_tenant.memberships (id, user_id, organization_id, team_id, role, status, accepted_at)
VALUES 
    -- David: Owner, no specific team
    ('c0000000-0000-0000-0000-000000000004'::uuid, 'u0000000-0000-0000-0000-000000000004'::uuid, 'a0000000-0000-0000-0000-000000000002'::uuid, NULL, 'owner', 'active', NOW()),
    
    -- Eve: Member in Product team
    ('c0000000-0000-0000-0000-000000000005'::uuid, 'u0000000-0000-0000-0000-000000000005'::uuid, 'a0000000-0000-0000-0000-000000000002'::uuid, 'b0000000-0000-0000-0000-000000000006'::uuid, 'member', 'active', NOW())
ON CONFLICT (id) DO NOTHING;

-- Personal Workspace Membership
INSERT INTO axis_tenant.memberships (id, user_id, organization_id, team_id, role, status, accepted_at)
VALUES 
    -- Frank: Owner of personal workspace
    ('c0000000-0000-0000-0000-000000000006'::uuid, 'u0000000-0000-0000-0000-000000000006'::uuid, 'a0000000-0000-0000-0000-000000000003'::uuid, NULL, 'owner', 'active', NOW())
ON CONFLICT (id) DO NOTHING;

-- ===========================================================================
-- VERIFICATION QUERIES
-- ===========================================================================

-- Show all organizations
SELECT id, name, slug, domain, status FROM axis_tenant.organizations ORDER BY name;

-- Show all teams
SELECT t.id, o.name AS org_name, t.name AS team_name, t.slug, t.description
FROM axis_tenant.teams t
JOIN axis_tenant.organizations o ON t.organization_id = o.id
ORDER BY o.name, t.name;

-- Show all memberships with user and org details
SELECT 
    u.name AS user_name,
    u.email AS user_email,
    o.name AS organization,
    t.name AS team,
    m.role,
    m.status
FROM axis_tenant.memberships m
JOIN axis.users u ON m.user_id = u.id
JOIN axis_tenant.organizations o ON m.organization_id = o.id
LEFT JOIN axis_tenant.teams t ON m.team_id = t.id
ORDER BY o.name, u.name;

-- ===========================================================================
-- END OF SEED DATA
-- ===========================================================================
