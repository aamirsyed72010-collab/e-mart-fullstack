# E-Mart Fullstack E-commerce Platform

This is a full-stack e-commerce application featuring a React frontend, a Node.js (Express) backend running on Firebase Functions, and Firestore as the database.

## Project Structure

- **/e-mart-frontend**: The Create React App for the client-side application.
  - `src/`: Contains all the React components, pages, contexts (state management), and services.
- **/functions**: The Firebase Functions backend.
  - `routes/`: Contains the Express route handlers for different API endpoints.
  - `index.js`: The main entry point for the Firebase Function, which sets up the Express server and middleware.
- **firebase.json**: Configuration for Firebase services, including hosting and functions.
- **.firebaserc**: Specifies the Firebase project.

## Tech Stack

- **Frontend**: React, Material-UI (MUI), React Router, Framer Motion
- **Backend**: Node.js, Express.js, Firebase Functions
- **Database**: Google Firestore
- **Authentication**: Firebase Authentication (Google Sign-In)

## Local Development Setup

To run this project locally, you will need Node.js and the Firebase CLI installed.

### 1. Backend Setup (Firebase Emulators)

The backend runs on Firebase Functions and uses the Firestore database. The Firebase Emulators allow you to run this entire environment on your local machine.

1.  **Navigate to the functions directory:**
    ```bash
    cd functions
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the emulators:**
    From the **root** of the `e-mart` project directory, run:
    ```bash
    firebase emulators:start
    ```
    This command will start the Functions and Firestore emulators. The API will be available at the URL shown in the terminal (usually `http://127.0.0.1:5003`).

### 2. Frontend Setup

1.  **Navigate to the frontend directory:**
    ```bash
    cd e-mart-frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Start the development server:**
    ```bash
    npm start
    ```
    This will open the application in your browser, usually at `http://localhost:3000`. The frontend is configured to connect to the local emulated backend.

---
