# VoiceRAG Project Specification

## 1. Project Goal

Build a production-oriented, voice-enabled Retrieval-Augmented Generation system:

> Speak a question → transcribe it → retrieve evidence → decide whether the system can answer → generate a grounded answer → return citations and latency telemetry.

The system must be engineered around five properties:

1. Voice-first input
2. Retrieval quality
3. Grounded and conservative answers
4. Explicit failure recovery
5. Measured latency

The project should not treat "under 200 ms" as a guaranteed fact. It is a performance target that must be tested honestly across real queries and reported using P50, P70, P90, P95, P99 and P100/max.

## 2. Core Pipeline

```text
Audio
  ↓
STT
  ↓
Query normalization
  ↓
Query difficulty classification
  ↓
Dense retrieval ─────┐
                     ├── RRF fusion
Sparse/BM25 ─────────┘
  ↓
Optional reranking
  ↓
Evidence/context builder
  ↓
Retrieval guard
  ↓
Grounded generation
  ↓
Answer/claim verification
  ↓
Final structured response
  ↓
Optional TTS
```

## 3. Core Engineering Principles

### Quality before optimization

Every optimization must be validated against a quality baseline.

### Fast path and slow path

Not every query needs the same amount of computation.

- Easy/high-confidence query → dense + sparse retrieval, no reranker
- Ambiguous/complex/low-margin query → hybrid retrieval + reranker
- Insufficient evidence → abstain

### No silent failures

Every stage must have:

- timeout
- bounded retry
- typed error
- fallback where appropriate
- telemetry

### No unsupported claims

The generator may only use retrieved evidence. Unsupported claims must trigger verification failure, regeneration, correction, or abstention.

## 4. Definition of Done

The project is complete when:

- voice input works end to end
- STT has a primary provider and fallback
- at least four chunking strategies exist
- chunking can be selected by document structure
- hybrid dense + sparse retrieval works
- RRF is implemented
- query difficulty controls reranking
- retrieval guard can abstain
- generated answers have citations
- generated claims are checked against evidence
- all pipeline stages emit latency telemetry
- retries and timeouts are implemented
- benchmark dataset exists
- retrieval, generation, guardrail and latency metrics are computed
- chunking/retrieval/reranking configurations are benchmarked
- README documents measured results rather than assumed performance

## 5. Non-Goals for V1

Do not initially build:

- autonomous web search
- multi-agent planning
- fine-tuning a foundation model
- a complicated memory system
- arbitrary document editing
- fully autonomous ingestion from unknown sources

These can be extensions after the core system is stable.
