# WebRTC Networking Server

This project is a WebRTC-based networking server built with Node.js, designed to serve as a web-based networking relay for games and applications. It supports broadcasting, channel creation, and buffered message handling. The server utilizes a built-in WebSocket self-signaler to manage the WebRTC signaling process, which includes establishing channels via offer and answer exchanges that contain remote ICE candidates and SDP data. Both text and binary data are supported.

Client management can be handled using join, group, and leave messages. A set topics message is available to manage sharding and channel assignment.

## Features

- **Self-Signaling WebSocket:** Eliminates the need for third-party signaling servers by using a built-in WebSocket server.
- **Channel and Message Management:** Supports broadcasting, channels, and buffered messages.
- **Data Types:** Capable of handling both text and binary data.
- **Client Management:** Provides tools for managing client join, group, and leave events, as well as sharding through topic settings.

## Endpoint
Note: WebRTC does not require a specific port to be exposed, as it dynamically opens ports based on signaling algorithms. When deploying in the cloud or using Docker, ensure that all ports are accessible. The WebSocket signaling server listens on port `8081` by default.

## Getting Started

### Prerequisites
- **Nodejs** (v10 or higher)
- **Docker** (for containerized deployment)

### Configuration
Edit the `config/default.json` file to set configurations as needed, including:
- `signaling.websocket-url`: Define the WebSocket signaling server URL (default is `localhost` on port `8081`).

### Building and Running Locally

1. **Clone the Repository.**

2. **Run the Application via Command Line:**
   ```bash
   npm install
   node main.js
   ```

### Building and Running with Docker
1. **Build the Docker Image**:
    ```bash
    docker build -t webrtc:<tag> .
    ```

2. **Run the Docker Container**:
    ```bash
    docker run --network=host webrtc:<tag>
    ```
   This command starts the WebRTC server and the WebSocket signaling server on port `8081` inside the container.

### Usage
To use the server in action, use the sample chat client provided in `chat-client.js` and `index.html` files. These files demonstrate how a client can connect to the server and send messages.