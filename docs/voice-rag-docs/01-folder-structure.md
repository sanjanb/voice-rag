# Folder Structure

## Target repository

```text
voice-rag/
├── app/
│   ├── api/
│   │   ├── routes.py
│   │   ├── websocket.py
│   │   └── dependencies.py
│   │
│   ├── config/
│   │   ├── settings.py
│   │   └── profiles/
│   │       ├── dev.yaml
│   │       ├── benchmark.yaml
│   │       └── prod.yaml
│   │
│   ├── schemas/
│   │   ├── audio.py
│   │   ├── query.py
│   │   ├── retrieval.py
│   │   ├── generation.py
│   │   ├── guardrails.py
│   │   └── response.py
│   │
│   ├── pipeline/
│   │   ├── orchestrator.py
│   │   ├── state.py
│   │   ├── retry.py
│   │   ├── timeout.py
│   │   └── errors.py
│   │
│   ├── speech/
│   │   ├── base.py
│   │   ├── hosted.py
│   │   ├── local.py
│   │   ├── fallback.py
│   │   └── audio.py
│   │
│   ├── query/
│   │   ├── normalize.py
│   │   ├── classify.py
│   │   └── difficulty.py
│   │
│   ├── ingestion/
│   │   ├── loader.py
│   │   ├── parser.py
│   │   ├── metadata.py
│   │   ├── chunking/
│   │   │   ├── base.py
│   │   │   ├── fixed.py
│   │   │   ├── semantic.py
│   │   │   ├── structural.py
│   │   │   ├── parent_child.py
│   │   │   └── selector.py
│   │   └── indexer.py
│   │
│   ├── retrieval/
│   │   ├── dense.py
│   │   ├── sparse.py
│   │   ├── rrf.py
│   │   ├── filters.py
│   │   ├── reranker.py
│   │   └── engine.py
│   │
│   ├── context/
│   │   ├── builder.py
│   │   ├── dedupe.py
│   │   └── compression.py
│   │
│   ├── generation/
│   │   ├── prompts.py
│   │   ├── generator.py
│   │   ├── structured.py
│   │   └── verifier.py
│   │
│   ├── guardrails/
│   │   ├── retrieval_guard.py
│   │   ├── answer_guard.py
│   │   ├── abstention.py
│   │   └── policies.py
│   │
│   ├── observability/
│   │   ├── tracing.py
│   │   ├── metrics.py
│   │   ├── logging.py
│   │   └── events.py
│   │
│   └── main.py
│
├── evaluation/
│   ├── datasets/
│   │   ├── queries.jsonl
│   │   ├── retrieval_labels.jsonl
│   │   └── unanswerable.jsonl
│   ├── benchmark.py
│   ├── retrieval_eval.py
│   ├── generation_eval.py
│   ├── guardrail_eval.py
│   ├── latency_eval.py
│   └── reports/
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── hooks/
│   └── lib/
│
├── data/
│   ├── raw/
│   ├── parsed/
│   ├── chunks/
│   └── fixtures/
│
├── scripts/
│   ├── ingest.py
│   ├── benchmark.py
│   └── smoke_test.py
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── docs/
│   └── ...
│
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml
│
├── .env.example
├── pyproject.toml
├── README.md
└── Makefile
```

## Structure rules

1. Keep provider-specific implementations behind interfaces.
2. Keep Pydantic schemas separate from business logic.
3. Keep evaluation code outside the production pipeline.
4. Keep benchmark datasets versioned.
5. Keep configuration externalized.
6. Never import an evaluation module into production code.
7. Do not allow provider SDKs to leak through the entire codebase.

## Dependency direction

```text
API
 ↓
Pipeline
 ↓
Domain services
 ↓
Provider interfaces
 ↓
Provider implementations
```

Evaluation may call the public pipeline, but production code must not depend on evaluation.
