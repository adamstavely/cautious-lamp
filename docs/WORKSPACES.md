# Workspaces Guide

## Overview

Workspaces are isolated environments within the Design System Platform that allow teams to organize, manage, and control access to their design system resources. Each workspace acts as a container for resources like components, tokens, fonts, assets, and research artifacts, providing team-level isolation and collaboration capabilities.

## What is a Workspace?

A workspace is a named, isolated environment that contains:
- **Team members** with specific roles and permissions
- **Design system resources** (components, tokens, fonts, assets, etc.)
- **Research and HCD artifacts** (personas, journey maps, reports, insights)
- **Design assets** (icons, illustrations, stock photos, capability logos)
- **Style dictionaries** and other design system artifacts
- **Applications** that use the design system

Each workspace has:
- A unique ID and URL-friendly slug
- An owner (user who created it)
- Members with assigned roles
- Settings for sharing and collaboration
- Analytics and metrics specific to that workspace

## Workspace-Protected Resources

The following resources are scoped to and protected by workspaces:

### Design System Resources
- **Components** - UI components and their variants
- **Design Tokens** - Colors, spacing, typography, etc.
- **Fonts** - Font families and configurations
- **Assets** - Images, icons, illustrations, logos
- **Style Dictionaries** - Token collections in various formats

### Research & HCD Resources
- **Reviews** - Design reviews and feedback
- **Session Replays** - User session recordings
- **Journey Maps** - User journey visualizations
- **HCD Reports** - Human-centered design reports (usability, accessibility, heuristic evaluations)
- **User Personas** - User persona definitions
- **Research Artifacts** - Interviews, surveys, observations, workshops
- **Insights** - User needs, pain points, opportunities, findings

### Design Assets
- **Patterns** - Design patterns and guidelines
- **Icons** - Icon sets and individual icons
- **Interactives** - Prototypes, demos, sandboxes
- **Stock Photos** - Stock photography library
- **Illustrations** - Illustration library
- **Capability Logos** - Service and capability logos

### Guidelines & Standards
- **Guidelines** - Design guidelines, standards, and best practices (design, accessibility, content, interaction, visual, technical)

### Other Resources
- **Applications** - Applications registered to use the design system
- **Analytics** - Workspace-specific metrics and analytics

## How Workspace Protection Works

### Access Control Model

Workspaces use a **role-based access control (RBAC)** system with four permission levels:

#### 1. Owner
- **Full control** over the workspace
- Can add/remove members
- Can change member roles
- Can delete the workspace
- Can manage all resources
- Cannot be removed from the workspace

#### 2. Admin
- Can manage workspace resources
- Can add/remove members (except owner)
- Can change member roles (except owner)
- Can share resources with other workspaces
- Can make resources global

#### 3. Editor
- Can create, edit, and delete resources
- Can share resources with other workspaces
- Cannot manage workspace members
- Cannot change workspace settings

#### 4. Viewer
- **Can view and use** all workspace resources (read-only access)
- **Can access** shared and global resources from other workspaces
- **Can use** resources in their work (e.g., use components, reference tokens, view guidelines)
- **Cannot create, edit, or delete** any resources
- **Cannot share** resources with other workspaces
- **Cannot manage** workspace members or settings
- **Perfect for**: Stakeholders, external collaborators, or team members who need access to resources but shouldn't modify them

**Use Cases for Viewer Role**:
- Product managers who need to see components but shouldn't modify them
- External contractors who need access to design system resources
- Stakeholders who need visibility into workspace content
- Team members who consume resources but don't create them

### Resource Access Rules

When a user attempts to access a workspace resource, the system checks:

1. **Workspace Membership**: Is the user a member of the workspace?
2. **Required Role**: Does the user have the required role for the operation?
   - **View operations** (GET): Requires Viewer role or higher
   - **Create operations** (POST): Requires Editor role or higher
   - **Update operations** (PUT/PATCH): Requires Editor role or higher
   - **Delete operations** (DELETE): Requires Editor role or higher
   - **Share operations**: Requires Editor role or higher
   - **Make Global operations**: Requires Admin role or higher
   - **Member management**: Requires Admin role or higher
