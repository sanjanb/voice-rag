# Contributing to VoiceRAG

Thank you for contributing to VoiceRAG.

VoiceRAG is a team-built, latency-sensitive voice-to-answer RAG system. We care about four things throughout development:

1. **Correctness**: answers must be grounded in retrieved evidence.
2. **Latency**: every pipeline stage must be measurable.
3. **Reliability**: failures, retries, timeouts, and fallbacks must be explicit.
4. **Reproducibility**: benchmarks and experiments must be repeatable.

This document defines how the team works in the repository.

---

## 1. Repository model

We use a **modular monolith** for the application and Docker Compose for local development.

The repository should generally follow these boundaries:

```text
app/
├── api/
├── pipeline/
├── speech/
├── ingestion/
├── chunking/
├── retrieval/
├── reranking/
├── guardrails/
├── generation/
├── evaluation/
└── observability/
```

Logical modules should communicate through explicit interfaces/contracts.

Do not create a new microservice simply because a new module exists. Extract a service only when there is a demonstrated need for independent scaling, GPU isolation, resource isolation, deployment independence, or failure isolation.

---

# 2. Branching strategy

`main` is the stable branch.

Do not work directly on `main`.

Create a branch for every piece of work.

### Feature

```text
feature/stt-fallback
feature/hybrid-retrieval
feature/reranker-routing
```

### Bug fix

```text
fix/stt-timeout
fix/rrf-score-normalization
```

### Benchmark / experiment

```text
benchmark/chunking-comparison
benchmark/retrieval-k-values
experiment/reranker-threshold
```

### Documentation

```text
docs/contributing-guide
docs/architecture
```

Use lowercase names and keep them descriptive.

---

# 3. Ownership

The project is divided by subsystem, but ownership does not mean that only one person may touch a directory.

### Project lead / integration

Responsible for:

- overall architecture
- pipeline orchestration
- API contracts
- integration
- Docker Compose
- CI
- observability
- final integration and release decisions

### Retrieval owner

Responsible primarily for:

- document ingestion
- chunking strategies
- embeddings
- sparse retrieval
- dense retrieval
- RRF
- retrieval evaluation
- retrieval benchmarks

### Voice / answer-quality owner

Responsible primarily for:

- STT
- STT fallback logic
- query processing
- reranking
- guardrails
- abstention
- generation
- answer evaluation

All contributors are expected to review code outside their primary area when appropriate.

---

# 4. Before starting work

Before implementing a substantial feature:

1. Check existing GitHub Issues.
2. Create or claim an issue.
3. Read the relevant architecture/design document.
4. Identify the module you will modify.
5. Define how the feature will be tested.
6. Define how the feature will be benchmarked if it affects latency or quality.

For research-heavy changes, write down the hypothesis before running the experiment.

Example:

```text
Hypothesis:
A semantic chunker will improve retrieval recall for long technical documents
compared with fixed-size chunking.

Evaluation:
Recall@5, Recall@10, MRR, latency, and answer groundedness.

Dataset:
Held-out benchmark dataset.

Success criterion:
Improvement in Recall@10 without unacceptable latency regression.
```

---

# 5. Local development

Use the project's documented environment and Docker Compose configuration.

Do not introduce a new package manager, framework, database, or infrastructure component without discussing the architectural impact.

Before submitting a PR, run:

```bash
docker compose up --build
```

and the project's test/lint commands.

The exact commands should remain documented in the repository README.

---

# 6. Code principles

### Prefer small modules

Avoid large files that contain unrelated responsibilities.

Bad:

```text
pipeline.py
  ├── STT
  ├── chunking
  ├── retrieval
  ├── reranking
  ├── LLM
  └── guardrails
```

Prefer:

```text
speech/
retrieval/
reranking/
generation/
guardrails/
pipeline/
```

### Use explicit contracts

Subsystems should expose stable interfaces.

For example:

```python
class Retriever(Protocol):
    async def retrieve(
        self,
        query: str,
        top_k: int,
    ) -> list[RetrievedChunk]:
        ...
```

This allows implementations to change without rewriting the whole pipeline.

### Avoid hidden state

Prefer explicit inputs and outputs.

Do not rely on global mutable state for pipeline execution.

---

# 7. Structured data

Pipeline boundaries should use typed, structured objects.

Examples:

```text
TranscriptionResult
QueryAnalysis
RetrievedChunk
RetrievalResult
RerankResult
GuardrailResult
GeneratedAnswer
PipelineResult
StageMetrics
```

Avoid passing unstructured dictionaries through the entire system when a typed model is appropriate.

---

# 8. Error handling

Every external or expensive dependency must have explicit failure behavior.

Examples:

- STT timeout
- STT provider failure
- embedding failure
- vector database unavailable
- LLM timeout
- reranker failure
- malformed model output

Do not silently swallow exceptions.

Use explicit:

```text
timeout
retry
fallback
abstain
fail
```

behavior.

A fallback must be observable in logs and metrics.

---

# 9. Retrieval rules

Retrieval changes must be evaluated against the benchmark dataset.

Do not claim that one chunking or retrieval strategy is better based on a few manually tested questions.

At minimum, retrieval experiments should record:

- Recall@k
- Precision@k where applicable
- MRR
- nDCG where applicable
- retrieval latency
- candidate count
- failure rate

When changing chunking, compare against the existing baseline.

---

# 10. Reranking rules

Reranking is adaptive.

Do not automatically rerank every query unless benchmarks justify it.

The routing decision should consider signals such as:

- query complexity
- ambiguity
- retrieval score distribution
- agreement between sparse and dense retrieval
- candidate overlap
- score margin between top candidates

The system must record:

```text
reranker_used = true/false
reranker_reason
reranker_latency_ms
```

Do not tune routing thresholds against the final test set.

Use a validation set for threshold selection.

---

# 11. Guardrail rules

The system must be able to abstain.

A guardrail should be able to distinguish at least:

```text
ANSWER
ABSTAIN
RETRY
ERROR
```

Do not weaken a guardrail merely to increase answer rate.

For every guardrail change, evaluate both:

- false abstentions
- unsafe / unsupported answers

The objective is not maximum answer rate. It is maximum trustworthy answer rate.

---

# 12. Latency rules

Every pipeline stage must be measurable.

At minimum:

```text
audio_input
stt
query_processing
dense_retrieval
sparse_retrieval
rrf
reranking
context_building
generation
answer_verification
total
```

Report distributions, not only averages.

At minimum record:

```text
P50
P70
P95
P99
```

Do not report a latency number without specifying:

- dataset
- hardware
- model/provider
- warm/cold state
- concurrency
- measurement boundaries

Never optimize the benchmark by excluding slow stages from the reported total.

---

# 13. Benchmarking rules

A benchmark must be reproducible.

Every benchmark should record:

```text
benchmark_id
dataset_version
git_commit
model
configuration
hardware
timestamp
query_count
random_seed
metrics
```

Do not tune against the test set.

Use:

```text
development / training
        ↓
validation
        ↓
final test
```

for experiments where threshold or strategy selection is involved.

---

# 14. Commit messages

Use clear conventional-style commits.

Examples:

```text
feat: add hybrid dense and BM25 retrieval
feat: add STT provider fallback
fix: handle vector store timeout
perf: reduce reranker candidate count
test: add retrieval recall benchmark
bench: compare semantic and recursive chunking
refactor: isolate retrieval interfaces
docs: add benchmark methodology
```

Keep commits focused.

Avoid:

```text
update stuff
changes
final
final2
working
```

---

# 15. Pull requests

Every non-trivial change should go through a PR.

A PR should include:

### Summary

What changed?

### Motivation

Why was it needed?

### Implementation

How was it implemented?

### Testing

What tests were run?

### Benchmark

If applicable:

