# Evaluation and Benchmarking

## 1. Objective

The evaluation system is a first-class project component.

It must answer:

1. Is retrieval correct?
2. Are answers correct?
3. Are answers grounded?
4. Does the guardrail abstain appropriately?
5. How fast is the complete pipeline?
6. Which configuration gives the best quality/latency tradeoff?

## 2. Dataset structure

Use JSONL.

Example:

```json
{
  "id": "q001",
  "question": "How do I reset my API key?",
  "answerable": true,
  "relevant_chunks": ["chunk_12", "chunk_18"],
  "reference_answer": "..."
}
```

## 3. Query categories

The dataset must contain:

### Direct factual

```text
What is X?
```

### Exact identifier

```text
What does E4017 mean?
```

### Procedural

```text
How do I configure X?
```

### Comparative

```text
Compare X and Y.
```

### Multi-hop

```text
What does X require and how does it interact with Y?
```

### Ambiguous

```text
How does authentication work?
```

### Unanswerable

Questions whose answer is absent from the corpus.

### Out-of-domain

Questions unrelated to the corpus.

### Adversarial

Documents or queries designed to test instruction injection and retrieval manipulation.

## 4. Dataset split

Use:

```text
train/dev style:
validation set → threshold/config tuning

test set:
final reporting only
```

Do not repeatedly tune thresholds against the final test set.

## 5. Retrieval metrics

### Recall@K

```text
relevant retrieved documents
/
total relevant documents
```

Measure:

```text
Recall@1
Recall@5
Recall@10
```

### MRR

Measures how early the first relevant result appears.

### nDCG

Useful when multiple results have graded relevance.

## 6. Generation metrics

Measure:

- answer correctness
- faithfulness/groundedness
- citation precision
- citation recall
- completeness

Where possible, combine automated evaluation with manually reviewed samples.

## 7. Guardrail metrics

Measure separately:

```text
unsupported_answer_rate
false_abstention_rate
abstention_precision
abstention_recall
```

Critical metric:

```text
unsupported_answer_rate on unanswerable queries
```

## 8. Latency metrics

Report:

```text
P50
P70
P90
P95
P99
P100 / max
```

For every major stage and end-to-end.

## 9. Throughput

Measure:

```text
requests/sec
concurrent users
error rate
```

At multiple concurrency levels.

## 10. Benchmark matrix

### Chunking

```text
fixed
semantic
structural
parent-child
adaptive
```

### Retrieval

```text
dense
sparse
hybrid RRF
```

### Reranking

```text
none
always
adaptive
```

### Guardrails

```text
retrieval only
retrieval + answer verification
```

## 11. Final benchmark table

The final README should contain something like:

| Configuration | Recall@5 | MRR | Faithfulness | Abstention Quality | P50 | P95 | P99 |
|---|---:|---:|---:|---:|---:|---:|---:|
| Dense + fixed | measured | measured | measured | measured | measured | measured | measured |
| Hybrid + fixed | measured | measured | measured | measured | measured | measured | measured |
| Hybrid + structural | measured | measured | measured | measured | measured | measured | measured |
| Hybrid + adaptive rerank | measured | measured | measured | measured | measured | measured | measured |

Never fill this table with invented numbers.

## 12. Chunking benchmark timing

The benchmark framework should be created early.

The comprehensive chunking comparison should happen after:

- ingestion is stable
- retrieval is stable
- evaluation dataset exists
- baseline generation works

Otherwise chunking conclusions will be unreliable.

## 13. Query-routing benchmark

Compare:

```text
always rerank
never rerank
adaptive rerank
```

Measure:

```text
quality
+
latency
+
reranker invocation rate
```

The ideal system gets most of the quality benefit with substantially fewer reranker calls.

## 14. Statistical discipline

When comparing configurations:

- use the same dataset
- use the same model versions
- use the same query set
- record configuration
- run enough repetitions for latency
- report variability where useful

Do not choose a configuration because of one lucky run.
