# Treatwell Next - Project Report

## 1. Project Title
**Treatwell Next: A Modern Doctor-Patient Portal**

## 2. Project Objective / Overview

Treatwell Next is a modern, full-stack web application designed to bridge the gap between patients and doctors. It provides a seamless platform for patients to find doctors, book appointments, and manage their health records. Doctors can manage their appointments, write prescriptions, and view patient medical histories. The application features separate, feature-rich dashboards for both patients and doctors.

This project is built with Next.js and TypeScript, leveraging a MongoDB database for data persistence. It is designed to be a comprehensive solution for digital healthcare management, improving accessibility and efficiency in healthcare services.

## 3. Technologies Used

| Category | Technology/Library | Version | Description |
| :--- | :--- | :--- | :--- |
| **Core Framework** | Next.js | `15.3.3` | React framework for building full-stack web applications with server-side rendering and API routes. |
| | React | `^19.0.0` | A JavaScript library for building user interfaces. |
| | Node.js | `^20` | JavaScript runtime environment for the backend. |
| **Language** | TypeScript | `^5` | A typed superset of JavaScript that compiles to plain JavaScript. |
| **Styling**| Tailwind CSS | `^4` | A utility-first CSS framework for rapid UI development. |
| **Frontend Libraries**| Framer Motion | `^12.17.0` | A production-ready motion library for React. Used for animations. |
| | Lucide React | `^0.514.0` | A library of simply beautiful and consistent icons. |
| | Chart.js | `^4.4.9` | A flexible JavaScript charting library. Used for data visualization in dashboards. |
| | react-chartjs-2 | `^5.3.0` | React components for Chart.js. |
| | html2canvas | `^1.4.1` | Takes "screenshots" of webpages. Used for PDF generation. |
| | jspdf | `^3.0.1` | A library to generate PDFs in client-side JavaScript. Used for creating downloadable prescriptions. |
| **Backend & API** | Next.js API Routes | `15.3.3` | Serverless functions for building the backend API. |
| | Nodemailer | `^7.0.4` | A module for Node.js to allow easy email sending. Used for password reset and OTP emails. |
| **Database** | MongoDB | - | A NoSQL, document-oriented database. |
| | Mongoose | `^8.4.1` | An Object Data Modeling (ODM) library for MongoDB and Node.js. |
| **Authentication** | NextAuth.js | `^4.24.11` | An authentication library for Next.js projects. Simplifies adding authentication with providers like Google. |
| | JSON Web Token | `^9.0.2` | A standard for creating access tokens. Used for session management. |
| | bcrypt.js | `^2.4.3` | A library to help you hash passwords securely. |
| | Google APIs | `^150.0.1`| Node.js client library for using Google APIs. Used for Google OAuth 2.0. |
| **Utilities** | UUID | `^11.1.0` | A library for creating universally unique identifiers. Used for generating unique appointment IDs. |
| **Development Tools**| ESLint | `^9` | A pluggable and configurable linter tool for identifying and reporting on patterns in JavaScript. |

## 4. Detailed Project Folder Structure

Below is the detailed and exact folder structure of the `treatwell-next` project.

