# 💰 Personal Finance Manager - Frontend

> **Your Money, Simplified.** Transform messy bank SMS messages into crystal-clear financial insights with just one click!

## 🌟 What Makes This Special?

Ever received a bank transaction SMS and thought, "I wish someone would organize all these for me"? Well, that's exactly what we do! Our smart app reads your transaction messages, understands them (yes, like magic!), and gives you a beautiful dashboard to track every penny.

## ✨ Amazing Features

### 🎯 Smart Transaction Parser
Think of it as your personal financial assistant that never sleeps:
- **Copy & Paste Magic**: Just paste any bank SMS, and watch it extract all the details automatically
- **Multi-Bank Support**: Works with messages from different banks (because who has just one bank account these days?)
- **Instant Results**: See your transaction appear in real-time - it's that fast!

### 🚀 Bulk Message Wizard (Game Changer!)
Got hundreds of old messages? No problem:
- **Upload & Relax**: Drop a JSON file with all your messages and let us handle the rest
- **Batch Processing**: Process dozens of transactions in seconds, not hours
- **Smart Reports**: Know exactly what worked and what needs a second look
- **Auto-Refresh**: Your transaction history updates automatically

### 👥 Smart User Roles
We believe in teamwork:
- **Regular User**: Parse your transactions and see your financial story unfold
- **Maker**: The creative ones who build smart patterns to read new types of messages
- **Checker**: The quality guardians who approve patterns before they go live

### 📊 Transaction Dashboard
Your money, at a glance:
- **Complete History**: Every transaction, beautifully organized
- **Smart Filters**: Find transactions by type (spent money vs. received money)
- **Category Sorting**: Group by shopping, bills, income, and more
- **Easy Updates**: Made a mistake? Edit or delete with one click

## 🛠️ Built With Modern Tech

We use the best tools to give you the best experience:
- **React 18** - Lightning-fast, smooth as butter
- **Vite** - Super quick startup (no more waiting!)
- **Redux Toolkit** - Keeps everything organized behind the scenes
- **Tailwind CSS** - Beautiful design that looks great on any device
- **Axios** - Reliable communication with the backend

## 🚀 Getting Started (Easy as 1-2-3!)

### What You'll Need
- Node.js (version 16 or higher) - [Download here](https://nodejs.org/)
- npm (comes with Node.js) or yarn
- The backend server running (check the `Project_Backend` folder)

### Let's Get You Running!

**Step 1: Install Everything**
```bash
npm install
```
*This downloads all the magic ingredients needed for the app*

**Step 2: Set Up Your Connection**
Create a file named `.env` and add this line:
```env
VITE_BACKEND_API=http://localhost:8080/api
```
*This tells the frontend where to find the backend*

**Step 3: Launch!**
```bash
npm run dev
```
*The app will open at* `http://localhost:5173` 🎉

## 📁 How Everything is Organized

```
Prj_Frontend/
├── src/
│   ├── pages/                      # All the screens you see
│   │   ├── Home.jsx               # Your main dashboard (the cool one!)
│   │   ├── Login.jsx              # Sign in page
│   │   ├── Register.jsx           # Create your account
│   │   ├── MakerDashboard.jsx     # For pattern creators
│   │   └── CheckerDashBoard.jsx   # For pattern approvers
│   │
│   ├── components/                 # Reusable UI pieces
│   ├── services/                   # Talks to the backend
│   ├── reducer/                    # Manages app state
│   └── assets/                     # Images and logos
│
└── public/
    └── sample-bulk-messages.json  # Example file to try bulk upload
```

## 💡 Pro Tips

### Using the Bulk Message Parser
1. Go to the Home page
2. Click on "Bulk Message Parser"
3. Upload a JSON file (check `public/sample-bulk-messages.json` for the format)
4. Watch the magic happen!

**JSON Format** (super simple):
```json
[
  {
    "message": "Your complete bank SMS message here",
    "bankAddress": "BANK-NAME"
  }
]
```

### Helpful Commands
- `npm run dev` - Start working on the app
- `npm run build` - Prepare for going live
- `npm run preview` - See how it looks in production
- `npm run lint` - Check for code issues

## 🔐 Security Made Simple

We use JWT tokens (think of them as secure digital passes):
- Your login credentials are encrypted
- Sessions expire automatically for safety
- Sensitive data is never stored in plain text
- Every API call is authenticated

## 🆘 Quick Fixes

**Can't connect to the backend?**
- Make sure the backend server is running (check `Project_Backend`)
- Verify your `.env` file has the correct URL

**Bulk upload not working?**
- Double-check your JSON format matches the example
- Make sure the file isn't too big (keep it under 5MB)

**Login issues?**
- Clear your browser's local storage and try again
- Check if your token expired (you'll need to log in again)

## 🎨 Design Philosophy

We believe finance tools shouldn't be boring! Every screen is designed to be:
- **Intuitive**: No manual needed, just start using it
- **Fast**: Because waiting is so 2010
- **Beautiful**: Your eyes will thank you
- **Responsive**: Looks perfect on phones, tablets, and desktops

## 🤝 Want to Contribute?

We love improvements! Here's how:
1. Fork this repository
2. Create your feature branch
3. Make something awesome
4. Test it thoroughly
5. Send us a pull request

## 📞 Need Help?

Stuck? Confused? Want to suggest a feature? We're here for you! Just open an issue and let's talk.

---

**Made with ❤️ for people who want to understand their money better**

*Part of the Personal Finance Manager ecosystem - because your financial peace of mind matters!*
