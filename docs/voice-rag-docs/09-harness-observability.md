# Harness, Retries, Timeouts and Observability

## 1. Objective

The pipeline must run inside a real execution harness.

The harness is responsible for:

- orchestration
- retries
- timeouts
- fallback
- state
- structured errors
- telemetry

## 2. Pipeline state

Conceptually:

```text
RECEIVED
 ↓
TRANSCRIBING
 ↓
QUERY_READY
 ↓
RETRIEVING
 ↓
RERANKING? 
 ↓
GUARDING
 ↓
GENERATING
 ↓
VERIFYING
 ↓
COMPLETED / ABSTAINED / FAILED
```

## 3. Retry policy

Retry only transient failures.

```text
retryable:
- timeout
- temporary network failure
- provider 5xx

non-retryable:
- invalid input
- authentication error
- schema violation after bounded repair
- unsupported media
```

Initial policy:

```yaml
retry:
  max_attempts: 2
  backoff_ms: 20
```

Tune later.

## 4. Timeouts

Every stage has a timeout budget.

Example starting budget:

```yaml
timeouts:
  stt_ms: 120
  query_ms: 10
  retrieval_ms: 40
  rerank_ms: 40
  generation_ms: 100
  total_ms: 200
```

These are engineering targets, not guaranteed achievable values.

If a stage cannot fit the budget, the benchmark must expose that fact.

## 5. Fallback matrix

```text
STT primary timeout
    → retry
    → fallback STT

Reranker timeout
    → use RRF candidates
    → guard

LLM timeout
    → bounded retry if safe
    → fallback model/provider if configured
    → typed failure

Verifier timeout
    → conservative policy
    → abstain unless policy explicitly allows safe fallback
```

## 6. Observability

Instrument every stage.

Recommended telemetry fields:

```text
request_id
trace_id
stage
provider
model
start_time
duration_ms
status
error_code
retry_count
fallback_used
query_class
retrieval_strategy
reranker_used
guardrail_decision
```

OpenTelemetry Python supports manual traces, nested spans, exceptions and metrics, making it appropriate for stage-level instrumentation. citeturn0search2turn0search3

## 7. Stage spans

Create spans:

```text
voice_rag.request
 ├── stt
 ├── query_analysis
 ├── dense_retrieval
 ├── sparse_retrieval
 ├── rrf
 ├── reranker
 ├── context_builder
 ├── retrieval_guard
 ├── generation
 ├── answer_guard
 └── response
```

## 8. Parallelism

Run independent operations concurrently.

Example:

```text
              query
             /     \
            /       \
        dense       sparse
            \       /
             \     /
               RRF
```

Do not serialize dense and sparse retrieval unless the infrastructure requires it.

## 9. Measure every stage

Record:

```text
audio_capture_ms
stt_ms
query_processing_ms
embedding_ms
dense_retrieval_ms
sparse_retrieval_ms
rrf_ms
rerank_ms
context_build_ms
generation_ms
verification_ms
serialization_ms
total_ms
```

## 10. Latency decomposition

For each request:

```text
total_ms ≈
  capture
+ network
+ STT
+ query
+ embedding
+ retrieval
+ reranking
+ context
+ generation
+ verification
+ response
```

Do not hide network time.

## 11. Cold vs warm benchmarks

Measure separately:

- cold start
- warm model
- warm database
- repeated query
- unseen query

Never publish only the best warm-cache result.

## 12. Logging

Use structured logs.

Example:

```json
{
  "event": "stage_complete",
  "request_id": "abc",
  "stage": "dense_retrieval",
  "duration_ms": 8.2,
  "status": "success"
}
```

Never log raw secrets, API keys or unnecessary user audio.
