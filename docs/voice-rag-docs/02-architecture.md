# System Architecture

## 1. High-level architecture

```text
                    ┌─────────────────────┐
                    │      Browser        │
                    │  Microphone/WebRTC  │
                    └──────────┬──────────┘
                               │
                         WebSocket/HTTP
                               │
                               ▼
                    ┌─────────────────────┐
                    │      FastAPI        │
                    │ API + WebSocket     │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Pipeline Orchestrator│
                    └──────────┬──────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
        ▼                      ▼                      ▼
      STT                Query Processing          Telemetry
        │                      │
        └──────────────┬───────┘
                       ▼
              ┌───────────────────┐
              │ Difficulty Router │
              └─────────┬─────────┘
                        │
                 ┌──────┴──────┐
                 ▼             ▼
              Fast Path      Deep Path
                 │             │
                 └──────┬──────┘
                        ▼
                Hybrid Retrieval
                  │          │
                Dense       Sparse
                  │          │
                  └────┬─────┘
                       ▼
                      RRF
                       │
                       ▼
              Optional Reranker
                       │
                       ▼
               Context Builder
                       │
                       ▼
              Retrieval Guard
                 │          │
               PASS       ABSTAIN
                 │          │
                 ▼          ▼
             Generator    Response
                 │
                 ▼
          Claim Verification
            │          │
          PASS       FAIL
            │          │
            ▼          ├── regenerate
         Response      └── abstain
```

## 2. Two-path retrieval

### Fast path

Use when query confidence is high and the query is simple.

```text
query
 ↓
dense + sparse
 ↓
RRF
 ↓
top K
 ↓
retrieval guard
 ↓
generation
```

### Deep path

Use when the query is ambiguous, complex, low-margin, or retrieval confidence is weak.

```text
query
 ↓
dense + sparse
 ↓
RRF
 ↓
top N candidates
 ↓
reranker
 ↓
top K
 ↓
retrieval guard
 ↓
generation
```

## 3. Components

### STT

Converts voice to text.

Requirements:

- streaming where supported
- confidence/error information
- provider timeout
- fallback provider
- audio validation

### Query processor

Performs:

- normalization
- whitespace cleanup
- spoken filler removal where safe
- optional spelling normalization
- query classification
- difficulty estimation

Do not rewrite the user's intent aggressively.

### Retrieval engine

Runs dense and sparse retrieval concurrently where possible.

The first stage should optimize recall.

### RRF

Combines independent rankings without requiring raw score calibration.

### Reranker

Runs only on a bounded candidate set.

The reranker is a precision layer, not the first-stage search engine.

### Context builder

Responsible for:

- deduplication
- parent-child expansion
- token budget
- metadata preservation
- source ordering

### Guardrails

There are two main gates:

1. Retrieval gate: "Do we have enough evidence?"
2. Answer gate: "Does the answer stay within the evidence?"

### Generator

Receives only the selected evidence and a strict answer schema.

### Observability

Every stage emits:

- start/end
- duration
- status
- error
- provider/model
- request ID
- configuration/version

## 4. Request lifecycle

Every request gets a `request_id`.

Example:

```text
request_id
 ↓
audio_received
 ↓
stt_started
 ↓
stt_completed
 ↓
query_classified
 ↓
retrieval_started
 ↓
dense_completed
 ↓
sparse_completed
 ↓
rrf_completed
 ↓
reranker_started? 
 ↓
guard_started
 ↓
generation_started
 ↓
verification_started
 ↓
response_sent
```

## 5. Failure boundaries

Each external or expensive operation must be independently bounded:

```text
STT timeout
Embedding timeout
Vector DB timeout
Reranker timeout
LLM timeout
```

A failure must become a typed pipeline error, not an unhandled exception.
