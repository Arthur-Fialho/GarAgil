# Project Context: GarAgil

**Author:** Arthur Fialho
**Description:** SaaS for auto repair shop management (blending "garage" with "agility" for time optimization).
**Core Focus:** TDD, Scalability, Security, and AI Integration.

> ⚠️ **IMPORTANT LOCALE NOTE:** > Although this system prompt, codebase architecture, and backend logic are documented in English, the application will be used exclusively by Brazilian auto repair shops. Therefore, **all Frontend UI/UX elements, customer communications (WhatsApp/Emails), database seed data, and generated documents (invoices, receipts) MUST be strictly in Brazilian Portuguese (pt-BR).**

---

## 🎯 Global AI Behavior Guidelines

When acting on this project, you (the AI) must operate under the following strict rules:

1. **Explicit Permission & Step-by-Step Execution:** Do not rush or execute multiple complex steps at once. Before writing significant code, generating files, or modifying the architecture, you must outline your proposed plan and explicitly ask the user for permission to proceed.
2. **Strict TDD (Tests Before Scaffold):** The very first task for any new feature or module MUST be the creation of unit/integration tests. You must write the tests *before* generating any initial boilerplate, scaffolding, or implementation code. Build a robust safety net against regressions and mock any unfinished components.
3. **Non-Negotiable Quality:** All generated code must be clean, modular, and adhere to SOLID principles.
4. **Flawless CI/CD:** Every commit must be designed to pass CI/CD pipelines flawlessly. Do not provide code with warnings or loose typing (using `any` in TypeScript is strictly forbidden).
5. **Security by Design:** Keep a vigilant eye out for vulnerabilities. Always encrypt sensitive database data (LGPD compliance), protect against SQL Injection, and sanitize all inputs.
6. **Continuous Refactoring:** When asked to review or update code, proactively analyze it for refactoring opportunities. Optimize complex or duplicated code whenever spotted.
7. **Conventional Commits:** Upon completing a task, you must always provide the command for a local git commit, strictly following the global Conventional Commits standard (e.g., `feat:`, `fix:`, `chore:`, `refactor:`).

---

## 1. Architectural Overview

The system will be a B2B Web App (Administrative Dashboard for repair shops), designed as a Modular Monolith using Domain-Driven Design (DDD). It is divided into the following logical scopes:

* **Reception & CRM Module:** Individual/Corporate registration (consuming ViaCEP for addresses and Receita Federal for CNPJ data), fleet manager tracking, and vehicle history.
* **Shop Floor (Workflow) Module:** Interactive Kanban board (Estimate -> Approved -> In Maintenance -> Ready). Service Order (OS) generation, customizable entry checklists (to log vehicle damages and avoid liabilities), and mechanic time-tracking.
* **Supplies & Inventory Module:** Stock control, supplier quoting, supplier invoice processing, and parts warranty management.
* **Financial & Tax Module:** Accounts payable/receivable, cash flow, shop hourly cost calculation, and tax invoice issuance via Gateway.
* **Communication Module:** Email marketing triggers and official WhatsApp Cloud API integration.

### 🧠 Integrated Artificial Intelligence Features

* **Smart Budgeting:** Analyzes Service Order (OS) history. Example: When adding "Timing belt replacement for Palio 2012," the AI automatically suggests related parts (tensioner, water pump) and standard labor time.
* **Document OCR:** Extracts data from photos of driver's licenses (CNH) and vehicle registrations (CRLV) to auto-fill customer profiles.
* **Churn & Maintenance Prediction:** Learns vehicle usage patterns to send personalized, persuasive WhatsApp messages (e.g., predicting brake pad wear based on high mileage rather than a fixed 6-month reminder).
* **Supplier Invoice Reading:** Parses PDF/XML invoices to categorize items, update inventory, and suggest retail prices based on configured profit margins (Markup).
* **Sentiment Analysis:** Reads customer satisfaction feedback and categorizes it for the management dashboard.

---

## 2. Tech Stack & Environment Configurations

### Backend
* **Language/Framework:** C# with .NET (8 or higher).
* **Architecture:** Clean Architecture / DDD.
* **ORM:** Entity Framework Core.
* **Testing:** xUnit, Moq, FluentAssertions.

### Frontend
* **Library/Language:** React with TypeScript.
* **Styling:** Tailwind CSS (or MUI/Radix UI for professional prototyping).
* **Testing:** Vitest (or Jest) + React Testing Library.

