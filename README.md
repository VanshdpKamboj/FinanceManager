# Personal Finance Manager 💰

**Transform scattered bank SMS into organized financial insights.**

Full-stack web app that extracts transaction data from bank messages using smart regex pattern matching. Parse single/bulk messages, track spending, and manage finances through role-based dashboards.

---

## ✨ Features

- **Smart Parsing**: Regex-based extraction from single & bulk bank SMS
- **Transaction Management**: View, filter, edit, delete financial records
- **Role-Based Access**: USER (transactions), MAKER (create patterns), CHECKER (approve patterns)
- **Secure Authentication**: JWT + BCrypt encryption
- **Responsive UI**: React + Tailwind CSS

---

## 🏗️ Project Structure

```
Personal Finance Manager/
├── Prj_Frontend/                    # React + Vite + Redux
│   ├── src/
│   │   ├── pages/                   # Home, Login, Register, Dashboards
│   │   ├── components/              # ProtectedRoute
│   │   ├── services/                # API connectors (auth, transaction, maker, checker)
│   │   └── reducer/slices/          # Redux state (auth, profile)
│   └── public/sample-bulk-messages.json
│
└── Project_Backend/                 # Spring Boot + MySQL/H2
    ├── controller/                  # AuthController, TransactionController, RegexController
    ├── service/                     # Business logic (TransactionService, RegexService, UserService)
    ├── repository/                  # JPA repositories
    ├── entity/                      # User, Transaction, RegexLog
    ├── security/                    # JWT filters, SecurityConfig, CustomUserDetailsService
    ├── dto/                         # Request/Response DTOs
    └── util/                        # JwtUtil
```

---

## 🛠️ Tech Stack

**Frontend:** React 19 • Vite • Redux Toolkit • Tailwind CSS • Axios  
**Backend:** Spring Boot 4.0.2 • Spring Security • JWT • MySQL/H2 • JPA/Hibernate

---

## 🚀 Quick Setup

### Prerequisites
Node.js 16+ | Java 17+ | MySQL (optional - H2 for testing)

### Backend
```bash
cd "Project_Backend"
# Configure DB in src/main/resources/application.properties
./mvnw spring-boot:run        # Mac/Linux
# mvnw.cmd spring-boot:run    # Windows
```
Runs at `http://localhost:8080`

### Frontend
```bash
cd "Prj_Frontend"
npm install
echo "VITE_BACKEND_API=http://localhost:8080/api" > .env
npm run dev
```
Runs at `http://localhost:5173`

---

## 🔐 API Endpoints

**Auth:** `/api/auth/register` • `/api/auth/login`  
**Transactions:** `/api/transactions/extract` • `/api/transactions/process-bulk` • `/api/transactions/user/{userId}`  
**Patterns:** `/api/regex/test` • `/api/regex/save` • `/api/regex/pending` • `/api/regex/update-status/{id}`

---

## 🤖 How We Used AI

### Cursor Usage
- **Auth System**: Generated complete JWT authentication with `AuthController`, `JwtUtil`, security filters, and `CustomUserDetailsService` using Cursor Composer
- **Backend Controllers**: Built `TransactionController` (extract, bulk-process, CRUD) and `RegexController` (pattern testing, approval workflow) with complete service layer integration
- **Frontend Pages**: Created all React pages (`Home.jsx` with parser UI, `Login.jsx`, `Register.jsx`, `MakerDashboard.jsx`, `CheckerDashboard.jsx`) with Tailwind styling
- **Redux State**: Generated auth and profile slices with JWT token persistence and user state management
- **API Services**: Built complete service layer (`authAPI.js`, `transactionAPI.js`, `makerAPI.js`, `checkerAPI.js`) with Axios interceptors

### Qodo Usage
- **NullPointerException Fixes**: Identified missing null checks in `TransactionController.extractTransaction()` and `RegexController.testPattern()` that could crash on empty inputs
- **Error Response Standardization**: Detected inconsistent error handling in bulk message processing - fixed to return proper 400/404/500 responses instead of generic 500 errors
- **JWT Security**: Caught vulnerability in token validation where expired tokens weren't properly rejected in `JwtAuthenticationFilter`
- **Controller Edge Cases**: Found unhandled exceptions in CRUD operations when transaction IDs don't exist, improved error messages

### Lessons Learned
**Specific context = 70% faster development.** Instead of vague prompts like "build auth," using "create Spring Boot JWT authentication with BCrypt, User entity with ROLE enum, and role-based access control" eliminated iteration cycles. Explicitly naming frameworks, design patterns, entity relationships, and expected file structure accelerated development from days to hours.

---

## 📦 Clone & Run

```bash
# Clone repository
git clone <repo-url>
cd "Personal Finance Manager"

# Backend (Terminal 1)
cd "Project_Backend"
./mvnw spring-boot:run

# Frontend (Terminal 2)
cd "Prj_Frontend"
npm install
echo "VITE_BACKEND_API=http://localhost:8080/api" > .env
npm run dev
```

**Visit** `http://localhost:5173` → Register account → Start parsing!

---

## 🧪 Testing

```bash
# Backend tests with JaCoCo coverage
cd Project_Backend
./mvnw test
# Coverage report: htmlReport/index.html
```

---

## 📄 License

Open source. Use, modify, learn freely.

---

**Built for effortless financial tracking. No ads. No subscriptions. Just clarity.**
