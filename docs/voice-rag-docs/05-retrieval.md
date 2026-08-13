# Retrieval: Dense + Sparse + RRF

## 1. Objective

Use hybrid retrieval to combine:

- semantic matching
- lexical/exact matching

The first-stage retriever should maximize recall.

## 2. Architecture

```text
                    Query
                      │
            ┌─────────┴─────────┐
            ▼                   ▼
      Dense Retriever       Sparse/BM25
            │                   │
          top N               top N
            │                   │
            └─────────┬─────────┘
                      ▼
                     RRF
                      │
                    top M
                      │
                optional
                 reranker
                      │
                    top K
```

Hybrid retrieval is a strong fit for technical corpora because dense search captures semantic similarity while sparse search handles exact terms, identifiers and rare phrases. Qdrant's current documentation supports multi-stage hybrid search and RRF-style fusion. citeturn0search0turn0search1

## 3. Dense retrieval

Input:

```text
query → embedding model → vector
```

Search:

```text
vector → ANN index → top N
```

Store:

```text
dense_vector
```

## 4. Sparse retrieval

Baseline:

```text
BM25
```

BM25 is particularly useful for:

- error codes
- function names
- product names
- version numbers
- exact terminology
- identifiers

## 5. RRF

For each result list, rank documents.

Conceptual formula:

```text
RRF(d) = Σ 1 / (k + rank(d))
```

Use a configurable `k`.

Do not optimize the RRF constant prematurely.

## 6. Weighted RRF

V2 may support:

```text
RRF(d) =
  α * dense_rank_score
  +
  β * sparse_rank_score
```

Only tune weights using a held-out validation set.

Do not tune weights on the final test set.

## 7. Candidate sizes

Initial configuration:

```yaml
retrieval:
  dense_top_n: 20
  sparse_top_n: 20
  fused_top_n: 20
  final_top_k: 5
```

These are starting values, not final claims.

Benchmark them.

## 8. Retrieval filters

Support metadata filters:

```text
document_id
document_type
version
language
source
tenant
date
```

Filtering should happen as early as practical.

## 9. Retrieval confidence

Do not rely on one raw similarity score.

Build a retrieval confidence signal from:

- top result score
- score gap between top results
- agreement between dense and sparse rankings
- number of relevant-looking candidates
- reranker margin when reranking is used

Example:

```text
high confidence:
dense and sparse agree + strong top result + strong margin

low confidence:
retrievers disagree + weak scores + small margin
```

This signal feeds the query router and retrieval guard.

## 10. Retrieval output

```json
{
  "query_id": "...",
  "strategy": "hybrid_rrf",
  "candidates": [
    {
      "chunk_id": "...",
      "rank": 1,
      "rrf_score": 0.031,
      "dense_rank": 1,
      "sparse_rank": 3
    }
  ]
}
```

## 11. Evaluation

Compare:

```text
dense only
sparse only
dense + sparse
dense + sparse + reranker
```

Measure:

- Recall@1
- Recall@5
- Recall@10
- MRR
- nDCG
- latency

Do not claim hybrid retrieval is better for your corpus until the benchmark proves it.
