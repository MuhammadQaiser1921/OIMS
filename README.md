# 📊 Oradigitals Internal Management System (OIMS) — MySQL Database Schema

A comprehensive and scalable MySQL database schema designed for **Oradigitals Internal Management System (OIMS)** — a role-based web application for managing internal business operations such as employees, projects, clients, payments, expenses, and salaries.

---

## 🧾 Project Overview

**OIMS** is built to streamline internal workflows for teams and administrators by offering centralized control over:

- 👥 Employee records
- 📁 Project tracking
- 🤝 Client management
- 💳 Payment handling
- 💸 Expense reporting
- 💰 Salary disbursement

This repository contains a production-ready SQL script that:

- Creates all necessary tables with constraints
- Inserts realistic **Pakistani-style** sample data
- Includes advanced dashboard queries
- Adds indexes for performance optimization

---

## 🗃️ Database Info

- **Database Name:** `oims_db`
- **Engine:** MySQL 8+
- **Relationships:** Enforced using foreign keys
- **Security:** Passwords stored as hashes (e.g., bcrypt)
- **Localization:** Sample data tailored to the Pakistani business environment

---

## 📦 Schema Highlights

| Module | Description |
|--------|-------------|
| `users` | Auth table with role-based access (`super_admin`, `hr_manager`, etc.) |
| `employees` | Stores employee details, salaries, CNICs, etc. |
| `clients` | Records business clients & company info |
| `projects` | Tracks project assignments & budget |
| `project_assignments` | Links employees to projects |
| `payments` | Tracks incoming client payments |
| `expenses` | Categorizes company expenses |
| `salary_payments` | Tracks salary disbursements manually |

---

## 🧪 Sample Data Included

- 👨‍💻 8 Employees from cities like Lahore, Islamabad, Karachi, Peshawar
- 🏢 6 Clients (tech, e-commerce, healthcare, education, retail)
- 📦 6 Projects with budgets, statuses, and assignments
- 💵 10+ Expense entries (internet, rent, software, etc.)
- 🧾 Multiple payments & salary disbursements

---

## 📈 Dashboard Queries

Useful SQL queries included for:

- Active project count
- Monthly income, expenses, and salaries
- Top paying clients
- Expense category breakdown
- Employee salary summaries
- Payment status overview

---

## ✅ Requirements

- MySQL 8.0+
- Any MySQL-compatible client (e.g., phpMyAdmin, DBeaver, MySQL CLI)

---

## 🚀 How to Use

1. Clone the repository or copy the SQL file.
2. Open your MySQL environment.
3. Run the SQL script (`OIMS Database.sql`).
4. Explore tables and queries via your preferred SQL client.


