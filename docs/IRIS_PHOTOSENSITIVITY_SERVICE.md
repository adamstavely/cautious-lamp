# IRIS Photosensitivity Analysis Service

## Overview

Integrate EA's IRIS (photosensitivity analysis tool) as a service capability for accessibility scanning. IRIS analyzes video content to detect photosensitive epileptic risks, including luminance flashes, red saturation flashes, and spatial patterns.

**Repository**: [https://github.com/electronicarts/IRIS](https://github.com/electronicarts/IRIS)

## What IRIS Detects

1. **Luminance Flashes**: More than 3 flashes per second in any given second
2. **Red Saturation Flashes**: More than 3 flashes per second in any given second
3. **Spatial Patterns**: Harmful patterns present for half a second or more
4. **Extended Flash Failures**: 2-3 flashes per second in any 5 consecutive seconds

## Integration Approach

Since IRIS is a C++ library, we'll integrate it as:

1. **Backend Service**: Create a service that interfaces with IRIS (via CLI or wrapper)
2. **Rules Engine Integration**: Add IRIS scanning as an accessibility rule
3. **Video Upload & Analysis**: Allow teams to upload videos for analysis
4. **Results Integration**: Display IRIS results in compliance checks

## Implementation Plan

### Phase 1: Backend Service

- IRIS CLI wrapper service
- Video upload and storage
- Analysis execution
- Results parsing (CSV/JSON)
- Integration with rules engine

### Phase 2: Frontend UI

- Video upload interface
- Analysis progress tracking
- Results visualization
- Integration with Governance page

### Phase 3: Rules Engine Integration

- Add IRIS rule to accessibility category
- Automatic scanning for video content
- Compliance check generation

