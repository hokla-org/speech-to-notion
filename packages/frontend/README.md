# Frontend Service

This document provides an overview of the frontend service for the Quali-Clerk application, including instructions on how to start the service and descriptions of the main files involved.

## Getting Started

To start the frontend service, you need to have Node.js and Yarn installed on your machine. Once you have those prerequisites, follow these steps:

1. Navigate to the root directory of the Quali-Clerk project.
2. Run `yarn install` to install all dependencies for the project.
3. To start the frontend service, execute the command `yarn start:frontend`. This command is defined in the `package.json` file and will start the development server for the frontend.

## Main Files

- **`package.json`**: Located at the root of the project, this file contains scripts and dependencies for the frontend service. The `start:frontend` script is used to launch the development server.
- **`.gitignore`**: This file specifies intentionally untracked files that Git should ignore. For the frontend, it includes `node_modules/`, ensuring that dependencies are not tracked in version control.
- **`README.md`**: Provides documentation for the frontend service, including setup instructions and an overview of the service's functionality.
- **`src/index.js` or `src/index.ts`**: The entry point for the frontend application. It initializes the app and mounts it to the DOM.

## Additional Information

The frontend service is designed to work in conjunction with the backend service described in `packages/backend/README.md`. For full functionality, ensure that both services are running simultaneously.

For more detailed information about the backend service, including how to start it and its main components, refer to the README file located in `packages/backend/`.