3. **Resource Ownership**: Does the resource belong to the workspace?
4. **Sharing Status**: Is the resource shared with the user's workspace or marked as global?

### Viewer Role Capabilities

**What Viewers CAN Do**:
- ✅ View all workspace resources (components, tokens, fonts, assets, etc.)
- ✅ Access shared resources from other workspaces
- ✅ Access global resources
- ✅ Use resources in their work (copy code, reference tokens, view documentation)
- ✅ View workspace analytics and metrics
- ✅ See workspace members and their roles

**What Viewers CANNOT Do**:
- ❌ Create new resources
- ❌ Edit existing resources
- ❌ Delete resources
- ❌ Share resources with other workspaces
- ❌ Make resources global
- ❌ Add or remove workspace members
- ❌ Change workspace settings
- ❌ Change member roles

### Protection Mechanisms

#### 1. Workspace Scoping
- Resources are created with a `workspaceId` that ties them to a specific workspace
- Only members of that workspace can access the resource by default
- Resources cannot be accessed by users outside the workspace unless explicitly shared

#### 2. Access Verification
- Every API request verifies workspace membership
- The system checks if the user has the required role for the operation
- Access is denied if the user is not a member or lacks permissions

#### 3. Resource Filtering
- When listing resources, the system automatically filters to show only:
  - Resources belonging to the user's workspace
  - Resources shared with the user's workspace
  - Global resources (available to all workspaces)

## Team-to-Team Sharing

Workspaces enable teams to share resources with other teams while maintaining ownership and control. This is essential for cross-team collaboration, knowledge sharing, and maintaining consistency across the organization.

### How Team-to-Team Sharing Works

When Team A shares a resource with Team B:

1. **Team A maintains ownership** - The resource remains in Team A's workspace
2. **Team B gains access** - Team B's workspace members can view and use the resource
3. **Team A controls sharing** - Team A can unshare the resource at any time
4. **Resource appears in both workspaces** - The resource shows up in Team B's resource lists with a "Shared" indicator

### Sharing Scenarios

#### Scenario 1: Sharing a Component
**Team A (Product Team)** creates a new button component and wants **Team B (Marketing Team)** to use it:

1. Product Team creates the component in their workspace
2. Product Team clicks "Share" on the component
3. Product Team selects "Marketing Team" workspace
4. Marketing Team members can now see and use the component
5. Component appears in Marketing Team's component list with "Shared from Product Team" label

#### Scenario 2: Sharing Research Findings
**Team A (UX Research)** conducts user interviews and wants to share findings with **Team B (Product Team)** and **Team C (Design Team)**:

1. UX Research creates interview artifacts in their workspace
2. UX Research shares artifacts with both Product and Design team workspaces
3. Both teams can access the research without cluttering their own workspaces
4. UX Research maintains a centralized research repository

#### Scenario 3: Sharing Guidelines
**Team A (Design System Team)** creates accessibility guidelines and shares with all product teams:

1. Design System Team creates guidelines in their workspace
2. Design System Team shares with multiple product team workspaces
3. All product teams have access to the guidelines
4. Design System Team can update guidelines and all teams see updates

### Benefits of Team-to-Team Sharing

- **Knowledge Sharing**: Teams can learn from each other's work
- **Consistency**: Shared resources ensure consistency across teams
- **Efficiency**: Avoid duplicating work across teams
- **Centralized Management**: One team maintains resources, others consume
- **Flexible Access**: Teams can access resources without full workspace membership

## Sharing Mechanisms

Workspaces support three levels of resource sharing:

### 1. Workspace-Scoped (Default)
- Resource belongs to a single workspace
- Only members of that workspace can access it
- Most secure and private option
- Use for team-specific resources

**Example**: A component created in the "Marketing Team" workspace is only visible to Marketing Team members.