### Database
* **RDBMS:** PostgreSQL (Relational database with strict ACID compliance is mandatory for concurrency control in inventory and financial transactions).

### Authentication & User Management
* **Provider:** Firebase Authentication or Supabase Auth.
* **Requirements:** Email/password login for shop administrators + Seamless Google SSO login. Backend validation via JWT.

### Tax Invoice Gateway (Focus: Belo Horizonte - MG, Brazil)
* **Provider:** Focus NFe, eNotas, or Arquivei (REST API via JSON).
* **NF-e (Products/Parts):** State jurisdiction (SEFAZ-MG). Requires A1 Digital Certificate.
* **NFS-e (Services/Labor):** Municipal jurisdiction (PBH). Uses ABRASF/BHISS web service standard.
* *Architecture Rule:* The backend must **never** communicate directly with SEFAZ or PBH. All emissions must be routed through the Gateway API to ensure resilience against government server downtimes.

---

## 3. Directory Structure & Project Patterns

This reference structure must be respected in all code suggestions:

```text
/garagil-monorepo
 ├── /backend
 │   ├── /GarAgil.Api          # Controllers, Middlewares, Program.cs
 │   ├── /GarAgil.Application  # Use Cases, DTOs, Service Interfaces
 │   ├── /GarAgil.Domain       # Entities, Aggregates, Value Objects, Repo Interfaces
 │   ├── /GarAgil.Infrastructure # EF Core, External Integrations (NFe Gateways, Meta API)
 │   └── /GarAgil.Tests        # xUnit, Moq (TDD)
 ├── /frontend
 │   ├── /src
 │   │   ├── /components       # Reusable UI components
 │   │   ├── /features         # Domain-separated logic (CRM, Kanban, Financial)
 │   │   ├── /hooks            # Custom hooks (e.g., Auth token validation)
 │   │   ├── /services         # API Calls (Axios/Fetch)
 │   │   └── /tests            # Vitest/RTL
 │   └── package.json
 └── .github/workflows         # CI/CD Pipelines
```

---

## 4. Security, Compliance, and Deployment Strategy

* **Target Infrastructure & Cloud-Native Design:** The application will be deployed using PaaS/Serverless solutions (e.g., Vercel/Cloudflare for the React frontend, Azure App Service/Cloud Run for the containerized .NET API, and managed PostgreSQL like Supabase/RDS in the `sa-east-1` region for low latency). The backend must be strictly stateless. All file storage (OS documents, NFe PDFs, customer OCR images) must utilize cloud object storage (e.g., AWS S3, Azure Blob Storage) instead of local disk persistence.
* **Data Protection (LGPD Compliance):** All sensitive Personally Identifiable Information (PII) such as CPF, CNPJ, and contact details must be encrypted at rest in the PostgreSQL database.
* **Secrets Management:** API keys (WhatsApp, NFe Gateway, OpenAI/Gemini) and database connection strings must never be hardcoded. Use Environment Variables and secure vaults (like Azure Key Vault or AWS Secrets Manager) in production.
* **CI/CD Quality Gates:** The deployment pipeline must enforce strict quality checks. A build must fail if unit test coverage drops below the required threshold, if linting rules are violated, or if security vulnerabilities are detected in dependencies.
* **Concurrency Handling:** Optimistic or pessimistic locking must be implemented via EF Core to handle race conditions (e.g., two mechanics trying to withdraw the same last part from inventory simultaneously).

---

## 5. Best Practices & Post-Implementation Checklist

Whenever generating, reviewing, or committing code, internally validate this checklist:

- [ ] **Are there tests?** TDD is the rule. If no tests are provided in the prompt, generate them first.
- [ ] **Is sensitive data protected?** Passwords, tokens, and client PII must be encrypted in the database and obfuscated in logs.
- [ ] **Is concurrency handled?** Ensure proper transaction isolation in PostgreSQL for inventory and financial operations.
- [ ] **Would this pass the CI/CD pipeline?** Ensure zero lint errors, strict typing, and adequate test coverage.
- [ ] **Is coupling kept low?** External dependencies (NFe, WhatsApp, Auth) must be abstracted behind interfaces (Ports and Adapters pattern).
- [ ] **Is the UI in pt-BR?** Verify that all text presented to the user is in Brazilian Portuguese.
- [ ] **Is the commit generated?** Ensure a local commit command is provided adhering to the Conventional Commits specification.

