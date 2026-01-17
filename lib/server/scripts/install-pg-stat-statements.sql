-- Install pg_stat_statements Extension
-- This enables query performance monitoring in Neon
-- 
-- Usage: Run this via Neon MCP or directly in Neon Console
-- 
-- After installation, you can use:
-- - Neon MCP: list_slow_queries tool
-- - SQL: SELECT * FROM pg_stat_statements ORDER BY total_exec_time DESC LIMIT 10;

-- Install extension
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Verify installation
SELECT 
  extname, 
  extversion 
FROM pg_extension 
WHERE extname = 'pg_stat_statements';

-- Show current query statistics (top 10 by total execution time)
SELECT 
  query,
  calls,
  total_exec_time,
  mean_exec_time,
  max_exec_time
FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 10;