```
treatwell-next/
├── public/
│   ├── default-avatar.png
│   ├── doctor-homepage.jpg
│   ├── doctor-login.jpg
│   ├── doctor-register.jpg
│   ├── ... (other images and assets)
│   └── uploads/
│       ├── 1749895401505-Gojo-PNG-Image.png
│       └── doctors/
│           └── ... (uploaded doctor profile pictures)
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── appointments/
│   │   │   │   ├── [id]/route.ts
│   │   │   │   ├── meeting-link/route.ts
│   │   │   │   └── route.ts
│   │   │   ├── auth/
│   │   │   │   ├── doctor/
│   │   │   │   │   ├── forgot-password/route.ts
│   │   │   │   │   ├── register/route.ts
│   │   │   │   │   ├── reset-password-otp/route.ts
│   │   │   │   │   └── verify-otp/route.ts
│   │   │   │   ├── doctor-login/route.ts
│   │   │   │   ├── forgot-password/route.ts
│   │   │   │   ├── google/
│   │   │   │   │   ├── callback/route.ts
│   │   │   │   │   └── route.ts
│   │   │   │   ├── login/route.ts
│   │   │   │   ├── profile/
│   │   │   │   │   ├── upload/route.ts
│   │   │   │   │   └── route.ts
│   │   │   │   ├── register/route.ts
│   │   │   │   ├── reset-password/[token]/route.ts
│   │   │   │   ├── reset-password-otp/route.ts
│   │   │   │   └── verify-otp/route.ts
│   │   │   ├── doctors/
│   │   │   │   ├── [id]/route.ts
│   │   │   │   ├── specialities/route.ts
│   │   │   │   └── route.ts
│   │   │   ├── health-data/route.ts
│   │   │   ├── patients/[id]/route.ts
│   │   │   ├── prescriptions/route.ts
│   │   │   ├── reviews/route.ts
│   │   │   ├── reviews-doctor/route.ts
│   │   │   ├── seed-bmdc/route.ts
│   │   │   └── stats/route.ts
│   │   ├── appointments/page.tsx
│   │   ├── book-appointment/[id]/page.tsx
│   │   ├── doctor/
│   │   │   ├── appointments/page.tsx
│   │   │   ├── forgot-password/page.tsx
│   │   │   ├── login/page.tsx
│   │   │   ├── medical-history/page.tsx
│   │   │   ├── page.tsx
│   │   │   ├── payment/[id]/page.tsx
│   │   │   ├── prescription/[id]/page.tsx
│   │   │   ├── profile/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── doctor-list/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   ├── health-tracker/page.tsx
│   │   ├── login/page.tsx
│   │   ├── medical-history/page.tsx
│   │   ├── payment/[id]/page.tsx
│   │   ├── payment-history/page.tsx
│   │   ├── prescription/[id]/page.tsx
│   │   ├── profile/page.tsx
│   │   ├── register/page.tsx
│   │   ├── reset-password/[token]/page.tsx
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── MeetingModal.tsx
│   │   └── Notification.tsx
│   ├── lib/
│   │   └── dbConnect.ts
│   └── models/
│       ├── Appointment.ts
│       ├── BmdcDoctor.ts
│       ├── Doctor.ts
│       ├── HealthData.ts
│       ├── Patient.ts
│       ├── Prescription.ts
│       ├── Review.ts
│       └── ReviewDoctor.ts
├── .eslintrc.js
├── next.config.mjs
├── package.json
├── postcss.config.mjs
├── tsconfig.json
└── PROJECT_REPORT.md
```

## 5. Main Features

The application's features are broken down by user role (Patient and Doctor) and core functional areas.

### 5.1 Authentication & Authorization (Patient & Doctor)

A robust, role-based authentication system ensures secure access for both patients and doctors.

-   **Patient Authentication**:
    -   **Registration**: Patients can create an account using their email and a password. Passwords are encrypted using `bcryptjs`. (`/register`)
    -   **Login**: Secure login with email and password. A **JSON Web Token (JWT)** is generated upon successful login to manage the user's session. (`/login`)
    -   **Google OAuth 2.0**: Patients can register or log in using their Google account for convenience, handled via `next-auth`.
    -   **Password Reset**:
        -   Patients can request a password reset by providing their email address. (`/forgot-password`)
        -   An OTP (One-Time Password) is sent to the registered email using **Nodemailer**.
        -   The OTP is verified, and the user can set a new password.

-   **Doctor Authentication**:
    -   **Separate Portals**: Doctors use a distinct and separate portal for registration and login to ensure security and role separation. (`/doctor/register`, `/doctor/login`)
    -   **Secure Registration & Login**: Similar to patients, doctors have their own secure registration and login process, which generates a role-specific JWT.
    -   **Password Reset**: A separate password reset flow is implemented for doctors, also using email and OTP verification.

### 5.2 Patient-Facing Features

-   **Profile Management**:
    -   Patients can view and update their personal information. (`/profile`)
    -   Includes a feature to upload a profile picture, which is stored in the `public/uploads` directory.

-   **Doctor Discovery & Booking**:
    -   **Doctor Listing**: Patients can view a list of all available doctors on the platform. (`/doctor-list`)
    -   **Advanced Search & Filter**: The list can be searched by doctor's name and filtered by medical speciality.
    -   **Sorting**: Results can be sorted by name or speciality for easier browsing.
    -   **Appointment Booking**: Patients can select a doctor and book an available time slot. (`/book-appointment/[id]`)

-   **Patient Dashboard & Health Management**:
    -   **Appointment History**: View a comprehensive list of all past and upcoming appointments. (`/appointments`)
    -   **Medical History**: Access a consolidated view of past prescriptions and consultation notes. (`/medical-history`)
    -   **Prescription Access**: View and download digital prescriptions provided by doctors as PDF files, generated using `jspdf` and `html2canvas`. (`/prescription/[id]`)
    -   **Payment History**: Track all payments made for consultations. (`/payment-history`)
    -   **Health Tracker**:
        -   A dedicated section for patients to log and monitor personal health metrics (e.g., blood pressure, blood sugar). (`/health-tracker`)
        -   Data is visualized using **Chart.js** to show trends over time.

