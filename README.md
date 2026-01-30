# Personal Finance Manager

**Stop stressing over your bank messages. Start understanding your money.**

Ever looked at your bank SMS inbox and felt overwhelmed? Hundreds of messages, no clear picture of where your money goes? This project solves that problem. It's a web app that reads your bank transaction messages, figures out what they mean, and shows you everything in one simple dashboard.

Think of it as your personal financial assistant that actually works.

---

## What Problem Does This Solve?

Banks send us SMS messages every time we spend or receive money. After a few months, you have hundreds of messages scattered everywhere. Want to know how much you spent on groceries last month? Good luck scrolling through all those texts.

This app fixes that. You paste your bank messages, and it automatically:
- Extracts the amount, date, and transaction type
- Organizes everything in a clean dashboard
- Lets you filter by spending or income
- Shows your complete financial history

No more manual spreadsheets. No more confusion. Just clear answers.

---

## What Can You Actually Do With It?

### For Regular Users
- **Parse Single Messages**: Copy any bank SMS, paste it in, and see the details extracted instantly
- **Bulk Upload**: Got 200 old messages? Upload them all at once in a JSON file
- **View History**: See all your transactions in one place, sorted and organized
- **Track Spending**: Filter by debits (money out) or credits (money in)
- **Edit Records**: Made a manual entry mistake? Fix it with one click

### For Pattern Creators (Makers)
Some banks format their messages differently. Makers can teach the system how to read new bank formats by creating "patterns" (fancy word for rules that tell the computer what to look for).

### For Quality Controllers (Checkers)
Before a new pattern goes live, Checkers test it to make sure it works properly. This prevents bad patterns from messing up everyone's data.

---

## How It Works

The app has two main parts:

### Frontend (What You See)
Built with React, this is the beautiful interface where you interact with your finances. It's fast, responsive, and works on phones, tablets, and computers.

### Backend (The Engine)
Built with Spring Boot, this is where the heavy lifting happens. It stores your data securely, processes your messages using smart pattern matching, and keeps everything organized in a database.

They talk to each other through a secure API connection.

---

## Tech Stack (For the Curious)

**Frontend:**
- React 19 (the latest version for smooth, fast interactions)
- Vite (makes the app start super quickly)
- Redux Toolkit (keeps track of your login state and data)
- Tailwind CSS (makes everything look clean and modern)
- Axios (handles communication with the backend)

**Backend:**
- Spring Boot 4.0.2 (solid, reliable Java framework)
- Spring Security (keeps your data locked down tight)
- JWT Authentication (secure login tokens that expire)
- MySQL or H2 Database (flexible storage options)
- JPA/Hibernate (makes database work easier)

---

## Getting Started

