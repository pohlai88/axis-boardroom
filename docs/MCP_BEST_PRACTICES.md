# Next.js MCP Best Practices

## What is Next.js MCP?

**Model Context Protocol (MCP)** is an open standard that allows AI coding assistants and development tools to access and interact with your Next.js application's internal state, routes, errors, and metadata in real-time.

In Next.js 16+, MCP support is **built-in** and automatically enabled when the dev server runs. The MCP endpoint is available at `/_next/mcp`.

---

## ✅ Current Status

- **MCP Enabled**: ✅ Yes (Next.js 16.1.3)
- **Server Running**: ✅ Port 3000
- **Available Tools**: 6 tools active
- **Configuration**: ✅ `.mcp.json` created
- **Routes Discovered**: 8 routes (app router)
- **Errors**: ✅ None detected

---

## 🎯 Best Practices

### 1. **Always Use Next.js 16+**

- MCP endpoints are **only available in Next.js 16+**
- Your project is on **16.1.3** ✅ - Perfect!

### 2. **Keep Dev Server Running**

- MCP requires the dev server to be active (`npm run dev`)
- The MCP endpoint (`/_next/mcp`) is only available during development
- **Never use MCP in production** - it's a development-time feature

### 3. **Use MCP Tools Proactively**

#### Available Tools in Your Project:

1. **`get_routes`** - Discover all routes in your app
   - Use before implementing new features
   - Verify route structure matches expectations
   - Check dynamic segments and route groups

2. **`get_errors`** - Real-time error detection
   - Get compilation errors
   - Browser runtime errors
   - Build errors with source-mapped stack traces
   - **Use this frequently during development**

3. **`get_page_metadata`** - Runtime page information
   - What contributes to current page render
   - Active browser session data
   - Useful for debugging hydration issues

4. **`get_project_metadata`** - Project information
   - Project path, dev server URL
   - Configuration details

5. **`get_logs`** - Access development logs
   - Get path to log file
   - Read logs directly for debugging

6. **`get_server_action_by_id`** - Locate Server Actions
   - Find Server Actions by ID
   - Useful for debugging Server Actions

### 4. **Workflow Best Practices**

#### Before Implementing Changes:
```bash
# 1. Check current routes
nextjs_call(get_routes)

# 2. Check for existing errors
nextjs_call(get_errors)

# 3. Verify project structure
nextjs_call(get_project_metadata)
```

#### During Development:
```bash
# Continuously monitor errors
nextjs_call(get_errors)

# Check page metadata if issues arise
nextjs_call(get_page_metadata)
```

#### After Implementing:
```bash
# Verify routes are correct
nextjs_call(get_routes)

# Check for new errors
nextjs_call(get_errors)

# Use browser automation to test
browser_eval(navigate, click, etc.)
```

### 5. **Security Considerations**

- ✅ **MCP is development-only** - Never expose in production
- ✅ **No sensitive data** - MCP tools don't expose secrets
- ✅ **Local access only** - MCP endpoint is localhost by default
- ⚠️ **If using in shared environments**, consider authentication

### 6. **Project Structure Benefits**

Your AXIS project structure is **MCP-friendly**:

```
✅ Clear route groups: (prod), (lab), (demo)
✅ Organized components: axis/, primitives/, features/, _internal/
✅ Well-defined lib/ structure
✅ TypeScript strict mode enabled
```

**Why this matters:**
- MCP tools can better understand your codebase
- Route discovery is more accurate
- Error reporting is more precise
- Type information helps tools provide better suggestions

### 7. **Integration with AXIS Governance**

Your ESLint governance rules work perfectly with MCP:

- MCP can detect violations in real-time
- Route zone restrictions are discoverable
- Import restrictions are visible to tools
- Error detection catches governance violations

### 8. **Documentation-First Approach**

When using MCP tools:

1. **Always check documentation first** using `nextjs_docs`
2. **Use `nextjs_index`** to discover available tools
3. **Use `nextjs_call`** with specific tool names
4. **Verify with browser automation** when needed

---

## 🚀 Quick Reference

### Check Routes
```typescript
// Discover all routes
nextjs_call({ port: 3000, toolName: "get_routes" })

// Filter by router type
nextjs_call({ port: 3000, toolName: "get_routes", args: { routerType: "app" } })
```

### Check Errors
```typescript
// Get all errors (compilation, runtime, build)
nextjs_call({ port: 3000, toolName: "get_errors" })
```

### Get Page Metadata
```typescript
// Runtime page information
nextjs_call({ port: 3000, toolName: "get_page_metadata" })
```

### Get Project Info
```typescript
// Project metadata
nextjs_call({ port: 3000, toolName: "get_project_metadata" })
```

---

## 📊 Current Project MCP Status

### Routes Discovered (8 total):
- `/` - Home page
- `/dashboard` - Dashboard
- `/demo` - Demo page
- `/examples` - Examples
- `/login` - Login page
- `/playground` - Playground
- `/tasks` - Tasks page
- `/favicon.ico` - Favicon

### Error Status:
- ✅ **No errors detected**
- ✅ All routes compiling successfully
- ✅ Browser sessions clean

---

## 🎓 Learning Resources

- [Next.js MCP Documentation](https://nextjs.org/docs/app/guides/mcp)
- [Model Context Protocol Spec](https://modelcontextprotocol.io)
- Next.js DevTools MCP tools are available via `nextjs_index`

---

## 💡 Pro Tips

1. **Use MCP before manual debugging** - It's faster and more accurate
2. **Monitor errors continuously** - Catch issues early
3. **Verify routes after changes** - Ensure structure is correct
4. **Combine with browser automation** - Full-stack testing
5. **Document your MCP usage** - Help your team learn

---

## 🔄 Continuous Improvement

- ✅ MCP is enabled and working
- ✅ Configuration file created
- ✅ Tools are accessible
- ✅ No errors detected
- ✅ Routes properly discovered

**Next Steps:**
1. Use MCP tools during development
2. Monitor errors with `get_errors`
3. Verify routes with `get_routes`
4. Integrate MCP into your workflow

---

**Last Updated**: 2026-01-17
**Next.js Version**: 16.1.3
**MCP Status**: ✅ Active and Operational