-   **Reviews and Ratings**:
    -   Patients can submit reviews and ratings for doctors after a completed appointment, contributing to a transparent and trustworthy platform.

### 5.3 Doctor-Facing Features

-   **Doctor Dashboard**: A central hub for doctors to manage their activities. (`/doctor`)
    -   **Appointment Management**: View a list of all upcoming and past appointments, including patient details. (`/doctor/appointments`)
    -   **Patient Medical History Access**: Doctors can securely access the medical history of patients who have booked a consultation with them. (`/doctor/medical-history`)

-   **Prescription Management**:
    -   Doctors can digitally create, view, and manage prescriptions for their patients after a consultation. (`/doctor/prescription/[id]`)
    -   Prescriptions are linked to specific appointments and patients.

-   **Profile Management**:
    -   Doctors can create and update their professional profile, including their speciality, qualifications, designation, and profile picture. (`/doctor/profile`)
    -   This information is publicly visible to patients on the doctor listing page.

### 5.4 System & Administrative Features

-   **Payment Integration**:
    -   A payment page is integrated to handle appointment fees securely. (`/payment/[id]`)
    -   The system tracks payment status (`paid`/`unpaid`) for each appointment.

-   **Video Consultation**:
    -   The application is set up for video consultations, with a dedicated API endpoint for generating meeting links (`/api/appointments/meeting-link`) and a `MeetingModal` component in the frontend.

-   **Database Seeding**:
    -   An administrative API endpoint (`/api/seed-bmdc`) exists to populate the database with a list of verified doctors, ensuring data integrity from the start.

-   **Application Statistics**:
    -   An API endpoint (`/api/stats`) is available to fetch application-wide statistics, which can be used for an admin dashboard or reporting.

## 6. Code Snippets with Explanations

Here are some key code snippets that demonstrate the core functionalities of the application.

### 6.1 Database Connection (`src/lib/dbConnect.ts`)

This utility handles the connection to the MongoDB database. It uses a caching mechanism to reuse the database connection across multiple serverless function invocations in a development environment, which is a best practice for performance and efficiency in Next.js.

```typescript
import mongoose, { Mongoose } from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

// ... error handling for missing URI ...

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;
```

### 6.2 Mongoose Model (`src/models/Appointment.ts`)

This file defines the schema for an appointment. It includes the data structure, types, and relationships for appointment records in the database. This model is used by the API to create, read, update, and delete appointment data.

```typescript
import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IAppointment extends Document {
  // ... interface properties
}

const AppointmentSchema: Schema<IAppointment> = new mongoose.Schema({
    appointmentId: { type: String, required: true, unique: true },
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctorId: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true },
    appointmentDate: { type: String, required: true },
    status: { type: String, enum: ['pending', 'Done', 'Declined'], default: 'pending' },
    paymentStatus: { type: String, enum: ['paid', 'unpaid'], default: 'unpaid' },
    // ... other fields
});

const AppointmentModel: Model<IAppointment> = mongoose.models.Appointment || mongoose.model<IAppointment>('Appointment', AppointmentSchema);

export default AppointmentModel;
```

### 6.3 API Route (`src/app/api/appointments/route.ts`)

This is a Next.js API route that handles `GET` and `POST` requests for appointments. The `GET` method fetches appointments for a specific patient or doctor, while the `POST` method creates a new appointment using the data sent in the request body.

```typescript
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Appointment from '@/models/Appointment';
import { v4 as uuidv4 } from 'uuid';

export async function GET(req: NextRequest) {
    // ... logic to fetch appointments ...
}

export async function POST(req: NextRequest) {
    await dbConnect();
    
    try {
        const body = await req.json();
        const appointmentData = { ...body, appointmentId: uuidv4() };
        const newAppointment = await Appointment.create(appointmentData);
        return NextResponse.json({ success: true, data: newAppointment }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }
}
```

### 6.4 Frontend Component (`src/app/doctor-list/page.tsx`)

This client-side component displays the list of doctors. It fetches data from the `/api/doctors` endpoint, provides search and filter functionality, and renders the list of doctors in a user-friendly card layout. It manages its own state for search terms, filters, and the fetched doctor data.

```typescript
'use client';

import { useState, useEffect } from 'react';
import { IDoctor } from '@/models/Doctor';
// ... other imports

function DoctorListComponent() {
  const [doctors, setDoctors] = useState<IDoctor[]>([]);
  const [loading, setLoading] = useState(true);
  // ... other state variables

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await fetch('/api/doctors');
        const data = await res.json();
        setDoctors(data.data);
      } catch (err: any) {
        // ... error handling
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  // ... filter and sort logic ...

  return (
    // ... JSX to render the search/filter UI and list of doctors
  );
}
```

