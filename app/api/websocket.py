"""WebSocket endpoint for streaming voice input."""

from __future__ import annotations

from fastapi import WebSocket


async def voice_websocket(websocket: WebSocket) -> None:
    """Handle WebSocket connection for streaming voice input."""
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_bytes()
            # TODO: process audio chunk through STT pipeline
            await websocket.send_json({"status": "received", "size": len(data)})
    except Exception:
        pass
    finally:
        await websocket.close()
