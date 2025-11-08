# OpenReplay Heatmaps API Research Report

## Research Date
2024-01-XX

## Research Objective
Determine if OpenReplay provides API endpoints for heatmap functionality that can be integrated into our design system service.

## Findings

### 1. OpenReplay Heatmaps Feature
✅ **Confirmed**: OpenReplay has built-in heatmap functionality in their "Product Analytics" section.

**Features Available:**
- Click heatmaps
- Scroll heatmaps  
- Mouse movement heatmaps
- URL filtering (contains, starts with, ends with, equals)
- Session filtering (user attributes, session characteristics, issues)
- Time range selection (Past 24 Hours, Past 7 Days, custom range)

**Access Method:**
- Accessed through OpenReplay dashboard UI
- Located in "Product Analytics" → "Heatmaps" section
- Requires manual creation through web interface

### 2. API Documentation Status
❌ **Not Found**: No publicly available API documentation for heatmap endpoints found.

**Searches Performed:**
- OpenReplay API documentation
- OpenReplay REST API endpoints
- OpenReplay GitHub repository
- OpenReplay developer API reference
- OpenReplay self-hosted API documentation

**Result**: All searches returned only UI-based documentation, no API endpoint specifications.

### 3. Likely API Structure (Inferred)

Based on OpenReplay's existing API patterns (sessions, projects), heatmap endpoints likely follow this structure:

**Potential Endpoints:**
```
GET    /api/v1/projects/{projectId}/heatmaps
POST   /api/v1/projects/{projectId}/heatmaps
GET    /api/v1/heatmaps/{heatmapId}
PUT    /api/v1/heatmaps/{heatmapId}
DELETE /api/v1/heatmaps/{heatmapId}
GET    /api/v1/heatmaps/{heatmapId}/data
```

**Authentication:**
- Likely uses Bearer token authentication (same as sessions API)
- Requires API key configured in project settings

### 4. Recommended Next Steps

#### Option A: Direct API Testing (Recommended First)
1. **Inspect Network Requests**: 
   - Set up a test OpenReplay instance
   - Access heatmaps through the UI
   - Use browser DevTools to inspect network requests
   - Document actual API endpoints and request/response formats

2. **Test Endpoints**:
   - Try common REST patterns with existing API key
   - Test with Postman/curl using discovered endpoints
   - Document successful endpoints and payloads

#### Option B: Contact OpenReplay Support
- Reach out to OpenReplay support/community
- Request API documentation for heatmaps
- Ask about programmatic access to heatmap data

#### Option C: Alternative Implementation Approaches

**1. Embed OpenReplay UI (Easiest)**
- Use iframe to embed OpenReplay's heatmap interface
- Direct link: `{openreplayBaseUrl}/project/{projectId}/heatmap/{heatmapId}`
- Pros: No API needed, full feature set
- Cons: Less control, requires iframe embedding

**2. Aggregate Session Data (Most Control)**
- Use existing session search API to get sessions
- Extract click/scroll coordinates from session events
- Generate heatmaps client-side using libraries like `heatmap.js`
- Pros: Full control, custom visualizations
- Cons: More complex, requires processing session data

**3. Hybrid Approach**
- Use OpenReplay UI for heatmap creation/configuration
- Generate direct links to OpenReplay heatmaps
- Display links in our UI with previews
- Pros: Best of both worlds
- Cons: Still requires some manual steps

### 5. Implementation Recommendation

**Phase 1: Quick Win (Recommended)**
Implement **Option C.1 (Embed UI)** or **Option C.3 (Hybrid)**:
- Add "Heatmaps" tab to project page
- Generate direct links to OpenReplay heatmap pages
- Use iframe to embed heatmap viewer
- This provides immediate value with minimal development

**Phase 2: Enhanced Integration**
After testing with real OpenReplay instance:
- Inspect network requests to discover actual API endpoints
- Implement full API integration if endpoints exist
- Build custom heatmap viewer if needed

### 6. Testing Plan

1. **Set up test environment**:
   - Deploy or access OpenReplay instance
   - Create test project
   - Generate some test sessions with clicks/scrolls

2. **Network inspection**:
   - Open browser DevTools → Network tab
   - Navigate to Heatmaps section in OpenReplay UI
   - Create a new heatmap
   - Document all API calls made

3. **API testing**:
   - Extract API endpoints from network requests
   - Test endpoints with Postman/curl
   - Document request/response formats

4. **Integration**:
   - Implement discovered endpoints in our API client
   - Build frontend components
   - Test end-to-end

### 7. Resources Found

- [OpenReplay Heatmaps Documentation](https://docs.openreplay.com/en/product-analytics/heatmaps/)
- OpenReplay UI-based documentation (no API docs found)
- Heatmap visualization libraries available:
  - [heatmap.js](https://www.patrick-wied.at/static/heatmapjs/)
  - [Leaflet Heatmap](https://github.com/Leaflet/Leaflet.heat)

### 8. Conclusion

**Status**: ⚠️ **API endpoints not publicly documented**

**Recommendation**: 
1. Start with **embedding approach** (Option C.1 or C.3) for quick implementation
2. **Inspect network requests** when testing with real OpenReplay instance
3. **Implement full API integration** once endpoints are discovered

**Next Action**: Set up test OpenReplay instance and inspect network requests to discover actual API endpoints.

