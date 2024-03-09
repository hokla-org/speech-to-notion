# Speech-to-Notion

Speech-to-Notion directly transcribes speech to a designated Notion page, offering a streamlined, real-time transcription experience. Built on the NestJS framework and featuring a robust frontend, this project supports various audio formats and languages.

## Objective

Speech-to-Notion aims to provide a fast, user-friendly platform for transcribing audio directly to Notion pages. It uses the Gladia API for accurate transcription across multiple languages and formats.

## Setup

Follow these steps to get started:

- Install Node.js and Yarn.
- Get a Gladia API key at https://app.gladia.io/home.
- Obtain a Notion integration API key by creating an integration at https://www.notion.so/my-integrations.
- Set up environment variables in a `.env` file at the project root, as detailed below.

### Environment Variables

Configure the following in `.env` for smooth operation:

#### Backend

- `GLADIA_API_KEY`: Your Gladia API key for transcription.
- `NOTION_API_KEY`: Your Notion integration API key.

#### Frontend

- `NEXT_PUBLIC_BACKEND_ENDPOINT=http://localhost:4000`: Backend service URL.

### Starting the Services

1. Clone the repo.
2. In the project root, run `yarn install`.
3. Start the frontend with `yarn start:frontend`.
4. Start the backend with `yarn start:backend`.

Both services must run together.

## Frontend Service

The frontend allows users to interact with the transcription service. It's built with modern web technologies and communicates with the backend for audio processing.

### Key Files

- **`src/index.js/ts`**: Entry point.
- **`src/hooks/useTranscriber.ts`**: Manages transcription.
- **`package.json`**: Scripts and dependencies.
- **`.gitignore`**: Files Git should ignore.

## Backend Service

The backend manages transcription and real-time communication via WebSocket.

### Key Files

- **`audio-transcription.gateway.ts`**: WebSocket and transcription management.

## Conclusion

Speech-to-Notion is a powerful, user-friendly tool for real-time transcription to Notion. Set up the environment variables and start both services to begin transcribing.
