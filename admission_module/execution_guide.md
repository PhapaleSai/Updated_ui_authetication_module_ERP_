# Full Module Execution Guide

This guide covers everything you need to run the Admission and Enrollment module from scratch on your local machine.

## Prerequisites

1.  **PostgreSQL** installed and running on your computer.
2.  **Node.js** and **npm** installed.
3.  **Python 3.10+** installed.

---

## 1. Postman Collection

I have already generated a complete Postman collection containing all of your backend's API endpoints!

-   **Location**: `e:\DOWNLOADS\Admission and Enrollment Module\Admission and Enrollment Module\postman_collection.json`
-   **How to Use**:
    1.  Open the Postman app.
    2.  Click **"Import"** in the top left corner.
    3.  Drag and drop the `postman_collection.json` file into Postman.
    4.  You will instantly have a folder containing all the predefined routes (`/submit`, `/upload`, `/pay`, etc.) ready to be tested!

---

## 2. Running The Backend Server

The backend provides the API, logic, and database connection.

1.  Open a new terminal in VS Code (or PowerShell).
2.  Navigate to the correct backend directory:
    ```bash
    cd "e:\DOWNLOADS\Admission and Enrollment Module\Admission and Enrollment Module"
    ```
3.  Activate the virtual environment:
    ```bash
    .\.venv\Scripts\activate
    ```
4.  *(First Time Only)* If you haven't seeded the database, run the seed file to put mock User ID 1 into your database so foreign keys work:
    ```bash
    python seed.py
    ```
5.  Start the FastAPI Server:
    ```bash
    uvicorn app.main:app --reload
    ```
    *The backend server is now running on `http://127.0.0.1:8000`.*

---

## 3. Running The Frontend App

The frontend is the React graphical user interface you interact with in the browser.

> [!WARNING]
> Your previous `npm run dev` failed because you were in the wrong folder! You must be inside the `frontend` folder where `package.json` lives.

1.  Open a **second** independent terminal in VS Code.
2.  Navigate into the `frontend` directory:
    ```bash
    cd "e:\DOWNLOADS\Admission and Enrollment Module\Admission and Enrollment Module\frontend"
    ```
3.  Install dependencies (if it's your first time):
    ```bash
    npm install
    ```
4.  Start the Vite developer server:
    ```bash
    npm run dev
    ```
5.  **Ctrl + Click** the local link (usually `http://localhost:5173`) to open the app in your browser.

---

## 4. End-to-End User Flow Execution

Now that both servers are running, here is how a student applies to your college from start to finish:

1.  **Dashboard**: Navigate to `http://localhost:5173/`. You are shown the current status of your application.
2.  **Purchase Brochure**: Go to the **Brochure** section on the side menu. Select a course and click **Pay**. (This creates a brochure request and completes payment in the PostgreSQL database).
3.  **Application Form**: Go to the **Admission Form** section. Fill out your Personal & Academic details and click **Save**. (The frontend bundles this and POSTs to `/api/v1/applications/submit`).
4.  **Upload Documents**: Go to the **Documents** section. Upload a dummy image representing your Aadhar Card. Click **Finalize Application**.
5.  **Status Review**: The system will redirect you back to the Dashboard displaying that the form is now submitted and **Under Review** by Admin!