### 2. Shared with Specific Workspaces (Team-to-Team Sharing)
- Resource owner can share with one or more specific workspaces (teams)
- Members of those workspaces gain access to view and use the resource
- Owner maintains control and can unshare at any time
- Resource appears in both the owner's workspace and shared workspaces
- Use for cross-team collaboration and knowledge sharing

**How to Share**:
1. Navigate to the resource in your workspace
2. Click "Share" button
3. Select target workspace(s) from the list (you can select multiple teams)
4. Confirm sharing
5. Resource becomes accessible to all members of selected workspaces

**Example**: The "Product Team" shares a new button component with "Marketing Team" and "Engineering Team" for feedback. Both teams can now see and use the component, but Product Team maintains ownership and can unshare it at any time.

**Visual Indicators**:
- Shared resources show a "Shared" badge in the resource list
- Resources show which workspace they're shared from
- Workspace owners can see which resources they've shared and with whom

### 3. Global Resources
- Resource is available to **all workspaces** in the platform
- Any workspace member can access it
- Typically used for platform-wide design system resources
- Requires admin or owner permissions to make global

**How to Make Global**:
1. Navigate to the resource in your workspace
2. Click "Make Global" button
3. Confirm the action

**Example**: Core design tokens (colors, spacing) are made global so all teams use the same foundation.

## Sharing Workflow

### Sharing a Resource (Team-to-Team)

```
1. Resource Owner (Admin/Editor) in Team A
   ↓
2. Select resource to share
   ↓
3. Choose target workspace(s) - Team B, Team C, etc.
   ↓
4. Resource becomes accessible to target workspace members
   ↓
5. Resource appears in Team B/C's workspace with "Shared" indicator
   ↓
6. Team B/C members can view/use the resource
   ↓
7. Team A maintains ownership and can unshare at any time
```

### Unsharing a Resource

```
1. Resource Owner (Admin/Editor)
   ↓
2. Navigate to shared resource
   ↓
3. Click "Unshare" and select workspace(s)
   ↓
4. Resource is removed from target workspace(s)
   ↓
5. Target workspace members lose access
```

### Making a Resource Global

```
1. Resource Owner (Admin/Owner)
   ↓
2. Navigate to resource
   ↓
3. Click "Make Global"
   ↓
4. Resource becomes available to all workspaces
   ↓
5. All workspace members can access it
```

## Use Cases

### Use Case 1: Team Isolation
**Scenario**: Marketing team wants to work on campaign-specific components without exposing them to other teams.

**Solution**: 
- Create a "Marketing Campaigns" workspace
- Create components with workspace scope
- Only Marketing team members can access
- Resources remain private until ready to share

### Use Case 2: Cross-Team Collaboration (Team-to-Team Sharing)
**Scenario**: Product team creates a new component and wants feedback from Design and Engineering teams.

**Solution**:
- Product team creates component in their workspace
- Product team shares component with "Design Team" and "Engineering Team" workspaces
- Both teams can view and provide feedback
- Component appears in all three team workspaces (Product, Design, Engineering)
- Product team maintains ownership and control
- Product team can unshare if needed

**Benefits**:
- Design and Engineering teams don't need to be members of Product workspace
- Product team maintains control over the component
- All teams can collaborate without workspace membership overhead

### Use Case 3: Platform-Wide Standards
**Scenario**: Design system team wants to establish core tokens that all teams must use.

**Solution**:
- Design system team creates tokens in their workspace
- Makes tokens global
- All workspaces automatically have access
- Ensures consistency across the platform

### Use Case 4: Research Artifact Management (Team-to-Team Sharing)
**Scenario**: UX research team conducts user interviews and wants to share findings with specific product teams.

**Solution**:
- Research team creates interview artifacts in their workspace
- Research team shares artifacts with relevant product team workspaces (e.g., "Product Team A", "Product Team B")
- Product teams can access research without cluttering their workspace
- Research team maintains centralized research repository
- Research team can update artifacts and all shared teams see updates

**Benefits**:
- Centralized research management
- Teams only see research relevant to them
- Research team maintains single source of truth