## 7. Screenshots of Web Pages / API Testing

*(Please add your screenshots here. You can capture images of the homepage, login/register pages, doctor list, patient dashboard, and doctor dashboard. For API testing, you can show screenshots from tools like Postman or Thunder Client.)*

**Placeholder for Homepage Screenshot**
![Homepage](https://via.placeholder.com/800x400.png?text=Homepage)

**Placeholder for Doctor List Page Screenshot**
![Doctor List](https://via.placeholder.com/800x400.png?text=Doctor+List+Page)

**Placeholder for Patient Dashboard Screenshot**
![Patient Dashboard](https://via.placeholder.com/800x400.png?text=Patient+Dashboard)

**Placeholder for API Testing Screenshot**
![API Testing](https://via.placeholder.com/800x400.png?text=API+Testing+with+Postman)

## 8. Challenges Faced and How You Solved Them

-   **Challenge 1: Node Modules Corruption**
    -   **Problem**: During development, the `node_modules` directory and related libraries, including Next.js itself, became corrupted multiple times. This was likely due to system storage issues or abrupt interruptions of the `npm install` process, leading to inconsistent and unpredictable errors that were difficult to debug.
    -   **Solution**: A standard recovery procedure was established. This involved completely deleting the `node_modules` folder and the `package-lock.json` file, clearing the npm cache with `npm cache clean --force`, and then running `npm install` again to fetch fresh, clean copies of all dependencies. This reliable process resolved the corruption issues every time they occurred.

-   **Challenge 2: Complex Data Relationships**
    -   **Problem**: The application's core functionality relies on intricate relationships between different data models. For instance, a `Patient` can have many `Appointments`, each `Appointment` is linked to one `Doctor` and one `Patient`, and a `Prescription` is tied to a specific `Appointment`. Managing this "web" of data, ensuring consistency, and fetching related data efficiently was a significant challenge.
    -   **Solution**: Mongoose's powerful features were leveraged to manage these relationships. The schemas were designed using `ref` to create references between models (e.g., `patientId: { type: Schema.Types.ObjectId, ref: 'Patient' }`). When fetching data, the `.populate()` method was used to automatically replace the referenced IDs with the actual document data from another collection. This allowed for clean, efficient querying of complex, interrelated data without writing manual join logic.

-   **Challenge 3: Email Integration for Notifications**
    -   **Problem**: Implementing a reliable system for sending emails—such as for OTP verification during password resets—involved several components: setting up an email delivery service, managing email templates, and configuring the SMTP transport securely.
    -   **Solution**: **Nodemailer** was chosen as the primary library for sending emails from the Node.js backend. A secure SMTP transport was configured using credentials stored as environment variables. The API routes for features like "forgot password" were integrated with a utility function that would generate an email with a unique OTP and send it to the user's registered address, enabling a secure and functional password reset flow.

-   **Challenge 4: Evolving Database Schema (Database Updation)**
    -   **Problem**: As the project grew, new features often required adding new fields to existing Mongoose models (e.g., adding a `paymentStatus` to the `Appointment` model). This created a challenge where older data in the database, which lacked these new fields, could cause errors or unexpected behavior when accessed by the updated code.
    -   **Solution**: This was managed by making the schema updates backward-compatible. When adding new fields to a Mongoose schema, a `default` value was always provided (e.g., `paymentStatus: { type: String, default: 'unpaid' }`). This ensured that when the application fetched an old document, Mongoose would automatically apply the default value, preventing crashes and making the process of testing with old data much smoother. For more complex changes, a migration script could be written to update all existing documents, but default values handled most cases effectively during development.

## 9. Conclusion / Learning Outcomes

This project was a comprehensive exercise in building a full-stack web application using modern technologies. The development of Treatwell Next provided significant hands-on experience with the Next.js framework, including its App Router, API routes, and server-side rendering capabilities.

Key learning outcomes include:
-   **Full-Stack Development with Next.js**: Gained proficiency in building both the frontend and backend within a single framework.
-   **Database Management**: Learned how to design and interact with a NoSQL database (MongoDB) using Mongoose, including schema design and data modeling.
-   **Authentication and Authorization**: Implemented a robust, role-based authentication system from scratch using JWTs.
-   **React and TypeScript**: Strengthened skills in building type-safe, component-based user interfaces with React and TypeScript.
-   **Problem-Solving**: Overcame common web development challenges related to state management, security, and performance optimization.

Overall, the project successfully meets its objective of creating a functional and user-friendly healthcare portal, and it has provided invaluable experience in modern web development practices. 