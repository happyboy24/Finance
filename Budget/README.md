# Budget App

A simple budget tracking application built with React and Vite, featuring a Node.js/Express backend for data persistence.

## Features

- Add income and expense entries by month and year
- View monthly summaries with income, expenses, and savings
- Multi-month summary view (6 or 12 months)
- Persistent data storage via JSON file
- Responsive design

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm

### Installation

1. Clone the repository
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Install backend dependencies:
   ```bash
   cd backend
   npm install
   cd ..
   ```

### Running the Application

1. Start the backend:
   ```bash
   cd backend
   npm run dev
   ```
   The backend will run on http://localhost:3001

2. In a new terminal, start the frontend:
   ```bash
   npm run dev
   ```
   The frontend will run on http://localhost:5173 or next available port

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## API Endpoints

- `GET /api/entries` - Get all entries
- `POST /api/entries` - Add a new entry
- `DELETE /api/entries/:id` - Delete an entry by ID

## Technologies Used

- Frontend: React, Vite
- Backend: Node.js, Express
- Data Storage: JSON file
