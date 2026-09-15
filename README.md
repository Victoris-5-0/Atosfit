# 🏋️‍♂️ ATOS Fit: AI-Powered Fitness Coach



---

> **ATOS Fit** is a next-generation fitness web app powered by **AI and computer vision**.
> It uses **TensorFlow.js** and **pose estimation** to analyze your workout form, count repetitions in real time, and provide instant feedback — all directly through your webcam.

<p align="center">
<img width="2299" height="1294" alt="ChatGPT Image Sep 15, 2026, 11_25_46 PM" src="https://github.com/user-attachments/assets/ea2e8e54-c173-4412-9492-2a00c22ea4a3" />
</p>

---

##  Overview

ATOS Fit transforms your webcam into an **AI personal trainer**.
It’s a fully in-browser experience that analyzes your movements using advanced pose detection models — ensuring **accuracy, privacy, and motivation**.

---

## Technology Behind the Vision
Real-Time 3D Motion Analysis
Our advanced AI pipeline combines multiple technologies to deliver accurate, low-latency motion tracking:

Google MediaPipe: Provides robust 2D pose detection with 33 anatomical landmarks
MocapNET Integration: Transforms 2D video input into accurate 3D motion analysis
Low-Latency Processing: Optimized pipeline ensuring real-time feedback with minimal delay (<100ms)
Client-Side Inference: All pose estimation happens locally in the browser, ensuring complete privacy

Resource-Efficient Edge Processing

Optimized AI Models: Custom-tailored TensorFlow.js models run efficiently on consumer-grade hardware
No GPU Required: Engineered to perform complex computations on standard phones and laptops
Browser-Native Execution: Leverages WebGL acceleration for enhanced performance
Adaptive Quality: Dynamic adjustment based on device capabilities
Memory Efficient: Optimized model size and inference pipeline


## System Architecture

### Architecture Diagram Flow

```text
┌─────────────────────────────────────────────────────────────┐
│                      Client Browser                        │
│  ┌────────────────────────────────────────────────────────┐│
│  │  React Frontend (Vite + TailwindCSS + Shadcn UI)      ││
│  │  • Landing Page    • Dashboard    • Workout Session   ││
│  │  • AI Assistant    • Profile      • Exercise Library  ││
│  └─────────────────┬────────────────────────────┬────────┘│
│                    │                            │         │
│  ┌─────────────────▼────────────┐  ┌───────────▼────────┐│
│  │  TensorFlow.js + MediaPipe   │  │   IndexedDB        ││
│  │  • Pose Detection (33 pts)   │  │   (Dexie.js)       ││
│  │  • Rep Counting              │  │   • Session Cache  ││
│  │  • Form Analysis             │  │   • Offline Storage││
│  └──────────────────────────────┘  └────────────────────┘│
└─────────────────────┬─────────────────────────────────────┘
                      │
                      │ HTTPS / WebSocket
                      │
┌─────────────────────▼─────────────────────────────────────┐
│              Internet Computer Protocol (ICP)             │
│  ┌─────────────────────────────────────────────────────┐ │
│  │         Motoko Backend Canisters                    │ │
│  │  • User Management      • Workout Sessions          │ │
│  │  • Subscription Logic   • Payment Integration       │ │
│  │  • Achievement System   • Stable Memory Storage     │ │
│  └─────────────────┬───────────────────────────────────┘ │
│                    │                                     │
│  ┌─────────────────▼──────────────────────────────────┐  │
│  │         ICP Stable Memory (Blockchain Storage)     │  │
│  │  • User Profiles    • Workout History              │  │
│  │  • Subscriptions    • Achievements                 │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────┬───────────────────────────────┘
                           │
                           │ HTTP Outcalls
                           │
                  ┌────────▼────────┐
                  │  Stripe API     │
                  │  (Payments)     │
                  └─────────────────┘
```

**Diagram Explanation:**
- **Client Browser:** Tailwind.
  - AI/Computer Vision (TensorFlow.js/MediaPipe)
  - IndexedDB
- **ICP (Internet Computer Protocol):** Motoko smart canisters 
- **Stripe API:** Stripe  HTTP Outcalls.

## Frontend Architecture
2.1 Technology Stack
Core Framework:

React 18: Latest React features including concurrent rendering and automatic batching
Vite 5: Next-generation frontend build tool for instant server start and lightning-fast HMR
TypeScript (optional): Type-safe development

UI/UX Libraries:

TailwindCSS: Utility-first CSS framework for rapid UI development
Shadcn UI: High-quality, accessible component library built on Radix UI
Framer Motion: Production-ready motion library for fluid animations
Lucide React: Beautiful and consistent icon set



*Backend Architecture (ICP Canisters)*
2.4 Motoko Smart Canisters
Canister Structure:

*User Management Canister*
User profile CRUD operations
Authentication state management
Preference storage
Privacy settings

*Workout Session Canister*
Session creation and tracking
Real-time session updates
Historical workout data
Exercise performance metrics


*Subscription Canister*
Plan management (Free, Pro, Premium)
Payment processing via Stripe HTTP outcalls
Subscription status tracking
Billing cycle management


*Achievement Canister*
Milestone definitions
Badge unlocking logic
Leaderboard calculations
Progress tracking



## Key Features:

Type Safety: Motoko's strong typing prevents runtime errors
Actor Model: Asynchronous message passing for scalability
Stable Memory: Persistent storage that survives canister upgrades
HTTP Outcalls: Direct integration with external APIs (Stripe)
Inter-Canister Calls: Modular architecture for better organization
Upgrade Mechanisms: Seamless canister updates without data loss

Security Measures:

Identity-Based Access Control: Only authenticated users can access their data
Input Validation: All inputs sanitized and validated
Rate Limiting: Protection against abuse and DDoS
Encryption: Sensitive data encrypted at rest


## AI Processing Pipeline
2.5 TensorFlow.js + MediaPipe Integration
Pose Detection System:

33 Landmark Tracking: Full-body skeletal tracking with high precision

Head, shoulders, elbows, wrists
Hips, knees, ankles
Eyes, ears, nose, mouth


Confidence Scoring: Each landmark includes confidence score (0-1)
Real-Time Processing: 30+ FPS on modern devices
Normalization: Coordinates normalized to handle different screen sizes

## 🤝 Contributing

We welcome contributions!
If you’d like to enhance features or fix issues:

```bash
git checkout -b feature/YourFeature
# make your changes
git commit -m "Add: YourFeature"
git push origin feature/YourFeature
```

Then open a Pull Request 🚀

---

<p align="center">
  <b>💪 ATOS Fit — Built for a smarter, healthier future.</b>
</p>
