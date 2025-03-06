# Showroom Car VIP 🚗✨

Welcome to **Showroom Car VIP**, an e-commerce platform designed for car showrooms. This platform allows users to explore a wide range of cars, manage orders, and access an admin dashboard for managing car listings and orders.

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Setup & Installation](#setup--installation)
- [License](#license)

---

## Overview

**Showroom Car VIP** is an online car showroom that supports three types of users:

- **Admin**: Manages car listings (CRUD operations), handles orders, and manages users.
- **Buyer**: Registers, logs in, browses cars, adds them to the cart, and places orders.
- **Viewer**: Views the car listings without making purchases or leaving reviews.

---

## Features 🚀

### 1. **Authentication & User Management** 🔐
- User registration, login, and logout using **Firebase Authentication**.
- Firebase SDK handles session management securely.

### 2. **Home Page** 🏠
- **Navigation Bar** with easy access to:
  - Car Models
  - New Cars
  - Minh Nghia Center
  - Services
  - Featured Cars
- Dynamic car listings with images.
- **Search & Filter**: Find cars based on price, brand, and color.

### 3. **Car Management** 🚙
- **For Buyers**:
  - View detailed car information.
  - Browse reviews from other customers.
  - Add cars to the cart and proceed to checkout.
- **For Admins**:
  - Full CRUD functionality for managing car listings (Add, Edit, Delete).
  - Manage car categories (e.g., SUV, Sedan, Coupe).
  - Upload and manage car images via **Firebase Storage**.

### 4. **Shopping Cart & Order Management** 🛒
- **Buyers** can add cars to their cart and place an order.
- **Admins** can review and update order statuses (Pending, In Progress, Delivered).
  
### 5. **Admin Dashboard** 🛠️
- Admins can manage car listings and order statuses.
- Access sales statistics, view total revenue, and track number of cars sold.
- Process payments (Payment gateway integration coming soon).

---

## Technology Stack 💻

### Frontend:
- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **UI**: Tailwind CSS
- **State Management**: tRPC
- **Authentication**: Firebase
- **Data Management**: React Query

### Backend:
- **Framework**: Next.js API Routes (tRPC)
- **ORM**: Prisma
- **Database**: PostgreSQL (Neon)
- **Authentication**: Firebase Authentication
- **Image Storage**: Firebase Storage

---

## Setup & Installation ⚙️

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/showroom-car-vip.git
