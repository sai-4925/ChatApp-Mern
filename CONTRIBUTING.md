# Contributing to ChatApp

Thanks for your interest in contributing! This document explains the workflow
for proposing changes.

## Getting Started

1. Fork the repository and clone your fork.
2. Install dependencies in both `backend/` and `frontend/`:
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```
3. Copy `.env.example` to `.env` in both folders and fill in your own values.
4. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Branch Naming

- `feature/*` — new functionality
- `fix/*` — bug fixes
- `chore/*` — tooling, config, dependency bumps
- `docs/*` — documentation only

## Commit Messages

This project follows [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add typing indicator to group chats
fix: correct unread badge count on archive
docs: update deployment instructions
```

## Pull Request Checklist

- [ ] Code follows the existing MVC structure and naming conventions
- [ ] `npm run lint` passes with no errors
- [ ] `npm test` passes (backend)
- [ ] New environment variables are added to `.env.example`
- [ ] README/docs updated if behavior or setup changed

## Code Style

- No TypeScript — plain JavaScript (ES2022+) only
- Prefer `async/await` over `.then()` chains
- Keep controllers thin; put business logic in `services/`
- Comment only where intent isn't obvious from the code itself

## Reporting Bugs

Open an issue with steps to reproduce, expected vs actual behavior, and
environment details (OS, Node version, browser).
