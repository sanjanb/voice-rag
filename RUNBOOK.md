# VoiceRAG — Complete Setup & Run Manual

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Python | 3.11+ | https://python.org |
| Node.js | 20+ | https://nodejs.org |
| Docker Desktop | Latest | https://docker.com |
| OpenAI API Key | — | https://platform.openai.com/api-keys |

---

## 1. Environment Variables

Create `.env` in the project root (`voice-rag/.env`):

```env
# === REQUIRED ===
OPENAI_API_KEY=[REDACTED]

# === Qdrant (matches docker-compose) ===
QDRANT_HOST=localhost
QDRANT_PORT=6333
QDRANT_COLLECTION=voice_rag

# === STT ===
STT_PRIMARY=hosted
STT_FALLBACK=local
STT_TIMEOUT_MS=120

# === Embedding ===
EMBEDDING_MODEL=text-embedding-3-small
EMBEDDING_DIMENSIONS=1536

# === LLM ===
LLM_PROVIDER=openai
LLM_MODEL=gpt-4o-mini
LLM_TIMEOUT_MS=10000

# === Reranker ===
RERANKER_MODEL=cross-encoder/ms-marco-MiniLM-L-6-v2

# === Retrieval ===
DENSE_TOP_N=20
SPARSE_TOP_N=20
FUSED_TOP_N=20
FINAL_TOP_K=5

# === Observability ===
LOG_LEVEL=INFO
```

---

## 2. Start Qdrant

```bash
docker compose -f docker/docker-compose.yml up -d qdrant
```

Verify: http://localhost:6333/dashboard → should show Qdrant dashboard.

---

## 3. Install Python Dependencies

```bash
# Create virtualenv
python -m venv .venv
.venv\Scripts\activate          # Windows
# source .venv/bin/activate     # Linux/Mac

# Install
pip install -e ".[dev]"
```

---

## 4. Ingest Documents

Place files (`.txt`, `.md`, `.py`, `.json`, `.yaml`, `.csv`) in `data/raw/`.

Then run:

```python
import asyncio
from app.config.settings import settings
from app.ingestion.loader import load_documents
from app.ingestion.chunking.selector import adaptive_chunk
from app.embeddings.embedder import Embedder
from app.ingestion.indexer import Indexer

async def ingest():
    docs = load_documents("data/raw")
    all_chunks = []
    for doc in docs:
        chunks = adaptive_chunk(
            text=doc["content"],
            document_id=doc["file_name"],
            metadata={"source": doc["file_path"]}
        )
        all_chunks.extend(chunks)

    embedder = Embedder()
    indexer = Indexer(embedder=embedder)
    count = await indexer.index_chunks(all_chunks)
    print(f"Indexed {count} chunks")

asyncio.run(ingest())
```

Or save as `scripts/ingest.py` and run: `python scripts/ingest.py`

---

## 5. Start Backend

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Verify: http://localhost:8000/docs → Swagger UI with all endpoints.

### Available Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /health | Health check |
| POST | /transcribe | Upload audio → full pipeline |
| POST | /ask | Send text query → full pipeline |
| GET | /documents | List indexed documents |
| GET | /documents/{id} | Get document details |
| GET | /documents/{id}/chunks | Get chunks for a document |
| POST | /documents/upload | Upload new document |
| GET | /runs | List pipeline runs |
| GET | /runs/{id} | Get run details |
| GET | /system/status | System status |
| GET | /system/knowledge-base | KB stats |
| GET | /system/settings | Current settings |
| GET | /system/benchmarks | Benchmark data |
| GET | /system/experiments | Experiments |

---

## 6. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000 → VoiceRAG UI.

### Frontend Pages

| Page | URL | Description |
|------|-----|-------------|
| Ask | /ask | Main voice/text query interface |
| Documents | /documents | List and browse indexed docs |
| Document Detail | /documents/[id] | Chunks and processing |
| Runs | /runs | Pipeline execution history |
| Run Detail | /runs/[runId] | Full pipeline trace |
| Benchmarks | /benchmarks | Performance metrics |
| Experiments | /experiments | A/B test results |
| Settings | /settings | System configuration |
| Architecture | /architecture | System architecture view |

---

## 7. Docker Full Stack (Alternative)

Run everything in containers:

```bash
docker compose -f docker/docker-compose.yml up --build
```

| Service | URL |
|---------|-----|
| Backend API | http://localhost:8000 |
| Frontend | http://localhost:3000 |
| Qdrant | http://localhost:6333 |

---

## Quick Test

```bash
# 1. Qdrant running
curl http://localhost:6333/healthz

# 2. Backend running
curl http://localhost:8000/health

# 3. Ask a question (after ingesting docs)
curl -X POST http://localhost:8000/ask -H "Content-Type: application/json" -d '{"query": "What is this about?"}'

# 4. Frontend running
curl -I http://localhost:3000
```

---

## Troubleshooting

**"No API key"** → Ensure `OPENAI_API_KEY` is set in `.env`

**Qdrant connection refused** → `docker compose -f docker/docker-compose.yml up -d qdrant`

**Embedding fails** → Check OpenAI rate limits. Embedder has built-in retry (3 attempts).

**Reranker slow first time** → CrossEncoder model downloads on first use (~80MB). Subsequent loads are fast.

**Frontend can't reach backend** → Ensure backend runs on port 8000. Check `NEXT_PUBLIC_API_URL` in `frontend/.env.local` if changed.

---

## Project Structure

```
voice-rag/
├── app/                    # Python backend
│   ├── api/                # FastAPI routes
│   ├── config/             # Settings (pydantic-settings)
│   ├── context/            # Context builder + dedup
│   ├── embeddings/         # OpenAI embedding client
│   ├── evaluation/         # Metrics (stub)
│   ├── generation/         # LLM generator + verifier
│   ├── guardrails/         # Retrieval + answer guards
│   ├── ingestion/          # Loader, chunker, indexer
│   ├── observability/      # Logging, tracing, metrics
│   ├── pipeline/           # Orchestrator, retry, timeout
│   ├── query/              # Query classification
│   ├── retrieval/          # Dense, sparse, RRF, reranker
│   ├── schemas/            # Pydantic models
│   ├── speech/             # STT (hosted, local, fallback)
│   └── main.py             # Entry point
├── frontend/               # Next.js frontend
│   ├── app/                # Pages (11 total)
│   ├── components/         # UI components (10 dirs)
│   ├── hooks/              # usePipelineEvents
│   └── lib/                # API client, types
├── data/
│   ├── raw/                # Place source documents here
│   ├── parsed/             # Parsed output
│   ├── chunks/             # Chunked output
│   └── fixtures/           # Test fixtures
├── docker/                 # Docker setup
├── evaluation/             # Eval scripts
├── scripts/                # Utility scripts
├── tests/                  # Test suite
├── test_e2e_full.py        # 11-point e2e test
├── test_qdrant_integration.py  # Qdrant integration test
└── .env                    # Environment variables
```
