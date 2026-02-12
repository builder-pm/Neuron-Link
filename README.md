# NeuronLink Lakehouse

**NeuronLink** is a self-service data intelligence platform that bridges the gap between raw data warehouses and business decision-making. It combines a visual modeling canvas with an AI-powered query engine, allowing users to explore, join, and analyze data without specific SQL knowledge.

> **Built for the Modern Data Stack:** Designed to solve the "Analytic Gap" where business users are blocked by technical barriers to data access.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-active-success.svg)
![Stack](https://img.shields.io/badge/stack-React_Typescript_Supabase-purple.svg)

## 🎯 Project Goals

This project was built to demonstrate **Product Engineering** capabilities: moving beyond simple CRUD apps to build complex, interactive tools that solve real enterprise problems.

**Key Challenges Solved:**
1.  **Hybrid Data Processing**: seamlessly switching between server-side SQL execution (Supabase/Athena) and client-side operations.
2.  **Visual Metaprogramming**: A node-based editor (Modeling Canvas) that generates executable SQL, treating code-as-data.
3.  **AI-Native UX**: Integrating LLMs (Gemini) not just as a chatbot, but as a deterministic query generator with schema awareness.

## �️ Technical Architecture

### The "Lakehouse" Abstraction
NeuronLink treats disparate data sources as a unified substrate. The frontend doesn't care if data comes from a massive S3 Data Lake (via Athena) or a local CSV—the **Data Service Layer** normalizes it into a consistent schema for the UI.

### Visual Modeling Engine
*   **Graph State**: Uses a graph data structure to manage table nodes and relationship edges.
*   **SQL Transpilation**: The visual model is compiled in real-time into optimized SQL joins (Left/Inner/Right) before being sent to the execution engine.
*   **Drift Detection**: The `SchemaRegistry` service actively monitors for drift between the local model definitions and the actual database schema.

### AI Integration (RAG-Lite)
Instead of blind LLM calls, NeuronLink uses a **Semantic Context Injection** pattern:
1.  **Schema Extraction**: The active table structure and aliases are serialized.
2.  **Context Windowing**: Only relevant metadata is sent to Gemini to minimize token usage and latency.
3.  **Deterministic Output**: The AI acts as a translator (Natural Language -> SQL), which is then vetted by the execution layer.

## 🛠️ Technology Stack

*   **Frontend Core**: React 18, TypeScript, Vite.
*   **Styling System**: Tailwind CSS v4 with a custom "Cyber-Brutalist" token set (variables for High Contrast/Dark Mode).
*   **State Management**: React Context + Reducers (chosen for explicit state transitions over opaque magic).
*   **Backend / Auth**: Supabase (Postgres + GoTrue) for secure, row-level authenticated access.
*   **Visuals**: React Flow for the node canvas.

## 🚀 Getting Started

Designed for a zero-friction developer experience (DX).

### Prerequisites
*   Node.js v18+
*   Supabase Project (Optional - Guest mode available)
*   Google Gemini API Key

### Installation

1.  **Clone & Install**
    ```bash
    git clone git@github.com:builder-pm/Neuron-Link.git
    cd Neuron-Link
    npm install
    ```

2.  **Environment Setup**
    Create `.env.local`:
    ```env
    VITE_GEMINI_API_KEY=your_key
    # Optional: For Full Auth & Persistence
    VITE_SUPABASE_URL=your_project_url
    VITE_SUPABASE_ANON_KEY=your_key
    ```

3.  **Run Locally**
    ```bash
    npm run dev
    ```

## 🎨 Design Philosophy: "Cyber Brutalism"

I chose a **Brutalist** design aesthetic (`#1a1a1a` Mono, `#CAFF58` Lime, Hard Shadows) to differentiate from the "soft SaaS" look. It emphasizes:
*   **Data Density**: High contrast allows for denser information display without visual fatigue.
*   **Function over Form**: Hard edges and distinct borders make click targets and drop zones unambiguous.
*   **Performance**: CSS-first animations and zero layout-shifting.

## 👨‍💻 About the Author

Built by **Naman Kansal**, a Product Engineer focused on building tools that empower users.

*   **Portfolio**: [namankansal.in](https://namankansal.in)
*   **GitHub**: [@builder-pm](https://github.com/builder-pm)


---
*Open for code review and architectural discussion.*