### Use Case 5: Viewer Role for Stakeholders
**Scenario**: Product managers and stakeholders need to see design system components and guidelines but shouldn't be able to modify them.

**Solution**:
- Add product managers and stakeholders to workspace with **Viewer** role
- Viewers can see all workspace resources (components, tokens, guidelines, etc.)
- Viewers can use resources in their work (copy component code, reference tokens)
- Viewers cannot create, edit, or delete any resources
- Viewers cannot share resources or manage workspace members

**Benefits**:
- Stakeholders have visibility into design system without modification risk
- No accidental changes to critical design system resources
- Clear separation between consumers (Viewers) and creators (Editors/Admins)
- Enables external contractors or consultants to access resources without edit permissions

## Best Practices

### 1. Workspace Organization
- **Create workspaces by team or project**: Keep related resources together
- **Use descriptive names**: Make workspace purpose clear
- **Limit workspace size**: Too many members can reduce security and clarity

### 2. Resource Sharing (Team-to-Team)
- **Start private, share when needed**: Default to workspace-scoped resources
- **Share strategically**: Only share resources that other teams genuinely need
- **Document sharing decisions**: Note why resources are shared and with which teams
- **Regularly review shared resources**: Unshare resources no longer needed by other teams
- **Communicate sharing**: Notify teams when you share resources with them
- **Respect team boundaries**: Don't share resources without a clear need or permission
- **Monitor shared access**: Track which teams are using your shared resources

### 3. Access Control
- **Principle of least privilege**: Give users the minimum role needed
  - Use **Viewer** role for stakeholders and consumers who only need to see/use resources
  - Use **Editor** role for team members who create and modify resources
  - Use **Admin** role sparingly, only for those who need member management
  - **Owner** role should be limited to workspace creators or team leads
- **Regular access reviews**: Audit workspace membership periodically
- **Owner management**: Ensure each workspace has an active owner
- **Viewer role benefits**: 
  - Allows stakeholders to access resources without modification risk
  - Enables external collaborators to view workspace content
  - Provides read-only access for team members who consume but don't create

### 4. Global Resources
- **Use sparingly**: Only make resources global when truly needed platform-wide
- **Establish governance**: Define who can make resources global
- **Document global resources**: Maintain a list of global resources and their purposes

## API Examples

### Creating a Workspace-Scoped Resource

```typescript
// Component belongs only to workspace-123
POST /api/v1/workspaces/workspace-123/components
{
  "name": "CampaignButton",
  "description": "Marketing campaign button",
  "workspaceId": "workspace-123",
  "isGlobal": false
}
```

### Sharing a Resource (Team-to-Team)

```typescript
// Team A (workspace-123) shares component with Team B (workspace-789) and Team C (workspace-101)
POST /api/v1/workspaces/workspace-123/components/comp-456/share
{
  "workspaceIds": ["workspace-789", "workspace-101"],
  "requestingWorkspaceId": "workspace-123"
}

// Response: Component is now accessible to members of workspace-789 and workspace-101
// Component appears in their workspace resource lists with sharing metadata
```

### Accessing Shared Resources from Another Team

```typescript
// Team B (workspace-789) gets all components available to them
// This includes: their own components + shared components + global components
GET /api/v1/workspaces/workspace-789/components?userId=user-456

// Response includes:
// - Components from workspace-789
// - Components shared from workspace-123 (Team A)
// - Global components
```

### Making a Resource Global

```typescript
// Make token available to all workspaces
POST /api/v1/workspaces/workspace-123/tokens/token-789/make-global
{
  "requestingWorkspaceId": "workspace-123"
}
```

### Accessing Shared Resources

```typescript
// Get all tokens available to workspace (own + shared + global)
GET /api/v1/workspaces/workspace-789/tokens?userId=user-123

// Response includes:
// - Tokens from workspace-789
// - Tokens shared with workspace-789
// - Global tokens
```

## Security Considerations

