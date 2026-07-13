# Airbnb Project

This is a full-stack Airbnb-style web application built with the MERN stack. It includes a React frontend and an Express backend connected to MongoDB.

## What this project does

- Browse property listings
- View listing details
- Sign up and log in users
- Save favourites
- Make bookings
- Manage listings from a host dashboard

## Technologies used

- Frontend: React, Vite, React Router
- Backend: Node.js, Express.js
- Database: MongoDB with Mongoose
- Authentication: bcryptjs and session-based auth
- Other tools: CORS, Helmet, Multer

## How to run the project

### 1. Install dependencies

From the project root, run:

```bash
npm install
npm install --prefix backend
npm install --prefix frontend
```

### 2. Create environment variables

Create a `.env` file inside the `backend` folder and add values like:

```env
MONGO_URI=your_mongodb_connection_string
PORT=3000
FRONTEND_URL=http://localhost:5173
SESSION_SECRET=your_secret_key
```

### 3. Start the app

Run the backend and frontend:

```bash
npm run dev
```

This will start:
- Backend: http://localhost:3000
- Frontend: http://localhost:5173

## Project structure

- `backend/` - Express server, routes, models, controllers
- `frontend/` - React app with pages and components
- `data/` - sample JSON data

## Notes

This project is ready for GitHub publishing and can later be changed to private if needed.
