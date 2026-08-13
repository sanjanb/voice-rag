# Technology Stack

## 1. Backend

### Python

Primary implementation language.

Reasons:

- strong ML ecosystem
- async support
- mature evaluation tooling
- easy model integration

### FastAPI

Use for:

- REST API
- WebSocket voice transport
- health endpoints
- benchmark endpoints if required

## 2. Validation

### Pydantic

Use for:

- request schemas
- response schemas
- internal contracts
- configuration validation

## 3. Frontend

### Next.js + React + TypeScript

Use for:

- microphone interface
- streaming transcript
- answer rendering
- citations
- latency panel
- debug/benchmark view

## 4. Speech

Abstract provider behind an interface.

Possible implementations:

```text
Hosted streaming STT
Local Whisper-family model
```

The exact provider should be selected based on benchmarked latency, accuracy, availability and cost rather than brand preference.

## 5. Embeddings

Use a high-quality text embedding model appropriate for the corpus.

Requirements:

- predictable dimension
- acceptable latency
- strong retrieval quality
- local or hosted deployment option

Keep the embedding provider behind an interface.

## 6. Sparse retrieval

Baseline:

```text
BM25
```

Later experiments may include learned sparse retrieval.

## 7. Vector database

Recommended V1:

### Qdrant

Reasons:

- dense vector search
- sparse/multi-vector support
- hybrid search
- RRF
- multi-stage querying

Qdrant documents dense+sparse hybrid search, RRF and reranking workflows directly. citeturn0search0turn0search1

Alternative:

```text
pgvector
FAISS
Weaviate
```

Do not change databases solely because another product is popular. Benchmark the actual workload.

## 8. Reranking

Use a cross-encoder or late-interaction reranker.

Keep it behind:

```python
class Reranker:
    ...
```

so the model can be swapped.

## 9. LLM

Requirements:

- low-latency inference
- structured output support
- strong instruction following
- reasonable grounding behavior
- streaming if available

Provider should be configurable.

## 10. Observability

### OpenTelemetry

Use for:

- traces
- nested stage spans
- exceptions
- metrics

Official documentation supports manual instrumentation and metrics for Python. citeturn0search2

## 11. Testing

Use:

```text
pytest
```

Test levels:

```text
unit
integration
end-to-end
benchmark
```

## 12. Packaging

Use:

```text
pyproject.toml
```

and a modern Python package manager.

## 13. Deployment

V1:

```text
Docker
Docker Compose
```

Possible services:

```text
backend
frontend
qdrant
observability stack
```

## 14. Avoid unnecessary dependencies

Do not add an orchestration framework unless it solves a demonstrated problem.

The core pipeline should be understandable without a large abstraction layer.
