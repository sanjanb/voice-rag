# Implementation Order for the Agentic Builder

## 1. Rule

Implement in dependency order.

Do not build the frontend first.

Do not optimize latency before the baseline works.

Do not choose final thresholds before evaluation data exists.

Do not claim benchmark numbers before running the benchmark.

## 2. Exact order

### Step 1: Repository and configuration

Create:

```text
folder structure
pyproject.toml
.env.example
configuration models
logging
```

### Step 2: Core schemas

Create:

```text
AudioRequest
TranscriptionResult
QueryAnalysis
RetrievedChunk
RetrievalDecision
GeneratedAnswer
ClaimVerification
FinalResponse
PipelineError
```

### Step 3: Interfaces

Define interfaces for:

```text
SpeechRecognizer
Embedder
SparseRetriever
VectorStore
Reranker
Generator
Verifier
```

### Step 4: Document ingestion

Implement:

```text
loader
parser
metadata extraction
chunk model
indexer
```

### Step 5: Fixed chunking baseline

Implement the simplest deterministic strategy first.

### Step 6: Baseline dense retrieval

Implement:

```text
query
→ embedding
→ vector search
→ top K
```

### Step 7: Baseline generation

Implement:

```text
retrieved context
→ structured generator
→ citations
```

### Step 8: Evaluation harness v1

Before adding many retrieval features, create:

```text
dataset loader
Recall@K
MRR
basic answer evaluation
latency measurement
```

### Step 9: Additional chunkers

Implement:

```text
structural
semantic
parent-child
```

### Step 10: Document profiler + selector

Implement adaptive strategy selection.

Keep selector decisions observable.

### Step 11: Sparse retrieval

Add BM25.

### Step 12: RRF

Implement:

```text
dense
+
sparse
→ RRF
```

### Step 13: Retrieval benchmark

Compare:

```text
dense
sparse
hybrid
```

### Step 14: Query difficulty router

Start deterministic.

Signals:

```text
query complexity
multi-hop indicator
retrieval score
score margin
dense/sparse agreement
```

### Step 15: Reranker

Implement bounded reranking.

### Step 16: Adaptive reranking benchmark

Compare:

```text
always rerank
never rerank
adaptive
```

### Step 17: Retrieval guard

Implement:

```text
evidence confidence
→ allow / abstain
```

Do not tune thresholds yet.

### Step 18: Answer verification

Implement:

```text
answer
→ claims
→ evidence support
→ pass/fail
```

### Step 19: STT

Implement:

```text
SpeechRecognizer
HostedSTT
LocalSTT
FallbackSTT
```

### Step 20: Voice transport

Implement:

```text
microphone
→ WebSocket
→ STT
```

### Step 21: Harness

Add:

```text
timeouts
retries
fallbacks
state
typed errors
```

### Step 22: Full telemetry

Add stage-level tracing and metrics.

### Step 23: Full benchmark dataset

Add:

```text
easy
hard
ambiguous
multi-hop
exact-match
unanswerable
out-of-domain
adversarial
```

### Step 24: Final benchmark

Run the full matrix.

### Step 25: Threshold tuning

Tune:

```text
retrieval guard
query router
reranker invocation
answer guard
```

using validation data only.

### Step 26: Final test

Run once on the held-out test set.

Freeze configuration.

### Step 27: Performance optimization

Optimize the largest measured bottlenecks.

### Step 28: Frontend polish

Build:

- microphone UI
- transcript
- answer
- citations
- latency breakdown
- guardrail status

### Step 29: Deployment

Dockerize and add health checks.

### Step 30: Final documentation

README must contain:

```text
problem
architecture
setup
how it works
chunking strategies
retrieval
routing
reranking
guardrails
benchmark methodology
measured results
latency distribution
limitations
future work
```

## 3. Agent execution policy

For every implementation task:

1. Read the relevant architecture document.
2. Inspect existing code.
3. Implement the smallest coherent change.
4. Run tests.
5. Run a smoke test.
6. Record configuration changes.
7. Update documentation if behavior changed.
8. Do not silently change architecture.
9. Do not add dependencies without justification.
10. Do not mark a task complete if tests or acceptance criteria fail.

## 4. Definition of complete

A phase is complete only when:

```text
implementation
+
tests
+
observable behavior
+
acceptance criteria
```

all pass.
