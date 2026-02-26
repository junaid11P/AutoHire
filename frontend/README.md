# AutoHire Frontend Web Application

This directory contains the frontend web application for **AutoHire** built utilizing React.js, Vite, and Tailwind CSS.

## 🚀 Key Features Built Thus Far

The frontend has been scaffolded to align directly with the **Automated AI-Driven Interview Process**.

1. **Brand & Styling Navigation**
   - **Glassmorphic** design standard applied across all UI components via generic utility classes.
   - Dynamic dynamic backgrounds configured in `index.css`.
   
2. **Hero & Candidate Onboarding Setup (`/`)**
   - A mock job trial portal where candidates can click "Try Interview" on any active mock job role.
   - Triggers an engaging **Upload Resume** component that simulates the RAG embedding analysis (MarkItDown), and pre-fills their trial profile seamlessly!
   
3. **Authentication Modal (`/auth`)**
   - Implemented a role-based login system parsing users as "Job Seeker" or "Company" gracefully shifting with `framer-motion` enter & exit interactions.

4. **Proctored Multi-Round Interview Dashboard (`/interview`)**
   - **Round 1A (Aptitude)**: Renders a clean multiple-choice interface with side-by-side simulated global camera proctoring bounds checking for Integrity violations (WebGazer/MediaPipe).
   - **Round 1B (Coding)**: Fluidly shifts to embed a functioning **Monaco Editor** container rendering IDE capabilities instantly evaluating Python problem sets.
   - **Round 2 (Technical)**: Employs `@react-three/fiber` embedding the *female_teacher.glb* dynamically! Simulated TTS mock conversation script testing verbal algorithmic competency.

### Run Locally

```bash
# 1. Install dependencies
npm install

# 2. Run local vite server
npm run dev
```
