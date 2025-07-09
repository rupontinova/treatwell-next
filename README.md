# Treatwell Next - Project Report

## 1. Introduction

Treatwell Next is a modern, full-stack web application designed to bridge the gap between patients and doctors. It provides a seamless platform for patients to find doctors, book appointments, and manage their health records. Doctors can manage their appointments, write prescriptions, and view patient medical histories. The application features separate, feature-rich dashboards for both patients and doctors.

This project is built with Next.js and TypeScript, leveraging a MongoDB database for data persistence. It is designed to be a comprehensive solution for digital healthcare management.

## 2. Core Features

The application is divided into two main user roles: **Patient** and **Doctor**.

### 2.1 Patient Features

- **Authentication**: Patients can register, log in, and log out. Support for Google OAuth is included. A "forgot password" feature with OTP verification is also available.
- **Doctor Discovery**: Patients can browse a list of doctors, view their profiles, and see their specialities and reviews.
- **Appointment Booking**: Patients can select a doctor, choose an available time slot, and book an appointment.
- **Payment System**: Integration with a payment gateway to process appointment fees.
- **Patient Dashboard**:
  - **Profile Management**: Patients can view and update their profile information, including uploading a profile picture.
  - **Medical History**: View a consolidated history of past appointments, prescriptions, and health data.
  - **Payment History**: Track all past payments for appointments.
  - **Health Tracker**: A feature to log and monitor personal health metrics over time.
- **Prescription Access**: View and download prescriptions issued by doctors.
- **Reviews and Ratings**: Patients can leave reviews for doctors after an appointment.

### 2.2 Doctor Features

- **Secure Authentication**: Doctors have a separate registration and login system.
- **Doctor Dashboard**:
  - **Appointment Management**: View upcoming and past appointments.
  - **Patient Medical History**: Access the medical history of patients who have booked an appointment.
  - **Prescription Management**: Create, view, and manage digital prescriptions for patients.
  - **Profile Management**: Doctors can update their professional profile, which is visible to patients.

### 2.3 System & Administrative Features

- **Video Consultations**: The application includes components and assets for facilitating video meetings between patients and doctors.
- **BMDC Doctor Seeding**: An API endpoint exists to seed the database with a list of doctors from the Bangladesh Medical and Dental Council (BMDC), ensuring the platform can be populated with verified professionals.
- **Statistics**: An API endpoint to fetch application statistics, useful for admin dashboards or reporting.

## 3. Technology Stack

- **Frontend**: Next.js (React Framework), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens), Google OAuth
- **Linting**: ESLint

## 4. Project Structure

The project follows a standard Next.js `app` router structure.

```
/
├── public/               # Static assets (images, fonts, etc.)
│   └── uploads/          # User-uploaded files
├── src/
│   ├── app/              # Application routes, pages, and API endpoints
│   │   ├── api/          # Backend API routes
│   │   │   ├── auth/     # Authentication logic
│   │   │   └── ...       # Other data models (doctors, appointments)
│   │   ├── (patient)/    # Patient-facing pages (login, register, dashboard)
│   │   ├── doctor/       # Doctor-facing pages and dashboard
│   │   └── ...           # Other top-level pages
│   ├── components/       # Reusable React components (e.g., MeetingModal)
│   ├── lib/              # Utility functions (e.g., dbConnect.ts)
│   └── models/           # Mongoose schemas for MongoDB
├── next.config.ts        # Next.js configuration
├── package.json          # Project dependencies and scripts
└── README.md             # This file
```

## 5. Setup and Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    ```
2.  **Navigate to the project directory:**
    ```bash
    cd treatwell-next
    ```
3.  **Install dependencies:**
    ```bash
    npm install
    ```
4.  **Set up environment variables:**
    Create a `.env.local` file in the root directory and add the necessary environment variables (e.g., `MONGODB_URI`, `JWT_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`).
5.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:3000`.
