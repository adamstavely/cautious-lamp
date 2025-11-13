# Database Indexing Recommendations

This document provides recommendations for database indexing to optimize query performance in the Design System platform.

## Overview

Proper indexing is crucial for performance, especially as the system scales. This document outlines recommended indexes for common query patterns.

## Elasticsearch Indexes

### Audit Logs Index

**Index Pattern**: `design-system-audit-*`

**Recommended Indexes**:
```json
{
  "mappings": {
    "properties": {
      "@timestamp": { "type": "date" },
      "userId": { "type": "keyword" },
      "action": { "type": "keyword" },
      "resourceType": { "type": "keyword" },
      "resourceId": { "type": "keyword" },
      "endpoint": { "type": "text", "fields": { "keyword": { "type": "keyword" } } },
      "responseStatus": { "type": "integer" },
      "success": { "type": "boolean" }
    }
  },
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 1
  }
}
```

**Query Patterns**:
- Filter by userId + date range
- Filter by action + resourceType
- Filter by endpoint + date range
- Filter by responseStatus

**Index Strategy**: Daily indices with retention policy (e.g., 90 days)

### Design System Components Index

**Index Pattern**: `design-system-components`

**Recommended Indexes**:
```json
{
  "mappings": {
    "properties": {
      "id": { "type": "keyword" },
      "name": { 
        "type": "text",
        "fields": {
          "keyword": { "type": "keyword" },
          "suggest": { "type": "completion" }
        }
      },
      "status": { "type": "keyword" },
      "category": { "type": "keyword" },
      "tags": { "type": "keyword" },
      "workspaceId": { "type": "keyword" },
      "createdAt": { "type": "date" },
      "updatedAt": { "type": "date" }
    }
  }
}
```

**Query Patterns**:
- Search by name (text search)
- Filter by status + workspaceId
- Filter by category + tags
- Sort by createdAt/updatedAt

### Tokens Index

**Index Pattern**: `design-system-tokens`

**Recommended Indexes**:
```json
{
  "mappings": {
    "properties": {
      "name": { 
        "type": "text",
        "fields": {
          "keyword": { "type": "keyword" }
        }
      },
      "type": { "type": "keyword" },
      "category": { "type": "keyword" },
      "workspaceId": { "type": "keyword" }
    }
  }
}
```

## In-Memory Data Structures

For in-memory Maps used in services, consider the following:

### Visual Regression Service

**Data Structures**:
- `projects: Map<string, Project>` - Indexed by project ID
- `testRuns: Map<string, TestRun>` - Indexed by run ID
- `testResults: Map<string, TestResult[]>` - Indexed by run ID

**Optimization Recommendations**:
1. For queries filtering by `projectId`, maintain a secondary index:
   ```typescript
   private projectRunsIndex = new Map<string, Set<string>>(); // projectId -> Set<runId>
   ```

2. For date range queries on test runs, consider a sorted data structure or maintain a date index.

### Search Service

**Optimization Recommendations**:
1. Pre-index component names and descriptions for faster search
2. Maintain inverted indexes for tags and categories
3. Cache search results with TTL for common queries

## Performance Best Practices

### 1. Index Selection
- Use `keyword` type for exact matches and filtering
- Use `text` type for full-text search
- Use `date` type for date range queries
- Use `completion` suggester for autocomplete

### 2. Query Optimization
- Use filters instead of queries when possible (filters are cached)
- Combine multiple filters in a `bool` query
- Use `term` queries for exact matches on keyword fields
- Use `range` queries for date/number ranges

### 3. Pagination
- Always use pagination for large result sets
- Use `from` and `size` parameters
- Consider using `search_after` for deep pagination

### 4. Caching
- Cache frequently accessed data (components, tokens)
- Use TTL-based cache invalidation
- Implement cache warming for critical data

### 5. Monitoring
- Monitor query performance
- Track slow queries (>100ms)
- Monitor index size and growth
- Track cache hit rates

## Migration to Database

When migrating from in-memory storage to a database:

### PostgreSQL Recommendations

**Audit Logs Table**:
```sql
CREATE INDEX idx_audit_user_date ON audit_logs(user_id, timestamp DESC);
CREATE INDEX idx_audit_action_resource ON audit_logs(action, resource_type);
CREATE INDEX idx_audit_endpoint ON audit_logs(endpoint);
CREATE INDEX idx_audit_status ON audit_logs(response_status);
```

**Components Table**:
```sql
CREATE INDEX idx_components_workspace ON components(workspace_id);
CREATE INDEX idx_components_status ON components(status);
CREATE INDEX idx_components_name ON components USING gin(to_tsvector('english', name));
CREATE INDEX idx_components_tags ON components USING gin(tags);
```

**Test Runs Table**:
```sql
CREATE INDEX idx_test_runs_project ON test_runs(project_id, started_at DESC);
CREATE INDEX idx_test_runs_status ON test_runs(status);
CREATE INDEX idx_test_runs_date ON test_runs(started_at DESC);
```

**Test Results Table**:
```sql
CREATE INDEX idx_test_results_run ON test_results(run_id, test_name);
CREATE INDEX idx_test_results_status ON test_results(status);
CREATE INDEX idx_test_results_approved ON test_results(approved);
```

## Index Maintenance

1. **Regular Review**: Review indexes quarterly to ensure they're still needed
2. **Monitor Usage**: Track which indexes are used and which are not
3. **Remove Unused Indexes**: Drop indexes that are not being used
4. **Update Statistics**: Keep database statistics up to date for query planning

## Notes

- Indexes improve read performance but can slow down writes
- Balance between query performance and write performance
- Monitor index size and impact on storage
- Consider partial indexes for filtered queries
- Use composite indexes for multi-column queries

