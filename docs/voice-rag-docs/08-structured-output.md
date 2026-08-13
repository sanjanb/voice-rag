# Structured Output and Internal Contracts

## 1. Objective

Every stage must communicate through typed contracts.

Use Pydantic models for Python-side validation.

## 2. Core schemas

### AudioRequest

```text
request_id
session_id
audio_format
sample_rate
audio_bytes/reference
```

### TranscriptionResult

```text
text
language
confidence
provider
model
latency_ms
fallback_used
```

### QueryAnalysis

```text
normalized_query
intent
difficulty_score
difficulty_class
multi_hop
ambiguity
```

### RetrievedChunk

```text
chunk_id
document_id
content
metadata
dense_rank
sparse_rank
rrf_score
rerank_score
```

### RetrievalDecision

```text
decision
confidence
reason
evidence_ids
```

### GeneratedAnswer

```text
decision
answer
citations
claims
confidence
```

### ClaimVerification

```text
claim_id
claim
supported
evidence_ids
reason
```

### FinalResponse

```text
request_id
decision
answer
citations
transcript
metrics
errors
```

## 3. Generation contract

The generator should return a schema similar to:

```json
{
  "decision": "answer",
  "answer": "The API supports OAuth 2.0.",
  "citations": ["chunk_12"],
  "claims": [
    {
      "claim_id": "c1",
      "text": "The API supports OAuth 2.0.",
      "citation_ids": ["chunk_12"]
    }
  ]
}
```

Abstention:

```json
{
  "decision": "abstain",
  "answer": null,
  "citations": [],
  "claims": []
}
```

## 4. Validation

Every external response must be validated before entering the next stage.

Invalid structured output:

```text
validate
 ↓
fail
 ↓
bounded repair/retry
 ↓
fail
 ↓
typed pipeline error
```

Do not endlessly retry invalid JSON.

## 5. Schema versioning

Every top-level response should contain:

```text
schema_version
```

Example:

```text
schema_version = "1.0"
```

Changing a contract should require a version change or backward-compatible migration.

## 6. Deterministic fields

Generated text may vary.

The following must remain deterministic:

- request ID
- chunk IDs
- document IDs
- citation IDs
- stage names
- error codes
- metric field names

## 7. Error contract

Use machine-readable errors:

```json
{
  "code": "STT_TIMEOUT",
  "stage": "stt",
  "retryable": true,
  "message": "Speech recognition timed out."
}
```

Do not expose provider-specific raw exceptions to clients.
