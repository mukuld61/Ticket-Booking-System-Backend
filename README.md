# 🎫 Ticket Booking System – Backend

## 📌 Project Overview

The **Ticket Booking System Backend** is a full-stack–ready, role-based RESTful API designed to manage **multi-mode ticket bookings** including **Flight, Bus, and Rail** services. The system handles the complete booking lifecycle such as passenger management, booking updates, cancellations, refunds, invoice generation, and ledger tracking.

This backend is built using **Node.js**, **Express**, **Sequelize ORM**, and **MySQL**, following a clean, modular, and scalable architecture. It implements real-world business logic and secure authentication, making it suitable for enterprise-level ticket management systems.

---

## 🚀 Key Features

- Role-based access control (Admin, Agent, Client)
- Multi-type bookings (Flight / Bus / Rail)
- Passenger management with booking-type filtering
- Booking creation, modification, and update tracking
- Cancellation and refund handling
- Invoice generation with charge calculations
- Ledger and cashbook management
- JWT-based authentication and authorization
- Modular REST API architecture
- Secure environment-based configuration

---

## 🛠️ Tech Stack

- **Node.js** – Server-side runtime
- **Express.js** – Web application framework
- **MySQL** – Relational database
- **Sequelize ORM** – Database modeling and queries
- **JWT (JSON Web Token)** – Authentication & authorization
- **REST API** – Client–server communication

---

## 🧩 Backend Architecture

The backend follows a **layered architecture** to ensure scalability and maintainability:


### Architecture Responsibilities
- **Routes**: Define API endpoints
- **Controllers**: Handle HTTP requests and responses
- **Services**: Implement business logic and calculations
- **Models**: Define database schema and relationships
- **Middleware**: Authentication, authorization, validation

---

## 📁 Project Structure


---

## 🔐 Authentication & Authorization

- JWT-based authentication
- Role-based authorization (Admin, Agent, Client)
- Secure access to protected routes using middleware
- Token validation on every authenticated request

---

## 💳 Booking & Financial Logic

The system implements real-world financial workflows, including:
- Fare and service charge calculation
- Booking update and change tracking
- Cancellation penalties and refund logic
- Invoice generation with detailed charges
- Ledger and cashbook entries for transactions

All financial calculations and validations are handled in the **service layer** to ensure accuracy and consistency across the system.



