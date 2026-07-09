---
name: verify-ui
description: Validate UI changes with Playwright, console/network checks, responsive layouts, and axe.
---

# Verify UI

1. Start web and API with `pnpm dev` or rely on Playwright `webServer`.
2. Exercise the affected pages and primary user flow.
3. Check the browser console for errors.
4. Check required network requests for failures.
5. Verify loading, success, and error states.
6. Test desktop and mobile viewports.
7. Run axe accessibility checks for the changed screens.
8. Keep screenshots and traces for failures.
9. Report findings with repro steps when issues remain.
