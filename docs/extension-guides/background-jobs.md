# Background Jobs Extension Guide

The base template does not include a job runner.

## When to add jobs

Use background jobs for slow work, retries, schedules, or async pipelines.

## Recommended approach

1. Keep job producers in the API layer.
2. Run workers as a separate process or container.
3. Share contracts for job payloads when needed.
4. Make jobs idempotent.
5. Add observability: job name, status, retry count, correlation ID.

## Deployment

- Do not run long work inside HTTP request handlers.
- Scale workers independently from web and API services.
