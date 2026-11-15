# CI/CD integration: Argos visual regression

This guide moved to [ARGOS_CI_CD_INTEGRATION.md](./ARGOS_CI_CD_INTEGRATION.md).

In short: Argos builds come from screenshot uploads, so the workbench never starts one. Copy the Playwright config, screenshot helper and `npx @argos-ci/cli upload` command from the project's **CI setup** tab (`GET /api/v1/visual-regression/projects/:id/ci-setup`) into your CI, with `ARGOS_TOKEN` set. Builds then appear under the project's test runs. A signed build notification and a `jq -e` gate on `GET .../projects/:id/runs` are optional; both are described in the full guide.

## Related

- [Visual regression service](./ARGOS_VISUAL_REGRESSION_SERVICE.md)
- [Argos API integration](./ARGOS_API_INTEGRATION.md)
- [Getting started with visual regression](./GETTING_STARTED_VISUAL_REGRESSION.md)
