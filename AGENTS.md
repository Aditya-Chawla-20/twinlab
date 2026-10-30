# TwinLab repository

Read PRODUCT.md and specs/ARCHITECTURE.md before changing the measurement pipeline. Keep meaningful decisions, steps and check results in specs/PROGRESS.md and specs/VERIFICATION.md. The project-specific skill is .agents/skills/twinlab/SKILL.md.

Paid tests normally remain user-triggered. On 2026-10-30 the user explicitly authorized agent testing with a cumulative $10 ceiling. Use only the persistent capped runner in scripts/meta-live-test.ts for this authorization; do not reset its budget ledger, expose credentials, or expand the scope to other services. Ordinary QA stays offline with injected transport; never present synthetic points as physical evidence.

Use original application code, native browser controls and small existing dependencies. Run npm run check after behavioral changes. Public repository: https://github.com/Aditya-Chawla-20/twinlab. User authorized creating it publicly and pushing this project. Public application hosting remains separate; the paid backend is local-only.
