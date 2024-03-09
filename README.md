# Quali-Clerk Project Overview

Quali-Clerk is an innovative project designed to streamline the process of audio transcription through a real-time, bidirectional communication system. Utilizing the power of the NestJS framework for the backend and a robust frontend service, Quali-Clerk offers a seamless experience for transcribing audio streams in various formats and languages.

## Objective

The primary objective of Quali-Clerk is to provide an efficient and user-friendly platform for real-time audio transcription services. It leverages the Gladia API for audio transcription, ensuring high accuracy and support for multiple languages and audio formats.

## Getting Started

To set up Quali-Clerk, ensure the following steps are completed:

- Install Node.js and Yarn on your computer.
- Subscribe to Gladia API at https://app.gladia.io/home.
- Configure necessary environment variables as outlined below.
  The project is organized into frontend and backend services, located in the `packages` folder.

### Environment Variables

To ensure the smooth operation of the Quali-Clerk project, it's crucial to configure certain environment variables within a `.env` file located at the project's root. These variables are divided into two categories, each serving a specific part of the application:

#### Backend Service Variables

- `GLADIA_API_KEY`: Your personal API key for [Gladia API](https://app.gladia.io/home), required for audio transcription.

#### Frontend Service Variables

- `NEXT_PUBLIC_BACKEND_ENDPOINT=http://localhost:4000`: This environment variable specifies the URL for the backend service.

It's important to set these variables correctly to facilitate communication between the frontend and backend services, as well as to enable the backend's connection to external transcription services.

### Starting the Services

1. Clone the repository to your local machine.
2. Navigate to the root directory of the project.
3. Run `yarn install` to install all dependencies for both frontend and backend services.
4. To start the frontend service, execute `yarn start:frontend`.
5. To start the backend service, execute `yarn start:backend`.

Both services need to be running simultaneously for full functionality.

## Frontend Service

The frontend service provides the user interface for interacting with the audio transcription capabilities of Quali-Clerk. It is built using modern web technologies and communicates with the backend service for processing audio streams.

### Main Files

- **`src/index.js` or `src/index.ts`**: The entry point of the frontend application.
- **`src/hooks/useTranscriber.ts`**: Contains the custom hook for managing audio transcription.
- **`package.json`**: Contains scripts and dependencies for the frontend service.
- **`.gitignore`**: Specifies files to be ignored by Git, including `node_modules/`.
- **`README.md`**: Offers detailed information about the frontend service, including setup instructions.

## Backend Service

The backend service is the core of the Quali-Clerk project, handling audio transcription through the Gladia API and managing WebSocket connections for real-time communication.

### Main Files

- **`audio-transcription.gateway.ts`**: Manages WebSocket connections and audio transcription.
- **`README.md`**: Provides an overview of the backend service, including its features and how it works.

## Conclusion

Quali-Clerk is a comprehensive solution for real-time audio transcription, combining a powerful backend service with a user-friendly frontend interface. By following the instructions provided, including setting up the necessary environment variables, you can easily set up and start using Quali-Clerk for your audio transcription needs.
