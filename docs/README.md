# StoryNet Documentation

This folder is organized one file per module, so a task can be routed straight to the relevant doc without reading the whole codebase. Frontend feature modules, the auth/persistence layer, and the backend/DB layer are kept separate; update the relevant file whenever the behavior it describes changes (see [Developer & GPT Guidelines](./DEVELOPER_GUIDELINES.md)).

## Core Documents

- [Project Overview](./PROJECT_OVERVIEW.md) – high-level description, tech stack, and repo structure
- [Canvas Module](./CANVAS_MODULE.md) – pan/zoom surface, elements, dark mode, mobile/touch
- [Text & Page Module](./TEXT_MODULE.md) – how page/text content is actually edited
- [Connections Module](./CONNECTIONS_MODULE.md) – page linking behavior
- [Characters Module](./CHARACTERS_MODULE.md) – character management and highlighting
- [Auth & Projects/Home Module](./AUTH_HOME_MODULE.md) – login, project list, create/open/delete, auto-save
- [Backend/Database Module](./BACKEND_MODULE.md) – Supabase schema, RPC functions, security model
- [Developer & GPT Guidelines](./DEVELOPER_GUIDELINES.md) – rules for contributors and assistants
- [User Guide](./user-guide.md) – end-user walkthrough (not developer-facing)

## Quick Start

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd storynet
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env.local` and fill in your **anon/public** Supabase key (not `service_role` — see [Backend/Database Module](./BACKEND_MODULE.md)):
   ```bash
   cp .env.example .env.local
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

Navigate through the module files above for detailed information about each feature and its implementation.