### What You Need First
Before you begin, make sure you have these installed:
- **Node.js** (version 16 or higher) - [Download here](https://nodejs.org/)
- **Java** (version 17 or higher) - [Download here](https://www.oracle.com/java/technologies/downloads/)
- **MySQL** (optional - the app can run without it using H2)

### Step 1: Set Up The Backend

1. Open your terminal and go to the backend folder:
```bash
cd "Project_Backend"
```

2. If you want to use MySQL (recommended for real use):
   - Make sure MySQL is running
   - Create a database called `testdb`
   - Update the file `src/main/resources/application.properties` with your MySQL username and password

3. If you just want to test things out, the app will use H2 database automatically (no setup needed). Just uncomment the H2 section in `application.properties` and comment out the MySQL section.

4. Start the backend server:
```bash
# On Mac/Linux
./mvnw spring-boot:run

# On Windows
mvnw.cmd spring-boot:run
```

You should see some log messages. When you see "Started ProjectV1Application", you're good to go! The backend is now running at `http://localhost:8080`.

### Step 2: Set Up The Frontend

1. Open a new terminal window (keep the backend running) and go to the frontend folder:
```bash
cd "Prj_Frontend"
```

2. Install all the required packages:
```bash
npm install
```
This might take a minute or two. Grab a coffee.

3. Create a file called `.env` in the frontend folder and add this line:
```
VITE_BACKEND_API=http://localhost:8080/api
```
This tells the frontend where to find the backend.

4. Start the frontend:
```bash
npm run dev
```

Open your browser and go to `http://localhost:5173`. You should see the login page. Congrats, you're running!

---

## Using The App (Quick Guide)

### First Time Setup
1. Go to the Register page
2. Create an account with your email and password
3. Choose your role (start with USER if you're not sure)
4. Login with your new credentials

### Parsing a Single Message
1. Go to the Home page
2. Find the "Single Message Parser" section
3. Paste a bank SMS message (like "INR 500 debited from A/c XX1234 on 30-Jan-26")
4. Click "Extract Transaction"
5. Watch as it pulls out the amount, date, and type automatically

### Bulk Upload (The Time Saver)
1. Prepare a JSON file with all your messages (check `Prj_Frontend/public/sample-bulk-messages.json` for the format)
2. Go to "Bulk Message Parser" on the Home page
3. Upload your file
4. Wait a few seconds while it processes everything
5. Check your transaction history - it's all there!

### Viewing Your Transactions
1. Scroll down to the "Transaction History" section
2. Filter by transaction type (spent vs received)
3. Sort by date or amount
4. Edit or delete any transaction if needed

---

## File Structure (Where Everything Lives)

```
Personal Finance Manager/
│
├── Prj_Frontend/                    # The visual interface
│   ├── src/
│   │   ├── pages/                   # Different screens
│   │   │   ├── Home.jsx            # Main dashboard (where the magic happens)
│   │   │   ├── Login.jsx           # Sign in screen
│   │   │   ├── Register.jsx        # Create account screen
│   │   │   ├── MakerDashboard.jsx  # For pattern creators
│   │   │   └── CheckerDashBoard.jsx # For pattern approvers
│   │   ├── components/              # Reusable UI pieces
│   │   ├── services/                # Handles API calls
│   │   └── reducer/                 # State management
│   └── public/
│       └── sample-bulk-messages.json # Example file for bulk upload
│
└── Project_Backend/                 # The processing engine
    ├── src/main/java/com/example/Project_V1/
    │   ├── controller/              # API endpoints
    │   ├── service/                 # Business logic
    │   ├── repository/              # Database operations
    │   ├── entity/                  # Data models
    │   ├── security/                # Authentication & authorization
    │   └── util/                    # Helper functions
    └── src/main/resources/
        └── application.properties   # Configuration file
```

---

## API Endpoints (How Frontend Talks to Backend)

### Authentication
- `POST /api/auth/register` - Create a new account
- `POST /api/auth/login` - Sign in and get your access token

### Transactions
- `POST /api/transactions/extract` - Parse a single bank message
- `POST /api/transactions/process-bulk` - Upload multiple messages at once
- `GET /api/transactions/user/{userId}` - Get all your transactions
- `PUT /api/transactions/{id}` - Update a transaction
- `DELETE /api/transactions/{id}` - Delete a transaction

### Regex Patterns (Advanced Users)
- `POST /api/regex/test` - Test if a pattern works
- `POST /api/regex/save` - Save a new pattern (Makers only)
- `GET /api/regex/pending` - See patterns waiting for approval (Checkers)
- `PUT /api/regex/update-status/{id}` - Approve or reject a pattern (Checkers)

---

## Security Features

We take your financial data seriously. Here's what protects you:

**Password Security**
- Your password is never stored in plain text
- We use BCrypt encryption with automatic salt
- Even database admins can't see your actual password

**JWT Tokens**
- When you log in, you get a secure token
- This token expires after 24 hours (you'll need to log in again)
- Every API request checks this token
- Tokens can't be faked or tampered with

**Role-Based Access**
- Users can only see their own data
- Makers can create patterns but not approve them
- Checkers can approve patterns but not create them
- This separation prevents accidental mistakes

---

## Common Questions

**Q: What banks does this support?**  
A: Any bank! The system is designed to learn new bank formats. If your bank isn't recognized, a Maker can create a pattern for it in minutes.

**Q: Is my financial data safe?**  
A: Yes. All passwords are encrypted, API calls are authenticated, and you can run this entirely on your own computer (no cloud required).

**Q: Can I export my data?**  
A: Currently, you can view and manage everything in the dashboard. Export features are planned for future updates.

**Q: What if the parser gets something wrong?**  
A: You can manually edit any transaction. The parser is usually accurate, but if a bank message is weirdly formatted, you might need to fix the details.

**Q: Do I need to know coding to use this?**  
A: Nope! The setup requires running a few terminal commands (which we've explained step by step), but using the app itself is just clicking buttons and pasting text.

---

## Troubleshooting

**"Port 8080 is already in use"**
- Something else is using that port
- Either stop that other program, or change the backend port in `application.properties`

**"Cannot connect to backend"**
- Make sure the backend is actually running (check your terminal)
- Verify the `.env` file in the frontend has the correct URL
- Try accessing `http://localhost:8080` in your browser - you should see something

**"Login not working"**
- Clear your browser's local storage (in browser dev tools)
- Make sure you registered an account first
- Check that the backend database is running

**"Bulk upload fails"**
- Double-check your JSON file format matches the sample
- Make sure the file isn't enormous (keep it under 5MB)
- Check browser console for specific error messages

**"Pattern not parsing correctly"**
- The bank format might not be recognized yet
- Create a new pattern using the Maker dashboard
- Get it approved by a Checker
- Try parsing again

---

## Future Ideas (Things We'd Like to Add)

- Monthly spending reports and charts
- Budget tracking and alerts
- Recurring transaction detection
- CSV/Excel export
- Mobile app versions
- Email notifications for large transactions
- Category-based spending analysis
- Multi-currency support

Want to help build these? Contributions are welcome!

---

## Development Notes

### Running Tests
```bash
# Backend tests
cd Project_Backend
./mvnw test

# Frontend tests (if you add them)
cd Prj_Frontend
npm test
```

### Building for Production
```bash
# Backend
cd Project_Backend
./mvnw clean package

# Frontend
cd Prj_Frontend
npm run build
```

### Code Coverage
The backend uses JaCoCo for test coverage. After running tests, check `htmlReport/index.html` for a detailed coverage report.

---

## Contributing

Found a bug? Have a feature idea? Want to improve something? Here's how you can help:

1. Fork this repository
2. Create a new branch (`git checkout -b feature/your-idea`)
3. Make your changes
4. Test thoroughly (please!)
5. Commit with a clear message (`git commit -m "Add category filtering"`)
6. Push to your branch (`git push origin feature/your-idea`)
7. Open a Pull Request

We review all contributions. Don't be shy - even small improvements matter!

---

## License

This project is open source. Feel free to use it, modify it, and learn from it. If you build something cool with it, let us know!

---

## Final Thoughts

Managing money shouldn't be complicated. Banks make it complicated by sending cryptic SMS messages that are hard to track. This app makes it simple again.

Whether you're trying to budget better, track your spending, or just understand where your money goes each month, this tool gives you clarity. No ads, no subscriptions, no selling your data. Just a straightforward app that does one thing well.

We built this because we needed it ourselves. Hopefully, it helps you too.

---

**Questions? Issues? Ideas?**  
Open an issue on GitHub or reach out. We're here to help.

**Made by people who believe financial awareness should be easy and accessible to everyone.**
