# Developer & GPT Guidelines

This document defines rules and conventions for anyone (including GPT‑based assistants) working on the StoryNet codebase. It should be read **before** beginning any task or issue to ensure consistency.

## General Rules
1. **Read the docs first** – the module files in `docs/` contain up‑to‑date information about components and features. If you encounter missing or incorrect information, update the appropriate document immediately.
2. **Follow semantic versioning** when bumping versions in `package.json` (if applicable).
3. **Write clear commit messages** describing the change at a glance, e.g. `fix(canvas): correct snapping logic` or `feat(characters): add alias parsing`.
4. **Create a new branch** for every bugfix or feature, open a pull request against `main` and request at least one review.
5. **After fixing an issue or bug** run the app locally to verify, update or add tests if possible, then commit and **push** to GitHub. Do not leave local changes unpushed.
6. **Keep docs in sync** – whenever code is modified in a way that affects behavior, the corresponding Markdown file must be edited.
7. **Less is more** in documentation – only necessary, accurate information should be included. Remove outdated docs or mark them as deprecated.
8. **Modular documentation** – add a new Markdown file in `docs/` for each high‑level module, and link it from `docs/README.md` or `PROJECT_OVERVIEW.md`.

## Coding Conventions
- Use TypeScript types wherever possible (the project mixes `.tsx` and `.jsx` but new code should prefer `.tsx`).
- Keep styling self‑contained in components (either styled‑components or tailwind classes).
- Avoid inline `any`; define proper interfaces.
- Use descriptive variable names: `offset`, `panStart`, `connectingFrom`, etc.
- Factor out shared logic when it benefits clarity (e.g., connection point calculation).

## Working with GPT assistants
- GPTs should always start by opening and reading `DEVELOPER_GUIDELINES.md` and the relevant module documentation.
- When asked to implement changes, verify the current behavior by examining the source code rather than relying solely on existing docs.
- On completion, add or update documentation describing the change and include any new user‑visible behavior in the appropriate module file.
- GPTs must not commit code themselves, but should output diffs or file modifications for human review.
- Encourage human reviewers to double‑check logic, styling, and performance impacts.

## Workflow Highlights
1. **Issue assigned** → read docs & review existing code
2. **Implement change** → test manually in the running app
3. **Update or create docs** to reflect the change
4. **Commit & push** to GitHub with a meaningful message
5. **Open a PR** and link to the issue
6. **Respond to review feedback** promptly

## Keyboard Shortcuts & Testing Tips
- `npm run dev` starts the Vite development server at `localhost:5173`.
- Use browser dev tools to inspect canvas coordinates and elements.
- When modifying keyboard handlers or mouse interactions, test on multiple screen sizes.

> _Following these guidelines keeps the project maintainable and makes collaboration smooth. Thank you for contributing!_