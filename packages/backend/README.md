# Audio Transcription Gateway

The `audio-transcription.gateway.ts` file is a crucial part of the server that handles audio transcription services. It is built using the NestJS framework and leverages WebSockets for real-time, bidirectional, and event-based communication. This gateway is designed to connect to the Gladia API for audio transcription, providing an efficient way to transcribe audio streams in various formats and languages.

## Key Features

- **WebSocket Gateway**: Utilizes the `@WebSocketGateway` decorator to create a WebSocket server that listens for incoming connections and data.
- **Environment Configuration**: Integrates with `dotenv` for environment variable management, ensuring sensitive information like the Gladia API key is securely stored.
- **Dynamic Audio Transcription**: Supports multiple audio formats and configurations, including sample rates, languages, and transcription models, through the Gladia API.
- **Real-time Communication**: Sends audio frames received from clients to the Gladia API for transcription and broadcasts the transcription results back to the clients in real-time.
- **Error Handling**: Implements robust error handling for WebSocket connections, ensuring stability and reliability.
- **Logging**: Uses the `Logger` service from NestJS for logging important events and errors, aiding in debugging and monitoring.

## How It Works

1. **Initialization**: Upon server initialization, the gateway establishes a WebSocket connection to the Gladia API and sends an initial configuration for the audio transcription service.
2. **Client Handling**: Listens for new client connections and disconnections, logging these events for monitoring purposes.
3. **Audio Frame Processing**: Receives audio frames from connected clients, converts them to the required format, and forwards them to the Gladia API for transcription.
4. **Transcription Results**: Receives transcription results from Gladia and broadcasts these results to all connected clients, enabling real-time transcription feedback.

## Configuration

The gateway is configured to handle large audio files with a maximum HTTP buffer size of 25 MB and supports various transports including WebSocket and polling. It is also set up to manage connection timeouts, ensuring a smooth user experience.

This gateway is a key component in enabling real-time audio transcription services, making it an essential part of applications that require audio processing capabilities.
