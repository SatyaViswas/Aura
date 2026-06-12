
// Vite automatically sets import.meta.env.PROD to true on Netlify production builds
const IS_PROD = import.meta.env.PROD;

// Fallback to localhost if the Netlify environment variables aren't injected yet
export const BACKEND_URL = IS_PROD
    ? (import.meta.env.VITE_BACKEND_URL || "https://aura-uuqn.onrender.com")
    : "http://localhost:8000";

export const WEBSOCKET_URL = IS_PROD
    ? (import.meta.env.VITE_WEBSOCKET_URL || "wss://aura-uuqn.onrender.com")
    : "ws://localhost:8000";