### 1. Access Verification
- All API endpoints verify workspace membership
- Users cannot access resources from workspaces they don't belong to
- Role checks prevent unauthorized operations

### 2. Resource Ownership
- Only workspace owners/admins can share resources
- Only resource owners can unshare or make global
- Shared resources maintain original workspace ownership

### 3. Data Isolation
- Workspace data is logically separated
- No cross-workspace data leakage
- Global resources are explicitly marked and tracked

### 4. Audit Trail
- Workspace membership changes are tracked
- Resource sharing actions are logged
- Global resource creation is recorded

## Troubleshooting

### "Access Denied" Error
**Problem**: User cannot access a resource

**Solutions**:
1. Verify user is a member of the workspace
2. Check user's role has required permissions
3. Confirm resource is shared with user's workspace (if applicable)
4. Verify resource is global (if expecting platform-wide access)

### Resource Not Visible
**Problem**: Resource exists but doesn't appear in list

**Solutions**:
1. Check resource belongs to current workspace
2. Verify resource is shared with current workspace
3. Confirm resource is global (if applicable)
4. Check user has viewer role or higher

### Cannot Share Resource
**Problem**: Share button is disabled or operation fails

**Solutions**:
1. Verify user has Editor or Admin role
2. Confirm resource belongs to user's workspace
3. Check target workspace exists
4. Ensure user has permission to share

## Team-to-Team Sharing Best Practices

### When to Share
- **Share components** when other teams need to use them
- **Share research** when findings are relevant to other teams
- **Share guidelines** when standards should be followed across teams
- **Share patterns** when design patterns should be consistent
- **Share tokens** when design system foundation should be shared

### When NOT to Share
- **Don't share** experimental or work-in-progress resources
- **Don't share** team-specific resources that won't benefit others
- **Don't share** without clear purpose or need
- **Don't share** sensitive or confidential resources

### Sharing Etiquette
1. **Communicate first**: Let teams know you're sharing resources with them
2. **Provide context**: Explain why the resource is being shared
3. **Set expectations**: Clarify how the resource should be used
4. **Be responsive**: Answer questions about shared resources
5. **Update responsibly**: Notify teams of significant changes to shared resources

### Managing Shared Resources
- **Regular audits**: Review what you've shared and with whom
- **Clean up**: Unshare resources no longer needed
- **Documentation**: Keep notes on why resources are shared
- **Version control**: Consider versioning for shared resources
- **Feedback loop**: Gather feedback from teams using your shared resources

## Role Selection Guide

### When to Use Each Role

**Viewer Role** - Use when:
- User needs to see and use resources but shouldn't modify them
- Stakeholders need visibility into workspace content
- External contractors need access to design system resources
- Team members consume resources but don't create them
- You want read-only access for documentation or reference purposes

**Editor Role** - Use when:
- User creates and modifies workspace resources
- User needs to share resources with other teams
- User is an active contributor to the design system
- User doesn't need member management capabilities

**Admin Role** - Use when:
- User needs to manage workspace members
- User needs to change member roles
- User manages workspace settings
- User is a team lead or workspace manager

**Owner Role** - Use when:
- User created the workspace
- User is the primary workspace administrator
- User needs full control including workspace deletion
- User is the team lead or design system owner

## Summary

Workspaces provide:
- **Isolation**: Team resources are protected and private by default
- **Team-to-Team Collaboration**: Resources can be shared with specific workspaces (teams) while maintaining ownership
- **Consistency**: Global resources ensure platform-wide standards
- **Control**: Role-based access control provides fine-grained permissions with four roles (Owner, Admin, Editor, Viewer)
- **Flexibility**: Resources can move from private → shared → global as needed
- **Viewer Access**: Read-only access for stakeholders and consumers who need to use resources without modification risk

The workspace system balances security, collaboration, and flexibility, allowing teams to work independently while enabling cross-team collaboration when needed. Team-to-team sharing enables knowledge transfer, consistency, and efficient resource management across the organization. The Viewer role ensures stakeholders and consumers can access and use workspace resources without the risk of accidental modifications.

