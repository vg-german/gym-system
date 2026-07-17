# Gym Management & Access Control System

A gym management system featuring a CRUD database backend and an automated, tablet-optimized facial recognition access control system.

## Project Architecture

The repository is organized as a monorepo containing two main components:
*   `/backend`: FastAPI server handling business logic, user authorization, and data tracking.
*   `/frontend`: Vite + React web application with a responsive panel for administration and a dedicated entry access view.

## Core Features

*   **Facial Recognition Access:** Real-time client check-in via a front-facing camera using client-side AI processing.
*   **Administrative Dashboard:** Full CRUD management for gym members and membership subscriptions.
*   **Multi-Device Synchronization:** Separation between the desktop admin interface and the entrance tablet layout.

## Tech Stack

### Backend
*   **FastAPI:** High-performance Python web framework for building APIs.
*   **Supabase (PostgreSQL):** Cloud-native relational database used for secure data storage and vector embeddings.
*   **Docker:** Containerization to maintain consistent development and production environments.

### Frontend
*   **React + Vite:** Ultra-fast local development environment and reactive UI workflow.
*   **face-api.js:** Browser-based face detection and recognition built on top of TensorFlow.js.
*   **Tailwind CSS:** Modern utility-first styling for fluid, cross-device layouts.
