# MediQueue

MediQueue is a patient appointment and clinic queue app built with React, Express, and MongoDB.

## Run locally

1. Copy `server/.env.example` to `server/.env`, then set `MONGO_URI` and a long random `JWT_SECRET`.
2. Start the API from `server` with `npm install` and `npm run dev`.
3. Start the client from `client` with `npm install` and `npm run dev`.
4. Create an administrator by setting `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` (at least 12 characters), and `ADMIN_PHONE` in `server/.env`, then run `npm run create-admin` from `server`. Remove those bootstrap values after the account is created.

Patients and doctors can register through the app. Admin accounts cannot be created through public registration. Doctor accounts create their professional profile after signing in.

## Included workflows

- Patient registration and login with bcrypt password hashing and signed JWT sessions.
- Doctor directory with specialties and availability details.
- Appointment booking with a per-doctor, per-day queue token.
- Patient appointment history and queue position estimates.
- Doctor queue controls for calling and completing patients.
- Administrator overview of patients, doctors, and recent appointments.

Patient and appointment access is scoped by the authenticated account. Production deployments should also enable database access controls, TLS, and encrypted backups.
