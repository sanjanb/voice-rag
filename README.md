# VoiceRAG

Production-oriented, voice-enabled Retrieval-Augmented Generation system.

> Speak a question → transcribe it → retrieve evidence → decide whether the system can answer → generate a grounded answer → return citations and latency telemetry.

## Quick Start

```bash
# Install
pip install -e ".[dev]"

# Configure
cp .env.example .env
# Edit .env with your API keys

# Run
make run

# Ingest documents
make ingest

# Run smoke test
make smoke
```

## Architecture

See [docs/](docs/) for full architecture documentation.

## Development

```bash
make dev        # Install with dev dependencies
make test       # Run all tests
make lint       # Lint code
make type-check # Type check
```

## License

MIT
