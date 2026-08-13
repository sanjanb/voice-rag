# Query Difficulty, Routing and Reranking

## 1. Objective

Reranking improves precision but costs latency.

Therefore:

> Do not rerank every query.

Use a router to decide whether the query needs the expensive path.

## 2. Routing architecture

```text
Query
  ↓
Difficulty estimator
  │
  ├── EASY ───────→ hybrid retrieval → guard → generation
  │
  └── HARD ───────→ hybrid retrieval → reranker → guard → generation
```

## 3. What makes a query difficult?

Possible signals:

### Linguistic complexity

- multiple clauses
- multiple questions
- conditional language
- comparison requests
- temporal constraints

### Retrieval ambiguity

- low top score
- small top-score margin
- many similarly scored candidates
- disagreement between dense and sparse retrieval

### Intent complexity

Examples:

```text
"Who is X?"
```

usually simpler than:

```text
"Compare X and Y and explain which one should be used under condition Z."
```

### Multi-hop indicators

Queries that require evidence from multiple sections/documents.

### Entity ambiguity

Examples:

```text
"How does authentication work?"
```

versus:

```text
"How does OAuth refresh-token rotation work?"
```

The second is more specific.

## 4. Do not use an LLM for routing in V1

An LLM-based router introduces latency and another failure mode.

Start with deterministic signals.

Example score:

```text
difficulty_score =
    w1 * linguistic_complexity
  + w2 * retrieval_ambiguity
  + w3 * multi_hop_signal
  + w4 * entity_ambiguity
```

Then:

```text
score < threshold_fast → no reranker
score >= threshold_fast → reranker
```

## 5. Retrieval-aware routing

The strongest router may need first-stage retrieval results.

Therefore use two-stage routing:

```text
query
 ↓
cheap pre-classifier
 ↓
hybrid retrieval
 ↓
retrieval confidence
 ↓
reranker only if needed
```

This avoids paying reranking cost when the first-stage retrieval is already decisive.

## 6. Example decision rules

```text
IF query has one intent
AND top result margin is high
AND dense/sparse agreement is high
    → FAST PATH

IF query has multiple intents
OR top result margin is low
OR dense/sparse disagreement is high
OR multi-hop signal is high
    → RERANK

IF retrieval confidence is very low
    → GUARD / ABSTAIN
```

## 7. Reranker interface

```python
class Reranker(Protocol):
    async def rerank(
        self,
        query: str,
        candidates: list[RetrievedChunk],
        top_k: int,
    ) -> list[RetrievedChunk]:
        ...
```

## 8. Reranker candidate budget

Never rerank the whole corpus.

Example:

```text
dense top 20
+
sparse top 20
→ RRF top 20
→ rerank 20
→ final 5
```

The candidate budget must be benchmarked.

## 9. Reranker fallback

If reranking times out:

```text
reranker timeout
     ↓
use RRF results
     ↓
continue only if retrieval guard passes
```

Do not automatically fail the entire request.

## 10. Benchmark

Measure:

```text
hybrid
vs
hybrid + reranker
```

Across:

- easy queries
- ambiguous queries
- multi-hop queries
- exact-match queries
- unanswerable queries

The goal is not maximum reranker usage.

The goal is:

```text
quality gain
/
latency cost
```

## 11. Success criterion

The router is successful if:

- difficult queries receive most of the quality benefit
- easy queries avoid unnecessary latency
- overall answer quality does not degrade materially
- average and tail latency improve compared with always-rerank
