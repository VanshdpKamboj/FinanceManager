# 🏦 Personal Finance Manager - Backend

> **The Brain Behind Your Financial Intelligence.** A powerful Spring Boot application that turns chaos into clarity, one transaction at a time!

## 🎯 What Does This Do?

Imagine having a super-smart assistant that can read any bank message, understand what happened with your money, and organize everything perfectly. That's what this backend does! It's the engine that powers your personal finance manager, handling everything from user accounts to transaction parsing with military precision.

## 🌟 Superpowers Unlocked

### 🔐 Fort Knox Level Security
Your data is safer than a treasure in a dragon's cave:
- **JWT Authentication**: Military-grade tokens that expire automatically
- **Password Encryption**: Your passwords are scrambled so well, even we can't read them
- **Role-Based Access**: Users, Makers, and Checkers each have their own superpowers
- **Spring Security**: Built on battle-tested security frameworks

### 🧠 Smart Transaction Parser
The real magic happens here:
- **Regex Pattern Engine**: Teaches the system to read any bank's message format
- **Single Message Processing**: Parse one transaction message instantly
- **Bulk Processing**: Handle hundreds of messages in one go (yes, hundreds!)
- **Automatic Extraction**: Pulls out amount, date, type, bank name, and more
- **Multi-Bank Support**: Works with any bank - just teach it once!

### 👥 User Management Made Easy
- **Register & Login**: Quick and secure onboarding
- **Three Role Types**: 
  - **USER**: Regular folks managing their finances
  - **MAKER**: Pattern creators who teach the system new tricks
  - **CHECKER**: Quality controllers who approve new patterns
- **Profile Management**: Each user gets their own secure space

### 📋 Regex Pattern Workflow
A smart approval system that prevents mistakes:
- **Create Patterns**: Makers design regex patterns for new banks
- **Test Patterns**: Try them out before they go live
- **Approve/Reject**: Checkers verify patterns work correctly
- **Version Control**: Track all pattern changes and who made them

### 💾 Database Flexibility
Choose your fighter:
- **MySQL**: Production-ready, robust, handles millions of records
- **H2 Database**: Perfect for testing and development (no setup needed!)

## 🛠️ Tech Stack (The Good Stuff)

Built with the best tools in the Java ecosystem:
- **Spring Boot 4.0.2** - The latest and greatest
- **Spring Security** - Fort Knox for your data
- **Spring Data JPA** - Talks to databases effortlessly
- **JWT (JSON Web Tokens)** - Secure authentication that scales
- **Lombok** - Less boilerplate, more productivity
- **Maven** - Dependency management made simple
- **MySQL/H2** - Flexible database options

## 🚀 Getting Started (Easier Than Making Coffee!)

