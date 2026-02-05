# Security

## Guardrails
- Device allowlist from `apps/api/devices.yml` only.
- Command policy: allowlist for read-only commands, denylist for risky commands.
- Audit logging to stdout and `data/audit.log` (JSONL).

## Credential Handling
- V1 uses global environment variables:
  - `SSH_PRIVATE_KEY_PATH`
  - `SSH_PASSWORD`
- Secrets are never sent to the browser.

## Recommended Next Steps
1) Per-user identity and RBAC.
2) SSH certificates or short-lived credentials.
3) Approval workflow for high-impact commands.
4) Per-device and per-user audit retention.