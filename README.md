# 💸 SplitEase — Smart Expense Splitting & Debt Simplification App

[![MERN Stack](https://img.shields.io/badge/Stack-MERN-emerald?style=for-the-badge&logo=react)](https://react.dev)
[![Database](https://img.shields.io/badge/Database-MongoDB%20Atlas-green?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/cloud/atlas)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

**SplitEase** is a full-stack MERN application that allows groups of friends, roommates, and travel companions to track shared expenses and settle debts with the **minimum possible money transfers** using a greedy cash-flow simplification algorithm.

---

## ✨ Key Features

- 🧠 **Smart Debt Simplification Algorithm**: Uses a greedy cash-flow algorithm ($O(n \log n)$) to aggregate net balances and minimize the total number of transactions needed across a group (e.g., reduces $A \rightarrow B \rightarrow C$ transfers to a single direct $A \rightarrow C$ settlement).
- ⚖️ **Flexible Split Modes**:
  - **Equal Split**: Evenly divides expenses among chosen group members with exact penny rounding handling.
  - **Exact Split**: Custom exact dollar amounts per participant with real-time validation.
  - **Percentage Split**: Split bills by percentage (validated to ensure 100% total).
- 👥 **Group & 1-on-1 Splits**:
  - **Group Expenses**: Categorized by *Trip 🏖️*, *Home 🏢*, *Couple ❤️*, *Project 💻*, or *Other 👥*.
  - **1-on-1 Friends**: Split non-group expenses directly with friends outside formal groups.
- 🎉 **Instant Settlement & Celebrations**: One-click **Settle Up** modal pre-filled with algorithmically suggested transfer amounts, complete with confetti celebrations!
- 📊 **Spending Analytics**: Interactive Doughnut spending breakdown charts by category.
- ⚡ **Demo Mode**: One-click demo initialization with pre-populated users, groups, and expenses.

---

## 🛠️ Tech Stack

| Layer | Technologies Used |
|---|---|
| **Frontend** | React 18 (Vite), React Router v6, Tailwind CSS, Framer Motion, Lucide React |
| **Backend** | Node.js, Express.js REST API, JWT Authentication, Bcrypt.js |
| **Database** | MongoDB Atlas (Cloud) / In-Memory MongoDB Server Fallback |
| **Visualization & UX** | Chart.js, Canvas Confetti |

---

## 📐 Key Algorithm: Greedy Debt Simplification

The core calculation engine in `backend/utils/simplifyDebts.js` solves the classic **Min Cash-Flow Problem**:

1. Calculates net balance per user ($\sum \text{Paid} - \sum \text{Owed} + \sum \text{Settlements}$).
2. Separates users into **Debtors** ($\text{Net} < 0$) and **Creditors** ($\text{Net} > 0$).
3. Repeatedly pairs the largest debtor with the largest creditor, settling $\min(|\text{debt}|, \text{credit})$, reducing both balances until all debts reach $\$0.00$.

---

## 🌐 API Overview

```http
POST   /api/auth/register          Register new user
POST   /api/auth/login             Login user & get JWT token
GET    /api/auth/me                Get logged-in user profile

POST   /api/groups                 Create a group & invite members
GET    /api/groups                 List my groups
GET    /api/groups/:id             Group details & members

POST   /api/expenses               Add expense (Equal / Exact / Percentage)
GET    /api/expenses/group/:id     List expenses for a group
GET    /api/expenses/recent        Activity feed

GET    /api/balances/group/:id     Calculated net balances & simplified debts
GET    /api/balances/summary       Overall balance summary

POST   /api/settlements            Record debt payment
```

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js (v18+) & npm

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/nagrajnag2004/splitease.git
   cd splitease
   ```

2. **Install Backend Dependencies**:
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**:
   ```bash
   cd ../frontend
   npm install
   ```

4. **Environment Variables**:
   Create a `backend/.env` file:
   ```env
   PORT=5000
   MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxx.mongodb.net/splitease
   JWT_SECRET=your_jwt_secret_key
   ```

5. **Run Development Servers**:
   ```bash
   # Start Backend API (runs on http://localhost:5000)
   cd backend
   npm run dev

   # Start Frontend (runs on http://localhost:3000)
   cd frontend
   npm run dev
   ```

---

## 🔑 Demo Account Credentials

For quick evaluation, click **"One-Click Demo Login"** on the login page or use:

| Role | Email | Password |
|---|---|---|
| **User 1 (Alex)** | `alex@splitease.dev` | `password123` |
| **User 2 (Sarah)** | `sarah@splitease.dev` | `password123` |
| **User 3 (Michael)** | `michael@splitease.dev` | `password123` |
| **User 4 (Emma)** | `emma@splitease.dev` | `password123` |

---

## 📄 License

Distributed under the MIT License. Developed by [nagrajnag2004](https://github.com/nagrajnag2004).
