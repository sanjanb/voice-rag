# VoiceRAG Architecture

## Overview

VoiceRAG is a production-oriented, voice-enabled Retrieval-Augmented Generation system.

## Core Pipeline

```
Audio → STT → Query → Retrieval → Reranking → Guardrails → Generation → Verification → Response
```

## Components

### Speech-to-Text (STT)
- Primary: Hosted STT (OpenAI Whisper or similar)
- Fallback: Local Whisper-family model
- Interface: `SpeechRecognizer` protocol

### Query Processing
- Normalization: whitespace cleanup, filler removal
- Classification: difficulty scoring (EASY/HARD)
- Routing: fast path vs deep path

### Retrieval
- Dense: vector similarity search (Qdrant)
- Sparse: BM25 lexical search
- Fusion: Reciprocal Rank Fusion (RRF)
- Optional reranking: cross-encoder on bounded candidates

### Guardrails
- Retrieval guard: "Do we have enough evidence?"
- Answer guard: "Is the answer supported by evidence?"

### Generation
- Structured output with citations
- Claim verification against evidence
- Abstention when evidence is insufficient

### Observability
- OpenTelemetry traces per stage
- Structured JSON logging
- Latency decomposition (P50-P99)

## Dependencies

API → Pipeline → Domain services → Provider interfaces → Provider implementations

Evaluation may call the public pipeline; production code must not depend on evaluation.


                    Docker Compose
                         │
        ┌────────────────┼─────────────────┐
        │                │                 │
        ▼                ▼                 ▼
    Next.js          FastAPI API         Qdrant
                     Modular Monolith
                          │
              ┌───────────┼────────────┐
              │           │            │
             STT       Retrieval    Generation
                          │
                     ┌────┴────┐
                     │         │
                   Dense      BM25
                     │         │
                     └────┬────┘
                          │
                         RRF
                          │
                    Reranker?
                          │
                       Guard
                          │
                       Answer