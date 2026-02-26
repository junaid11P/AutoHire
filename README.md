# AutoHire - AI Interview Platform

## 🚀 Overview
AutoHire is an advanced AI-powered interview platform designed to automate and streamline the technical hiring process. The application features a transparent, modern glassmorphic UI, an integrated online coding editor, real-time proctoring for candidate integrity, and a fully functional AI Interviewer utilizing a 3D animated avatar and state-of-the-art LLMs for candidate evaluation.

The interview process is fully automated and AI-driven, consisting of two structured rounds with real-time proctoring and evaluation.

**Interview Rounds:**
- **Round 1:** Coding & Aptitude Test
- **Round 2:** AI-Based Technical Interview

---

## 🛤 Interview Process – Step By Step

### Step 1: Job Application
- **Process:** Job seeker browses available jobs and applies for a job through the portal.
- **Tech Stack Used:** Frontend: React.js | Backend: FastAPI | Database: MongoDB Atlas

### Step 2: Resume Upload & Parsing
- **Process:** Candidate uploads resume (PDF/DOC). Resume is parsed and converted into structured data. Skills, experience, and projects are extracted.
- **Tech Stack Used:** Microsoft MarkItDown (Resume to Markdown), LangChain (Text chunking), FastEmbed (Local embedding generation), MongoDB Atlas Vector Search (Resume storage)

### Step 3: Resume–Job Matching
- **Process:** Resume embeddings are compared with job requirement embeddings. Match percentage is calculated. Interview difficulty is adjusted dynamically.
- **Tech Stack Used:** FastEmbed, MongoDB Vector Search, Groq (Llama 3.3 70B) – Reasoning & alignment

### Step 4: Interview Initialization
- **Process:** System checks Camera permission, Microphone permission, and Fullscreen mode. Proctoring starts.
- **Tech Stack Used:** WebRTC (Camera & microphone access), Browser Fullscreen API, JavaScript Event Listeners

### Step 5: Round 1 – Coding & Aptitude Test
- **Process:** Candidate answers aptitude questions and solves coding problems using an online editor. Code is auto-evaluated using test cases.
- **Tech Stack Used:** Monaco Editor (Code editor), Docker (Secure code execution), Judge0 API / Self-Hosted Judge, FastAPI (Result processing)

### Step 6: Proctoring During Round 1
- **Process:** Continuous monitoring of eye movement, head & shoulder movement, and tab switching. Violations are logged.
- **Tech Stack Used:** MediaPipe FaceMesh (Eye tracking), MediaPipe Pose (Body tracking), WebGazer.js (Gaze detection), TensorFlow.js (Browser ML), MongoDB (Proctoring logs)

### Step 7: Round 2 – AI Technical Interview
- **Process:** AI 3D avatar asks technical questions. Candidate responds using voice. Follow-up questions generated dynamically based on Resume, Previous answers, and Job requirements.
- **Tech Stack Used:** Three.js (3D AI avatar), TikTokTTS (AI voice generation), Mock Rhubarb (Lip-sync animation), Web Speech API (Speech-to-text), Groq Llama 3.3 70B (Question generation)

### Step 8: AI Answer Evaluation
- **Process:** Candidate answers are evaluated for Technical correctness, Communication clarity, and Resume relevance. Scores are generated instantly.
- **Tech Stack Used:** LangChain (RAG pipeline), Groq LLM (Evaluation), FastAPI (Score computation)

### Step 9: Integrity Scoring
- **Process:** Proctoring violations are weighted. Final integrity score is calculated. 
  *(Example: `Integrity Score = 100 - (EyeAway × 2 + TabSwitch × 5 + FaceMissing × 10)`)*
- **Tech Stack Used:** Python (FastAPI), MongoDB (Integrity data)

### Step 10: Final Report Generation
- **Process:** Combined score generated (Coding score, Technical score, Integrity score). Report shared with company.
- **Tech Stack Used:** FastAPI, MongoDB, PDF/JSON report generation

---

## 🔄 Interview Workflow (Summary)
```text
Job Application
      ↓
Resume Parsing & Matching
      ↓
Interview Setup & Proctoring Start
      ↓
Round 1: Coding & Aptitude
      ↓
Round 2: AI Technical Interview
      ↓
AI Evaluation
      ↓
Integrity Scoring
      ↓
Final Report to Company
```

---

## 🛠 Tech Stack Summary Table

| Stage                 | Technology Used                                 |
| :-------------------- | :---------------------------------------------- |
| **UI & Interaction**  | React.js, Three.js                              |
| **Resume Analysis**   | MarkItDown, LangChain, FastEmbed                |
| **AI Reasoning**      | Groq (Llama 3.3 70B)                            |
| **Coding Round**      | Monaco Editor, Docker                           |
| **Proctoring**        | MediaPipe, WebGazer, TF.js                      |
| **Voice & Avatar**    | Web Speech API, TikTokTTS                       |
| **Backend**           | FastAPI                                         |
| **Database**          | MongoDB Atlas (+ Vector Search)                 |
| **Hosting**           | Oracle Cloud Free Tier, Vercel                  |

## 🏃‍♂️ How to Run Locally

### 1. Prerequisites
Ensure you have the following installed on your machine:
- **Node.js**: (v18+)
- **Python**: (v3.10+)
- **MongoDB Atlas Cluster**: (Free Tier) - You will need your MongoDB URI and must enable Vector Search capabilities per the documentation.

### 2. Configure Environment Variables
Navigate to the `/backend` directory and configure the `.env` file with your API keys. You will need:
```env
# Backend .env
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/
JWT_SECRET_KEY=your_secure_random_key_here
GROQ_API_KEY=gsk_your_groq_api_token
```

### 3. Start the FastAPI Backend
Open a new terminal session, navigate to the `backend` folder, and run the following commands to install dependencies and boot the Python server.

```bash
cd backend

# Create and activate a virtual environment (optional but recommended)
python3 -m venv .venv
source .venv/bin/activate  # On Windows use: .venv\Scripts\activate

# Install the dependencies
pip install -r requirements.txt

# Start the uvicorn development server
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
*The backend will be available at: http://localhost:8000*

### 4. Start the React Frontend
Open a **second terminal session**, navigate to the `frontend` folder, install the NPM packages, and boot the frontend via Vite.

```bash
cd frontend

# Install the dependencies
npm install

# Start the development server
npm run dev
```
*The application UI will now be accessible at: http://localhost:5173* 

### 5. Running the Application
Once both servers are running:
1. Navigate to the frontend on [http://localhost:5173](http://localhost:5173).
2. Click **Create Profile** as a Job Seeker and upload a mock resume PDF.
3. Once logged in, open the "Company portal" on a separate incognito window, create a company, and post a test Job.
4. Then apply for that job as the Job Seeker.
5. Enter the `Proctored Session` and successfully navigate the UI's aptitude check and Technical Two-Sum code execution before proceeding to the 3D Audio-Interactive Llama 3 Technical AI Interview.