```text
Before:
Recall@10: ...
P50 latency: ...

After:
Recall@10: ...
P50 latency: ...
```

### Risks

What could break?

### Screenshots / recordings

Include these for UI or voice interaction changes when useful.

---

# 16. PR checklist

Before requesting review:

- [ ] Code is formatted.
- [ ] Tests pass.
- [ ] New behavior has tests.
- [ ] Errors are handled explicitly.
- [ ] No secrets are committed.
- [ ] Documentation is updated where necessary.
- [ ] Benchmark results are included for performance-sensitive changes.
- [ ] No benchmark test-set leakage.
- [ ] Logging does not expose sensitive data.
- [ ] Docker Compose still starts correctly.
- [ ] Existing functionality has not been unintentionally broken.

---

# 17. Code review

Reviewers should focus on:

1. Correctness
2. Architecture
3. Failure handling
4. Tests
5. Observability
6. Performance
7. Security
8. Maintainability

Do not approve a PR simply because the code works on one example.

For RAG changes, ask:

```text
Does retrieval actually improve?
Does answer quality improve?
Does latency regress?
Does abstention behavior change?
Does the benchmark support the claim?
```

---

# 18. Dependency changes

Do not add dependencies casually.

Before adding a dependency, consider:

- Is it actually necessary?
- Is there already an existing library that solves this?
- What is its maintenance status?
- What is the license?
- What is the runtime/latency cost?
- Does it complicate Docker builds?

Dependency additions should be mentioned in the PR description.

---

# 19. Secrets

Never commit:

```text
API keys
tokens
passwords
private credentials
.env files containing secrets
```

Use:

```text
.env.example
```

for configuration documentation.

Example:

```text
OPENAI_API_KEY=
STT_PROVIDER=
QDRANT_URL=
```

The real `.env` must remain ignored by Git.

---

# 20. Experiments are first-class work

Research experiments are welcome.

However, experimental code must be clearly identified.

Use:

```text
experiments/
benchmarks/
```

instead of mixing temporary experiments into production modules.

Every experiment should answer:

```text
Question
Hypothesis
Method
Dataset
Configuration
Results
Conclusion
```

A result that disproves our hypothesis is still a valuable result.

---

# 21. Architecture changes

If a change affects multiple subsystems, discuss the design before implementing it.

Examples:

- changing the retrieval architecture
- introducing a new model provider
- changing the vector database
- introducing a message queue
- extracting a service
- changing the benchmark methodology
- changing the public API

Do not introduce microservices simply for architectural aesthetics.

Architecture should follow measured requirements.

---

# 22. Working together

When two contributors are working on related components:

```text
Contributor A
     │
     ▼
feature/retrieval
     │
     └── PR

Contributor B
     │
     ▼
feature/reranking
     │
     └── PR

                  ↓

              main
```

Avoid having multiple people work directly on the same files unless necessary.

If two branches must modify the same interface:

1. Agree on the interface first.
2. Merge the interface change.
3. Rebase dependent branches.
4. Continue implementation.

---

# 23. Merging

The default merge path is:

```text
Issue
  ↓
Feature branch
  ↓
Implementation
  ↓
Tests
  ↓
PR
  ↓
Review
  ↓
CI
  ↓
Merge into main
```

Do not merge failing CI.

Do not bypass review simply because a change is urgent unless the project lead explicitly decides it is necessary.

---

# 24. Definition of Done

A feature is not "done" when the code runs.

It is done when:

```text
Implementation
      +
Tests
      +
Error handling
      +
Observability
      +
Documentation
      +
Benchmarking where applicable
      +
Code review
      =
DONE
```

For performance or retrieval changes, benchmark evidence is part of the implementation.

---

# 25. Guiding principle

The project should optimize for:

```text
Trustworthy answers
        +
Measured retrieval quality
        +
Measured latency
        +
Reliable failure handling
        +
Reproducible experiments
```

not simply:

```text
"It works on my machine."
```

Build small. Measure everything. Make claims only when the benchmark supports them.
