# Argos API integration

The workbench reads visual regression builds from [Argos](https://argos-ci.com) through its REST API v2. The client is `ArgosApiClient` in `backend/src/visual-regression/argos-api.client.ts`; `VisualRegressionService` uses it.

## Configuration

Each project stores:

| Field | Notes |
| --- | --- |
| `argosProjectId` | The Argos project as `owner/project` (account slug and project name), for example `acme/web`. Anything else is rejected. |
| `argosToken` | A project token or a personal access token. Stored encrypted (`ENCRYPTION_KEY`) and never returned. Reviews (approve or reject) need a personal access token with review access; a project token can only read. |
| `argosBaseUrl` | Optional, for a self-hosted Argos. Defaults to `ARGOS_BASE_URL`, else `https://api.argos-ci.com/v2`. `https://app.argos-ci.com` and `https://api.argos-ci.com` are read as the hosted API. |
| `argosBranch` | What builds compare against when no baseline is recorded. |

Environment variables:

- `ARGOS_BASE_URL`: the default Argos API URL.
- `ARGOS_ALLOWED_BASE_URLS`: comma-separated Argos URLs projects may use, besides the default URL (always allowed). A self-hosted Argos must be listed here or be the default; other URLs are refused.

Creating a project, or changing its Argos project, token or URL, checks the token by reading the Argos project: `401`/`403` means Argos refused the token, `404` that the token can't see that project, no answer that Argos is unreachable. Each case returns its own message.

## Argos endpoints used

All under the API URL, with `Authorization: Bearer <token>`:

| Call | Used for |
| --- | --- |
| `GET /projects/{owner}/{project}` | Verifying the token and project |
| `GET /projects/{owner}/{project}/builds?page&perPage` | Reading recent builds into runs (30 at a time) |
| `GET /projects/{owner}/{project}/builds/{number}` | Refreshing one build |
| `GET /projects/{owner}/{project}/builds/{number}/diffs?page&perPage=100` | A finished build's screenshots, as the run's results |
| `POST /projects/{owner}/{project}/builds/{number}/reviews` | Recording an approve (`APPROVE`) or reject (`REQUEST_CHANGES`) on one screenshot |

Nothing creates builds: Argos builds come from uploading screenshots with the Argos CLI in CI. See [ARGOS_CI_CD_INTEGRATION.md](ARGOS_CI_CD_INTEGRATION.md).

## When builds are read

- Listing a project's runs reads its builds from Argos, at most every 15 seconds per project. If Argos can't be reached, the stored runs are returned.
- Opening a run's results refreshes that build.
- A signed build notification from CI (`POST /api/v1/visual-regression/webhooks/argos`) reads the build at once. Argos itself sends no webhooks.

A build's diffs are fetched once it has finished, and again if its status changes. Reviews recorded in the workbench are kept when the diffs are re-read.

## Status mapping

Argos build status to run `status`:

| Argos | Run |
| --- | --- |
| `pending` | `pending` |
| `progress` | `running` |
| `no-changes`, `changes-detected`, `accepted`, `rejected` | `completed` |
| `error`, `aborted`, `expired` | `failed` |

The Argos status is kept on the run as `argosStatus`.

Argos diff status to result `status`:

| Argos | Result |
| --- | --- |
| `unchanged`, `ignored` | `passed` |
| `added` | `new` |
| `removed` | `removed` |
| `changed`, `failure`, `retryFailure`, `pending` | `failed` |

Image URLs from Argos are used as given (relative ones are resolved against the API URL).

## Troubleshooting

- **"Argos refused the token"**: the token is wrong, revoked, or for another project.
- **"Argos has no project … that this token can see"**: check the `owner/project` spelling and that the token belongs to that account.
- **"Argos base URL … is not allowed"**: an administrator must add the URL to `ARGOS_ALLOWED_BASE_URLS`.
- **"Argos refused the review"**: reviews need a personal access token; replace the project token in the project's settings.
- **No runs**: no screenshots have been uploaded to that Argos project yet, or CI uploads to a different one.
