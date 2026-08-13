# Guardrails and Abstention

## 1. Objective

The system must know when it should not answer.

There are two independent guardrails:

```text
Retrieval Guard
      ↓
"Do we have enough evidence?"

Answer Guard
      ↓
"Is the generated answer supported by the evidence?"
```

## 2. Retrieval guard

Inputs:

- top retrieval scores
- score margin
- dense/sparse agreement
- reranker score if available
- number of usable evidence chunks
- metadata validity

Output:

```json
{
  "decision": "allow|abstain",
  "confidence": 0.0,
  "reason": "..."
}
```

## 3. Retrieval guard states

### Strong evidence

```text
ALLOW
```

### Weak evidence

```text
ABSTAIN
```

### Conflicting evidence

```text
ABSTAIN or CLARIFY
```

### No evidence

```text
ABSTAIN
```

## 4. Abstention response

The system should not invent a reason.

Example policy:

```text
"I don't have enough information in the provided sources to answer that reliably."
```

If appropriate, mention what information is missing.

## 5. Answer guard

The generated answer is checked against the retrieved context.

The verifier should evaluate claims individually where practical.

Conceptual flow:

```text
retrieved evidence
       ↓
     LLM
       ↓
 generated answer
       ↓
 claim extraction
       ↓
 evidence support check
       ↓
 ┌─────┴─────┐
 PASS        FAIL
  │            │
 answer     regenerate /
             abstain
```

## 6. Grounding policy

Every factual claim should be:

- directly supported
- inferable from evidence without introducing new facts
- associated with one or more citations

Unsupported claims are not acceptable.

## 7. Citation policy

Citations should point to:

```text
document_id
chunk_id
source_uri
page/section if available
```

Example:

```json
{
  "citation": {
    "document_id": "doc_12",
    "chunk_id": "chunk_31",
    "section": "Authentication",
    "page": 8
  }
}
```

## 8. Guardrail thresholds

Do not invent thresholds.

Start with configurable thresholds:

```yaml
guardrails:
  retrieval:
    min_confidence: null
    min_candidates: 1
    max_allowed_conflict: null

  answer:
    max_unsupported_claims: 0
```

Set numeric thresholds only after collecting benchmark data.

## 9. Calibration

Thresholds must be selected using a validation dataset.

Measure:

```text
false answer rate
false abstention rate
precision of abstentions
recall of abstentions
```

The threshold should minimize harmful false answers while avoiding excessive abstention.

## 10. Important principle

A guardrail that abstains on everything is not successful.

A guardrail that answers everything is not successful.

The useful operating point is:

```text
high supported-answer rate
+
low unsupported-answer rate
+
acceptable abstention rate
```

## 11. Prompt-level guardrails are not enough

Prompt instructions such as "do not hallucinate" are not a verification system.

Use:

```text
retrieval checks
+
structured output
+
citation requirements
+
post-generation verification
```

## 12. Security extension

Later versions should evaluate retrieval poisoning/hubness and malicious document instructions. Retrieval systems can have security failure modes beyond ordinary hallucination, so benchmark adversarial documents separately from normal quality evaluation.
