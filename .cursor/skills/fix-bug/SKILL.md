---
name: fix-bug
description: Reproduce, test, and fix a bug with minimal scope in the fullstack template.
---

# Fix Bug

1. Reproduce the issue and capture expected vs actual behavior.
2. Identify the root cause, not just the symptom.
3. Add a failing test when practical.
4. Apply the smallest fix that addresses the root cause.
5. Confirm the test passes and run related regression tests.
6. Run `pnpm verify` or `pnpm verify:full` as appropriate.
7. Explain the root cause and why the fix is safe.
