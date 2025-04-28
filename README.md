# TapPay

**TapPay** is a full-stack web application designed to handle point-of-sale (POS) transactions efficiently.  
It includes a modern, responsive frontend and a robust backend for handling payments, customers, products, shifts, and reporting.

## Project Structure

```
tappay/
│
├── Tappay-backend/         # Backend server (Node.js, Express)
├── Tappay-frontend/        # Frontend app (React)
└── README.md     # This file
```

## Features

- 💳 **Point of Sale System** for quick and reliable payments
- 🧾 **Receipts and Refunds Management**
- 👥 **Customer Database** and loyalty handling
- 📦 **Product Inventory** with stock control
- 🕒 **Shift Management** (open/close cash registers)
- 📈 **Sales Reports**

## Tech Stack

- **Frontend:** React, Redux, Styled-Components, Material-UI
- **Backend:** Node.js, NestJs
- **Database:** MySQL

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/jihenedoudech/TAPPAY.git
cd tappay
```

### 2. Install backend dependencies

```bash
cd Tappay-backend
npm install
```

### 3. Install frontend dependencies

```bash
cd ../Tappay-frontend
npm install
```

### 4. Run the backend server

```bash
cd Tappay-backend
npm run start:dev
```

### 5. Run the frontend app

```bash
cd ../Tappay-frontend
npm run start
```