### What You Need
- **Java 25** (or Java 17+) - [Download here](https://www.oracle.com/java/technologies/downloads/)
- **Maven** (comes with the project wrapper)
- **MySQL** (optional - H2 works out of the box!)

### Let's Launch This Rocket!

**Option 1: Using Maven Wrapper (Recommended)**
```bash
# On Mac/Linux
./mvnw spring-boot:run

# On Windows
mvnw.cmd spring-boot:run
```

**Option 2: Using Installed Maven**
```bash
mvn spring-boot:run
```

🎉 **Boom!** Your server is running at `http://localhost:8080`

### Setting Up Your Database

**Option A: Quick Start with H2 (No Installation Needed)**
Already configured! Just run and you're good to go. Perfect for:
- Learning the system
- Development and testing
- Quick demos

**Option B: Production Power with MySQL**
1. Install MySQL
2. Create a database:
```sql
CREATE DATABASE personal_finance_db;
```
3. Update `src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/personal_finance_db
spring.datasource.username=your_username
spring.datasource.password=your_password
spring.jpa.hibernate.ddl-auto=update
```

## 📁 Architecture (How Everything Fits Together)

```
Project_Backend/
├── controller/              # The Front Desk
│   ├── AuthController       # Handles login & registration
│   ├── TransactionController # Processes your messages
│   └── RegexController      # Manages parsing patterns
│
├── service/                 # The Brain
│   ├── UserService          # User operations
│   ├── TransactionService   # Transaction logic
│   └── RegexService         # Pattern management
│
├── repository/              # The Library
│   ├── UserRepository       # User data storage
│   ├── TransactionRepository # Transaction records
│   └── RegexLogRepository   # Pattern history
│
├── entity/                  # The Blueprint
│   ├── User                 # User model
│   ├── Transaction          # Transaction model
│   └── RegexLog             # Pattern model
│
├── security/                # The Bodyguard
│   ├── SecurityConfig       # Security rules
│   ├── JwtAuthenticationFilter # Token validation
│   └── CustomUserDetailsService # User loading
│
└── util/                    # The Toolkit
    └── JwtUtil              # Token generation & validation
```

## 🔌 API Endpoints (Your Remote Controls)

### 🔐 Authentication Endpoints
```
POST /api/auth/register      # Create a new account
POST /api/auth/login         # Sign in
```

### 💰 Transaction Endpoints
```
POST /api/transactions/extract          # Parse a single message
POST /api/transactions/process-bulk     # Process multiple messages
GET  /api/transactions/user/{userId}    # Get all transactions
PUT  /api/transactions/{id}             # Update a transaction
DELETE /api/transactions/{id}           # Delete a transaction
```

### 🎨 Regex Pattern Endpoints (Maker & Checker)
```
POST /api/regex/test               # Test a pattern
POST /api/regex/save               # Save a new pattern (Maker)
GET  /api/regex/pending            # Get patterns awaiting approval (Checker)
PUT  /api/regex/update-status/{id} # Approve/Reject pattern (Checker)
GET  /api/regex/approved           # Get all approved patterns
```

## 💡 How The Magic Works

### Transaction Extraction Flow
1. **User sends** a bank SMS message
2. **System identifies** which bank sent it
3. **Finds the right pattern** from approved regex patterns
4. **Extracts details**: Amount, type (credit/debit), date, merchant
5. **Creates transaction** record in database
6. **Returns beautiful** structured data to frontend

### Pattern Approval Workflow
1. **Maker creates** a regex pattern for a new bank
2. **Tests it** with sample messages
3. **Saves as PENDING**
4. **Checker reviews** the pattern
5. **Tests accuracy**
6. **Approves** → Pattern goes live!
7. **Rejects** → Maker gets feedback to improve

## 🔒 Security Features Explained

### JWT Tokens - Your Digital Passport
- Generated when you log in
- Contains your user info (encrypted)
- Expires after a set time (no eternal sessions)
- Must be sent with every API call
- Validated on every request

### Password Security
- Passwords are hashed using BCrypt
- Salt added automatically
- Original password never stored
- Impossible to reverse engineer

### Role-Based Access Control
```
USER    → Can parse transactions, view own data
MAKER   → USER powers + Create regex patterns
CHECKER → USER powers + Approve/Reject patterns
```

## 🛠️ Configuration (application.properties)

### Key Settings You Can Customize:
```properties
# Server Port
server.port=8080

# JWT Settings
jwt.secret=your-secret-key-here
jwt.expiration=86400000  # 24 hours in milliseconds

# Database (automatically configured for H2)
# Switch to MySQL by uncommenting and configuring MySQL properties

# JPA Settings
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

## 🧪 Testing Your Setup

### Quick Health Check
```bash
curl http://localhost:8080/api/auth/login
```
If you get a response (even an error), your server is running! ✅

### Register Your First User
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "securepassword123",
    "role": "USER"
  }'
```

## 🐛 Troubleshooting Guide

### Port Already in Use?
```bash
# Change the port in application.properties
server.port=8081
```

### Database Connection Failed?
- Check if MySQL is running
- Verify database name, username, password
- Try H2 mode first to isolate the issue

### JWT Token Issues?
- Check if token is expired
- Verify secret key is set correctly
- Make sure token is sent in Authorization header

### Build Errors?
```bash
# Clean and rebuild
./mvnw clean install
```

## 📊 Database Schema (Simplified)

### Users Table
```
- id (primary key)
- username (unique)
- email (unique)
- password (encrypted)
- role (USER/MAKER/CHECKER)
```

### Transactions Table
```
- id (primary key)
- user_id (foreign key)
- amount
- transaction_type (CREDIT/DEBIT)
- bank_name
- transaction_date
- category
- merchant
```

### Regex Patterns Table
```
- id (primary key)
- pattern (regex string)
- bank_name
- status (PENDING/APPROVED/REJECTED)
- created_by (maker user)
- approved_by (checker user)
- created_date
```

## 🚀 Production Deployment Tips

1. **Change JWT Secret**: Use a strong, random secret key
2. **Use MySQL**: H2 is great for dev, but MySQL for production
3. **Enable HTTPS**: Encrypt data in transit
4. **Set Up Logging**: Monitor errors and performance
5. **Configure CORS**: Allow only your frontend domain
6. **Regular Backups**: Your data is precious!

## 🎓 Learn More

### Spring Boot Resources
- [Official Documentation](https://spring.io/projects/spring-boot)
- [Spring Security Guide](https://spring.io/guides/topicals/spring-security-architecture/)
- [JPA Best Practices](https://spring.io/guides/gs/accessing-data-jpa/)

### JWT Resources
- [JWT.io](https://jwt.io/) - Decode and understand tokens
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

## 🤝 Contributing

Found a bug? Have an idea? We'd love to hear from you!
1. Fork the repository
2. Create a feature branch
3. Make your magic happen
4. Write tests (your future self will thank you)
5. Submit a pull request

## 🌟 Coming Soon

- Email notifications for transactions
- Analytics dashboard
- Export transactions to CSV/Excel
- Recurring transaction detection
- Budget alerts and tracking

## 💬 Need Help?

Stuck on something? Don't worry, we've all been there!
- Open an issue on GitHub
- Check existing issues for solutions
- Review the API documentation
- Test with sample data first

---

**Built with ☕ and ❤️ by developers who believe finance management should be easy**

*Remember: Great software is not about complexity, it's about solving real problems simply and elegantly.*

**Part of the Personal Finance Manager ecosystem - Making financial awareness accessible to everyone!**
