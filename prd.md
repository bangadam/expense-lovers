Here is the translated **Product Requirements Document (PRD)** for **Expense Lovers**, split into two distinct phases: **Phase 1 (MVP)** for immediate development and **Phase 2 (Secondary)** for future enhancements.

---

# 🚀 PHASE 1: MVP PRD (Minimum Viable Product)

**Focus:** Input speed, offline stability, and basic cash flow management.

## 1. Product Identity

* **App Name:** Expense Lovers
* **Platform:** Android & iOS (Mobile)
* **Nature:** 100% Offline-First (No Server/Cloud)

## 2. Core Features (Mandatory)

### A. Wallet Management (Basic Wallets)

* **Create Wallet:** Users can create wallets (e.g., "Cash", "Bank", "E-Wallet") with a custom name and an initial manual balance.
* **Edit/Delete Wallet:** Ability to rename or remove a wallet if created in error.
* **Total Assets:** Displays the aggregated total money from all wallets on the main dashboard.

### B. Transaction Recording (The Core)

* **Quick Input:** A prominent, large "+" button on the main screen for instant access.
* **Simple Input Form:**
* **Type:** Income / Expense.
* **Amount:** Numeric input with automatic thousand separators (e.g., 100,000).
* **Category:** Select from a list (Food, Transport, etc.).
* **Date:** Defaults to "Today" (changeable).
* **Note:** Optional text field (max 100 chars).


* **Auto-Calculation:** Wallet balances update immediately upon tapping "Save".

### C. Custom Categories

* **Default Categories:** Pre-loaded essential categories (Food, Transport, Salary).
* **Add Custom:** Users can add new categories to fit their lifestyle (e.g., "Skincare", "Gaming", "Pet Care").

### D. History & Basic Reporting

* **Recent Transactions:** A list of the last 10 transactions displayed on the dashboard.
* **History View:** A dedicated page to view all transactions, scrollable by month.

### E. Technical Requirements (MVP)

* **Database:** Local Storage (SQLite or Isar).
* **UI Framework:** Gluestack UI (React Native).
* **Backup:** None (Data resides solely on the device for MVP).

---

**Focus:** Deep analytics, automation, and data security.

## 1. Advanced Features (Enhancements)

### A. Debt & Receivables Management

* **Pending Status:** Ability to mark transactions as "Pending" or "Unpaid" (useful for debts/loans).
* **Debt Reminder:** Manual option to set a reminder to collect or pay a debt.

### B. Subscription Tracker

* **Recurring Billing:** Input for regular bills (Netflix, Electricity, Spotify) with cycle options (Monthly/Yearly).
* **Auto-Reminder:** Local Push Notifications triggered 1 or 3 days before the due date.
---

### 💡 Recommended Roadmap

1. **Weeks 1-2:** Focus entirely on **Phase 1 (MVP)**. Ensure users can record money in/out without bugs or lag.
2. **Alpha Release:** Share the APK/TestFlight with a small circle to test the "Input Feel" (Is it fast enough? Is it satisfying?).
3. **Weeks 3-4:** Begin working on **Phase 2**, starting with **Visual Analytics** (since users love seeing where their money went), followed by the **Subscription Tracker**.