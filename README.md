# GarAgil 🚗💨

**GarAgil** is a modern, AI-powered B2B SaaS platform designed to streamline and automate the daily operations of auto repair shops. The name blends "Garage" with "Agility", reflecting the core mission: optimizing time, reducing bureaucracy, and improving customer satisfaction through intelligent workflows.

This project is built with **Clean Architecture**, **Strict TDD (Test-Driven Development)**, and a **Cloud-Native approach**.

## 🌟 Key Features & Modules

GarAgil is designed as a Modular Monolith, divided into logical scopes tailored for automotive businesses:

### 🛠️ 1. Shop Floor (Workflow) Module
- **Interactive Kanban Board:** Drag-and-drop interface for managing vehicles across stages: *Estimate (Orçamento)* -> *Estimate Sent* -> *Approved* -> *In Maintenance* -> *Ready*.
- **Multi-Service Orders:** Create comprehensive Service Orders (OS) with multiple repair tasks.
- **Mechanic Action Flow:** Technicians have a simplified view to execute repairs, update statuses, and report additional findings directly from the workshop floor.
- **Persistent History:** Every completed task is permanently recorded and visible on the vehicle's card during subsequent visits.

### 👥 2. Reception & CRM Module
- **Smart Customer Registration:** Integration with external APIs (like BrasilAPI) to auto-fill addresses via CEP and business data via CNPJ.
- **Fleet Management:** Link multiple vehicles to a single customer profile with quick add/remove actions.
- **Real-time Search:** Lightning-fast lookup by customer name or document (CPF/CNPJ).
- **Strict Plate Validation:** Enforces correct Brazilian (AAA1234) and Mercosul (AAA1A23) license plate formats.

### 📦 3. Supplies & Inventory Module
- **Stock Control:** Manage parts, track stock levels, and set low-stock alerts.
- **Smart Pricing:** Automated selling price calculation based on cost and desired profit margin.
- **Quick Consumption:** Mechanics can quickly deduct parts from inventory as they are used in repairs.
- **Role-Based Privacy:** Sensitive financial data (like selling prices or profit margins) is hidden from standard mechanic accounts.

### 💰 4. Financial & Tax Module
- **Cash Flow Dashboard:** Real-time visibility into Accounts Payable, Accounts Receivable, Current Balance, and Forecasted Balance.
- **Date Filtering:** Analyze financial health across custom periods (e.g., this month, last 15 days).
- **Flexible Management:** Edit pending accounts, mark them as paid/received, and easily undo accidental actions.

### 🔐 5. Security & Access Control (RBAC)
- **Role-Based Access Control:** Distinct experiences for `Admin` (full access) and `Mechanic` (restricted operational view).
- **Admin Approval Flow:** New registrations are placed in a `Pending` state. Only authorized administrators can approve access to the system.
- **Hashed Passwords:** Secure authentication using JWT tokens and cryptographic hashing.

---

## 🧠 Artificial Intelligence Integration (Roadmap)
GarAgil is designed to leverage the Gemini API to provide smart assistance:
- **Smart Budgeting:** Suggests related parts and labor time based on the mechanic's service description.
- **Document OCR:** Auto-fills customer profiles from photos of driver's licenses (CNH) or vehicle registrations (CRLV).
- **Predictive Maintenance:** Analyzes usage patterns to trigger automated WhatsApp reminders (e.g., oil change alerts).

---

## 💻 Tech Stack

### Backend
- **Framework:** C# / .NET 8 (Web API)
- **Architecture:** Clean Architecture & Domain-Driven Design (DDD)
- **ORM:** Entity Framework Core
- **Database:** SQLite (Local/Dev) / PostgreSQL (Production)
- **Testing:** xUnit, Moq, FluentAssertions (50+ automated unit tests)

### Frontend
- **Library:** React 18 with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS v4
- **State Management & Routing:** React Hooks & React Router
- **HTTP Client:** Axios

### Infrastructure
- **Containerization:** Docker & Docker Compose
- **Web Server:** Nginx (for Frontend static serving)

---

## 🚀 Getting Started

The project is fully containerized for a frictionless developer experience.

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/) installed.

### Running Locally with Docker
1. Clone the repository.
2. Navigate to the root directory containing the `docker-compose.yml` file.
3. Run the following command:

```bash
docker compose up --build
```

This command will:
- Build the .NET 8 Backend API and start it on `http://localhost:5251`.
- Build the React Frontend and serve it via Nginx on `http://localhost:5173`.
- Automatically run Entity Framework migrations to set up the SQLite database.
- Create a local `./data` folder to persist your database state.

### Running Locally (Without Docker)

#### Backend
```bash
cd backend/GarAgil.Api
dotnet run
```
*The API will be available at `http://localhost:5251`*

#### Frontend
```bash
cd frontend
npm install
npm run dev
```
*The Web App will be available at `http://localhost:5173`*

---

## 🧪 Testing

GarAgil follows a strict Test-Driven Development (TDD) approach. To run the backend test suite:

```bash
cd backend
dotnet test GarAgil.Tests
```

---

## 📜 License
This project is proprietary software. All rights reserved.
