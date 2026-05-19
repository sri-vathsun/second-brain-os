# 🧠 Second Brain OS

> An AI-powered digital memory layer designed to help you securely store, intuitively organize, and intelligently retrieve your digital information.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)

## ✨ Features

- **Premium UI/UX:** A stunning, modern glassmorphism interface built with Next.js and Tailwind CSS.
- **Intelligent Knowledge Retrieval:** Semantic search and AI-driven retrieval powered by Hugging Face embeddings and Chroma DB.
- **Robust Architecture:** Full-stack microservices environment using FastAPI, PostgreSQL, and Docker.
- **Secure Authentication:** JWT-based secure user authentication and session management.

## 🛠️ Tech Stack

- **Frontend:** Next.js, React, Tailwind CSS
- **Backend:** FastAPI, Python, PostgreSQL, SQLAlchemy
- **AI Services:** Chroma DB, Hugging Face Sentence Transformers
- **Infrastructure:** Docker & Docker Compose

## 📁 Project Structure

```text
second-brain-os/
├── frontend/       # Next.js application for the user interface
├── backend/        # FastAPI application for the core REST API
├── ai-services/    # Python services for embeddings and generation
├── docs/           # Project documentation
├── docker/         # Docker-related files for containerization
├── scripts/        # Utility scripts for database migrations, etc.
└── deployment/     # Configuration for deployment
```

## 🚀 Getting Started

The easiest way to run the entire stack locally is by using Docker Compose.

### Prerequisites

- [Docker](https://www.docker.com/get-started) and Docker Compose
- [Node.js](https://nodejs.org/) (for manual frontend setup)
- [Python 3.10+](https://www.python.org/downloads/) (for manual backend setup)

### Option 1: Running with Docker (Recommended)

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/second-brain-os.git
   cd second-brain-os
   ```

2. Start the services using Docker Compose:
   ```bash
   docker-compose up --build
   ```

3. Access the applications:
   - **Frontend:** [http://localhost:3000](http://localhost:3000)
   - **Backend API Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)
   - **AI Service API Docs:** [http://localhost:8001/docs](http://localhost:8001/docs)

### Option 2: Manual Setup

#### Frontend
1. Navigate to the `frontend` directory: `cd frontend`
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`

#### Backend
1. Navigate to the `backend` directory: `cd backend`
2. Activate the virtual environment: `.\venv\Scripts\activate` (Windows) or `source venv/bin/activate` (Mac/Linux)
3. Run the server: `uvicorn main:app --reload`

#### AI Services
1. Navigate to the `ai-services` directory: `cd ai-services`
2. Activate the virtual environment: `.\venv\Scripts\activate`
3. Run the server: `uvicorn main:app --port 8001 --reload`

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📝 License

This project is [MIT](LICENSE) licensed.
