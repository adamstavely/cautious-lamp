# Component request workflow

People ask for new components, vote and comment on requests, and design system maintainers triage them through review, approval, the roadmap and delivery. This describes what is built and what is still open.

## Where it lives

| Part | Location |
| --- | --- |
| Backend | `backend/src/component-requests/` (`ComponentRequestsService`, controller, strict DTOs) |
| Storage | Elasticsearch: `design-system-component-requests` (requests, with voters and status history) and `design-system-component-request-comments`. No seed data. |
| Frontend | `/feedback` (`RoadmapFeedback.vue`), tab **Feedback and requests**, sub-tab **Feature requests**, which renders `frontend/src/components/feedback/ComponentRequests.vue`. `/roadmap` and `/components/feedback` redirect there. |

There is one store and one API. The old in-memory stores and `/api/v1/requests` were removed in #57.

## Who can do what

Every route needs a signed-in user or API key.

- **Anyone signed in** can list and read requests, submit one, vote and comment. The author (`requestedBy`, `requestedByName`) and comment author always come from the caller's credential, never from the body; unknown fields are rejected.
- **The author** can edit the title, description and use case, and delete the request, while it is open (`submitted`, `under-review` or `needs-more-info`).
- **`roadmap:edit` holders** triage: status, approvals, rejection, priority, assignment, promotion and linking a component. They can also delete any request. The frontend shows these actions to the same people.

Voting is one vote per person; voting again takes it back.

## API

All under `/api/v1/component-requests`.

| Method and path | Who | Notes |
| --- | --- | --- |
| `GET /` | signed in | Filters: `status`, `category`, `priority`, `assignedTo`, `requestedBy`, `componentId` |
| `GET /analytics` | signed in | See below |
| `GET /duplicates?title=&description=` | signed in | `{ isDuplicate, similar: [{ id, title, similarity, status }] }` |
| `GET /:id` | signed in | The request with its comments |
| `POST /` | signed in | `{ title, description, category, useCase?, priority? }`. When similar requests exist the answer is `{ duplicateWarning: true, similarRequests, request }`; the request is created either way. |
| `PUT /:id` | author, while open | `{ title?, description?, useCase? }` |
| `DELETE /:id` | author while open, or `roadmap:edit` | Deletes its comments too |
| `POST /:id/vote` | signed in | Toggles the caller's vote |
| `GET`, `POST /:id/comments` | signed in | `POST` takes `{ content }` |
| `PATCH /:id/status` | `roadmap:edit` | `{ status, comment? }`, checked against the transitions below |
| `PATCH /:id/priority` | `roadmap:edit` | `low`, `medium`, `high`, `critical` |
| `POST`, `DELETE /:id/assign` | `roadmap:edit` | `POST` takes `{ userId }` of an existing user |
| `POST /:id/approve` | `roadmap:edit` | `{ stage? }`: `design`, `technical` or `final` |
| `POST /:id/reject` | `roadmap:edit` | `{ reason }` |
| `POST /:id/promote` | `roadmap:edit` | `{ componentId }`: links an approved request to its component and moves it to `in-progress` |
| `POST /:id/link-component`, `/unlink-component` | `roadmap:edit` | Linking an `in-progress` request completes it |

## Statuses

```
submitted       -> under-review, rejected
under-review    -> approved, rejected, needs-more-info
needs-more-info -> under-review, rejected
approved        -> in-progress, rejected
in-progress     -> completed, rejected
completed       -> released
released, rejected: final
```

Every change is kept in `statusHistory` with who made it (`system` for automatic ones).

## Approval

Approval has three stages. Without `stage`, the next missing one is approved: design, then technical, then final. The first design or technical approval moves a `submitted` request to `under-review`. Final approval needs both earlier approvals and the request to be `under-review`, and moves it to `approved`. Rejection records the reason and clears the design and technical approvals.

## Roadmap and components

- **Roadmap.** When a request becomes `approved` it gets a roadmap item once: same title, the description (or use case), category `feature`, priority mapped (`critical` becomes `high`), status `planned`. The item id is stored in `metadata.roadmapItemId`. If creating the item fails, the approval stands and the failure is logged.
- **Components.** Creating a component (`POST /api/v1/components`) links it to a request: the one named by `linkedRequestId`, or else the best title match among unlinked `approved` and `in-progress` requests (highest priority, then newest). An `approved` request moves to `in-progress`, an `in-progress` one to `completed`. Maintainers can also promote, link and unlink by hand.

## Notifications

Request events go through the notification service: the author when someone else changes their request, the assignee when assigned, the author and assignee on a new comment (not the commenter), and voters when a request they voted on is approved, rejected, completed or released. They appear in the app and, for people who have turned them on, by email, Slack, Teams or webhook ([NOTIFICATIONS.md](NOTIFICATIONS.md)).

## Duplicates and analytics

- **Duplicates.** Title and description are compared with every request by Levenshtein similarity (title 70%, description 30%). Matches of 70% or more are returned; `isDuplicate` is true when the best is 90% or more. The form checks before submitting and asks whether to submit anyway.
- **Analytics.** `totalRequests`, `requestsByStatus`, `requestsByPriority`, `requestsByCategory`, `averageTimeToApproval`, `averageTimeToCompletion` (milliseconds), `fulfillmentRate` (percent approved or later), `topRequesters` (top 10) and `requestsOverTime` (the last 30 days).

## Not built

- Automatic approval by vote count, or automatic assignment by category.
- Closing a request automatically when its component is released (`completed` to `released` is a manual status change).
- Scaffolding a component automatically on approval.
- Mentions, threaded comments and attachments.
- Request templates by type, and merging or linking duplicate requests.
- Due dates and workload views for assignees.
