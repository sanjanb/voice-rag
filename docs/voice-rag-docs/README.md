# VoiceRAG Engineering Documentation

This directory contains the implementation specifications for the VoiceRAG project.

## Reading order

1. [Project Specification](00-project-spec.md)
2. [Folder Structure](01-folder-structure.md)
3. [Architecture](02-architecture.md)
4. [STT](03-stt.md)
5. [Chunking](04-chunking.md)
6. [Retrieval](05-retrieval.md)
7. [Query Routing and Reranking](06-reranking-and-query-routing.md)
8. [Guardrails](07-guardrails.md)
9. [Structured Output](08-structured-output.md)
10. [Harness and Observability](09-harness-observability.md)
11. [Evaluation and Benchmarking](10-evaluation-and-benchmarking.md)
12. [Technology Stack](11-tech-stack.md)
13. [Development Phases](12-phases.md)
14. [Implementation Order](13-implementation-order.md)
15. [Agent Operating Rules](14-agent-operating-rules.md)

## Core principle

Build a measurable system first. Optimize only after the benchmark identifies the bottleneck.

The project should be able to answer not only:

> "Does the RAG system work?"

but also:

> "Which architecture works best for which query and document type, what does it cost in latency, and when should the system refuse to answer?"
