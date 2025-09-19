# Finsecure Platform

## Project Overview

Finsecure is a robust fraud detection and transaction monitoring platform designed to provide real-time security insights for financial transactions. This platform is localized for Ghana, with all transactions processed in Ghanaian Cedis (GHS) and adhering to local geographic contexts. It features a user-friendly frontend dashboard for users and administrators, coupled with a powerful Node.js backend for transaction processing, risk assessment, and user management.

## Features

*   **User Authentication:** Secure signup and login functionality with role-based access control (Admin, Analyst, Regular User).
*   **Transaction Monitoring:** Real-time monitoring and display of financial transactions.
*   **Fraud Detection:** Automated risk assessment for transactions based on various parameters (amount, time, merchant, location, velocity).
*   **Alert Management:** Generation and management of security alerts with severity levels and assignment capabilities.
*   **User Dashboard:** Personalized dashboard for regular users to view their transaction history and security alerts.
*   **Admin Dashboard:** Comprehensive dashboard for administrators and analysts to oversee all transactions, alerts, and system statistics.
*   **Transaction Creation:** Functionality for users to initiate new transactions with various channels (mobile app, web, POS).
*   **Ghana Localization:** All currency displayed and processed in GHS, with mock data reflecting Ghanaian merchants and locations.

## Technologies Used

### Frontend
*   **React:** A JavaScript library for building user interfaces.
*   **TypeScript:** A superset of JavaScript that adds static typing.
*   **React Router DOM:** For declarative routing in React applications.
*   **Axios:** Promise-based HTTP client for making API requests.
*   **Tailwind CSS:** A utility-first CSS framework for rapid UI development.
*   **Heroicons:** A set of free MIT-licensed high-quality SVG icons.
*   **React Hook Form:** For efficient and flexible form validation.
*   **Yup:** A schema builder for value parsing and validation.

### Backend
*   **Node.js:** JavaScript runtime environment.
*   **Express.js:** A fast, unopinionated, minimalist web framework for Node.js.
*   **TypeScript:** For type-safe backend development.
*   **bcryptjs:** A library for hashing passwords.
*   **jsonwebtoken:** For implementing JSON Web Token (JWT) based authentication.
*   **express-validator:** A middleware for Express.js that wraps `validator.js` for server-side validation.
*   **uuid:** For generating unique IDs.
*   **dotenv:** For loading environment variables from a `.env` file.

## Setup and Installation

Follow these steps to get the Finsecure platform running on your local machine.

### Prerequisites

*   **Node.js (v18 or higher) & npm:** Download and install from [nodejs.org](https://nodejs.org/).
*   **Git:** Download and install from [git-scm.com](https://git-scm.com/).

### Cloning the Repository

First, clone the Finsecure repository to your local machine:

```bash
git clone https://github.com/your-username/Finsecure.git # Replace with your actual repo URL
cd Finsecure
```

### Frontend Setup

Navigate to the `finsecure-frontend` directory and install the dependencies:

```bash
cd frontend
npm install
```

### Backend Setup

Navigate to the `backend` directory and install the dependencies:

```bash
cd ../backend
npm install
```

### Environment Variables

Both the frontend and backend require environment variables.

#### Backend `.env`

Create a `.env` file in the `backend` directory with the following content:

```
PORT=5001
JWT_SECRET=your_jwt_secret_key # Replace with a strong, random secret
```
_Note:_ The `JWT_SECRET` is used for signing and verifying JWT tokens. Make sure it's a strong, unpredictable string.

## Running the Application

### Start the Backend Server

From the `backend` directory, run:

```bash
npm run dev
```
This will start the backend server on `http://localhost:5001`. `nodemon` will watch for changes and automatically restart the server.

### Start the Frontend Application

From the `frontend` directory, run:

```bash
npm start
```
This will start the React development server on `http://localhost:3000`.

Open your web browser and navigate to `http://localhost:3000` to access the Finsecure platform.

## Available User Roles & Credentials

You can use the following mock user accounts to test the application. The default password for all mock users is `password123`.

*   **Admin User:**
    *   **Email:** `admin@finsecure.com`
    *   **Password:** `password123`
*   **Analyst User:**
    *   **Email:** `analyst@finsecure.com`
    *   **Password:** `password123`
*   **Regular User:**
    *   **Email:** `user@finsecure.com`
    *   **Password:** `password123`

## API Endpoints (Backend)

Here's a summary of the main API endpoints exposed by the backend:

*   **Authentication (`/api/auth`)**
    *   `POST /signup`: Register a new user.
    *   `POST /login`: Authenticate a user and receive a JWT.
    *   `POST /logout`: Log out the current user.
    *   `POST /change-password`: Change a user's password.
    *   `POST /verify-email`: Verify if an email exists in the system.
*   **Transactions (`/api/transactions`)**
    *   `GET /`: Get a paginated list of all transactions.
    *   `GET /:id`: Get details of a specific transaction.
    *   `POST /`: Create a new transaction.
*   **Alerts (`/api/alerts`)**
    *   `GET /`: Get a paginated list of all alerts.
    *   `GET /:id`: Get details of a specific alert.
    *   `PATCH /:id`: Update an alert's status or assignee.
*   **Users (`/api/users`)**
    *   `GET /`: Get a paginated list of all users.
    *   `GET /:id`: Get details of a specific user.
    *   `PATCH /:id`: Update user details.
*   **Dashboard (`/api/dashboard`)**
    *   `GET /stats`: Get overall dashboard statistics.
    *   `GET /chart/transactions`: Get transaction data for charts.
    *   `GET /chart/risk-distribution`: Get risk distribution data for charts.
    *   `GET /alerts/top/:limit`: Get top N alerts.

---
© 2025 Finsecure Platform. All rights reserved.
