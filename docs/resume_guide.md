# 🧠 Second Brain OS - Resume Inclusion Guide

This guide provides everything you need to showcase the **Second Brain OS** project on your resume, including professional descriptions, bullet points using the STAR method, technical details, and interview preparation tips.

---

## 📋 Pre-Resume Checklist

Before putting the project on your resume, make sure you complete these steps to make a strong impression on recruiters and hiring managers:

1. **Verify Your Links:**
   - **GitHub Repository:** Ensure your repository is public and accessible.
     - Your repository: `https://github.com/sri-vathsun/second-brain-os`
   - **Live Production URL:** Having a live link sets you apart. 
     - Frontend (Vercel): `https://second-brain-os.vercel.app` (or your custom URL)
     - Ensure the application is fully functional, backend endpoints are responsive, and database connection is stable.

2. **Refine Your README:**
   - Ensure the repository has a clean, professional README with screenshots or a GIF demo. (The root `README.md` is already structured nicely!)

---

## 📄 Resume Templates

### Option 1: Detailed Professional Experience / Project Section (Recommended)

**Second Brain OS (AI-Powered Digital Memory Layer)** | *Lead Full-Stack & AI Engineer*
*GitHub: [github.com/sri-vathsun/second-brain-os](https://github.com/sri-vathsun/second-brain-os) | Live Demo: [second-brain-os.vercel.app](https://second-brain-os.vercel.app)*
**Tech Stack:** Next.js (React), TypeScript, FastAPI (Python), PostgreSQL, Supabase, ChromaDB, Hugging Face Transformers, Docker, Docker Compose, Vercel

* **Full-Stack Architecture:** Engineered and deployed a microservices-based personal knowledge management application ("Second Brain OS") using a Next.js frontend, a FastAPI backend, and an AI embedding pipeline.
* **Semantic Vector Search:** Integrated Hugging Face sentence transformers (`all-MiniLM-L6-v2`) and ChromaDB vector database to enable semantic similarity search over stored documents and notes, moving beyond keyword matching.
* **Dynamic Knowledge Visualization:** Designed and implemented a dynamic visual knowledge graph using React Flow, writing connection logic in Python to extract keywords and map relationship edges between related nodes.
* **Multi-Modal Data Ingestion:** Developed ingestion pipelines supporting PDF parsing (via PyMuPDF) and real-time audio file transcription to convert voice memos into structured, vector-indexed digital notes.
* **Secure Session Management:** Built JWT-based user authentication using `passlib` (bcrypt) for secure password hashing and scoped endpoint protection.
* **DevOps & Cloud Deployment:** Standardized local environments using Docker Compose for containerized microservices and automated serverless deployment to Vercel connected to a remote PostgreSQL database on Supabase.

---

### Option 2: Short & Punchy Format (For page-limited resumes)

**Second Brain OS** – *Full-Stack AI Knowledge Base*
* **Technologies:** Next.js, FastAPI, PostgreSQL (Supabase), ChromaDB, Hugging Face Embeddings, Docker, Vercel
* Developed a full-stack personal AI assistant that automates note organization, processes PDF and voice note ingestion, and visualizes connections between notes via an interactive knowledge graph.
* Built a vector-retrieval pipeline utilizing Hugging Face embeddings and ChromaDB to perform high-performance semantic search over unstructured text.
* Containerized services using Docker and hosted the application using Vercel serverless functions connected to Supabase PostgreSQL.

---

## 🛠️ Tech Stack Breakdowns

Be prepared to explain why you chose these technologies:

| Layer | Technology | Why you used it / Interview explanation |
| :--- | :--- | :--- |
| **Frontend** | **Next.js & TypeScript** | React-based framework for server-side rendering capability, typescript for type-safety, and optimized performance. |
| **Styling** | **Tailwind CSS** | Allowed rapid development of a premium, glassmorphism UI with clean responsive design. |
| **Backend API** | **FastAPI** | Extremely fast Python framework with automatic OpenAPI docs (`/docs`) and built-in support for asynchronous request handling. |
| **AI Models** | **Hugging Face (`all-MiniLM-L6-v2`)** | 384-dimensional dense vector model. Lightweight enough to run efficiently in serverless environments while maintaining high semantic accuracy. |
| **Vector Search** | **Chroma DB** | Open-source vector store designed specifically for developer productivity and embedding-first apps. |
| **Relational Database** | **PostgreSQL (Supabase)** | Robust relational DB for user accounts, transaction isolation, note metadata, and session tokens. |
| **Deployment** | **Vercel & Supabase** | Serverless functions for FastAPI/Next.js to minimize hosting costs and scale dynamically, with Supabase managing PostgreSQL in the cloud. |

---

## 💬 Interview Preparation (Typical Questions & Answers)

### 1. "How does the semantic search work in this project?"
* **Answer:** "When a user adds or uploads a note/PDF, the text content is sent to an AI service that uses Hugging Face's `all-MiniLM-L6-v2` transformer model. This generates a 384-dimensional dense vector representation (embedding) representing the note's meaning. The embedding is stored in ChromaDB along with the note's ID. When a user searches, their query is embedded using the same model, and ChromaDB performs a cosine similarity search to return the most contextually relevant notes, even if no keywords overlap."

### 2. "Why did you choose FastAPI over Django or Node.js/Express?"
* **Answer:** "FastAPI was chosen because it is built on ASGI, making it asynchronous by default and highly performant. Since we are integrating with AI services and doing file uploads/transcriptions, async I/O is critical to avoid blocking the main thread. Additionally, it provides native Pydantic validation and automatic OpenAPI documentation, which significantly sped up development."

### 3. "How did you design the Knowledge Graph?"
* **Answer:** "The Knowledge Graph is built by analyzing the contents and titles of notes. The backend extracts keywords (words greater than 3 characters). If two notes share overlapping keywords, a relationship edge is dynamically created between their node IDs. The frontend fetches this structure (`nodes` and `edges`) and renders it interactively using React Flow, mapping coordinate locations dynamically so notes are organized visually for the user."
