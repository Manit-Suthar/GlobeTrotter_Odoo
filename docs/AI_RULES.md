# AI Coding Rules

Any AI coding agent (e.g., Gemini, Copilot) working on this repository must strictly adhere to the following rules:

1. **Read Docs First**: Before coding a feature, read `PRD.md`, `ARCHITECTURE.md`, `DATA_MODEL.md`, and `API_CONTRACT.md`.
2. **Respect the Contract**: Treat the PRD, Data Model, API Contract, and Architecture as source of truth. Never silently change a contract.
3. **No Scope Creep**: Do not implement features outside the defined MVP unless instructed.
4. **Security First**: 
   - NEVER expose secrets. 
   - NEVER put Gemini API keys or Database URLs in frontend code.
   - Use environment variables strictly.
5. **Separation of Concerns**:
   - Keep business logic out of React components. Use hooks/services.
   - Keep database queries out of FastAPI route functions when possible; delegate to services/repositories.
   - The frontend MUST NOT access PostgreSQL directly.
6. **Code Quality**:
   - Validate all external input (Pydantic in backend, Zod/Yup in frontend if used).
   - Reuse existing code and components.
   - Avoid unnecessary dependencies (`npm install` or `pip install` only what is strictly needed).
7. **Process**:
   - Run appropriate builds/tests before declaring work complete.
   - Keep changes small and reviewable.
   - Do not overwrite or rewrite another developer's assigned feature branch.
8. **Communication**: Explain any contract changes (if absolutely necessary and requested by the user) before making them.
