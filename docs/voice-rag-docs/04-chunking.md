# Document Parsing and Adaptive Chunking

## 1. Objective

Chunking must depend on document characteristics rather than blindly applying one splitter to every document.

The system should support multiple strategies and select a strategy using document signals.

## 2. Strategies

### Strategy A: Fixed token chunks

Example:

```text
chunk_size = 400–800 tokens
overlap = 10–15%
```

Use as the baseline.

Best for:

- plain text
- homogeneous documents
- documents without useful structure

Weakness:

- can split concepts
- ignores headings and tables

### Strategy B: Structural chunking

Split according to document structure:

```text
Document
 ├── Heading
 │    ├── paragraph
 │    ├── paragraph
 │    └── table
 └── Heading
      └── paragraph
```

Store hierarchy:

```json
{
  "document_id": "...",
  "heading_path": ["Authentication", "API Keys"],
  "content": "...",
  "chunk_id": "..."
}
```

Use for:

- Markdown
- HTML
- technical documentation
- reports with headings

### Strategy C: Semantic chunking

Group sentences/paragraphs while semantic similarity remains high.

Conceptually:

```text
sentence A
sentence B
sentence C
       ↓
high similarity
       ↓
same chunk

sentence D
       ↓
large semantic change
       ↓
new chunk
```

Use when:

- document has weak/no headings
- topic transitions matter
- paragraph boundaries are unreliable

Cost:

- additional embedding computation during ingestion

### Strategy D: Parent-child chunking

Create small searchable children with larger parent context.

```text
Parent
 ├── Child 1
 ├── Child 2
 └── Child 3
```

Search children, return parent or parent + neighboring children.

Use for:

- long technical documents
- manuals
- policies
- reports
- documents where small passages are precise but surrounding context is necessary

## 3. Document profiler

Before chunking, compute:

```text
document_type
length
heading_density
paragraph_length_distribution
table_density
code_density
list_density
structure_quality
semantic_transition_score
```

Example decision:

```text
IF heading_density is high
    → structural

ELSE IF structure_quality is low AND semantic transitions are high
    → semantic

ELSE IF document is long and context dependencies are high
    → parent-child

ELSE
    → fixed baseline
```

The selector must be deterministic and logged.

## 4. Important design rule

Do not assume the selector is correct.

The selector is a hypothesis.

Benchmark:

```text
selector strategy
vs
every individual strategy
```

If the selector does not improve quality/latency, simplify it.

## 5. Metadata

Every chunk must contain:

```text
chunk_id
document_id
parent_id
content
document_type
heading_path
page_number if available
source_uri
chunk_strategy
chunk_version
token_count
char_count
```

This metadata is essential for citations, debugging and evaluation.

## 6. Chunk invariants

A valid chunk:

- contains meaningful content
- preserves source identity
- has deterministic ID generation
- records its strategy
- stays within configured token bounds unless an atomic block requires an exception
- can be mapped back to the source

## 7. Tables and code

Do not treat tables as ordinary paragraphs.

For tables:

- preserve column headers
- preserve row relationships
- optionally create a textual representation
- keep table metadata

For code:

- preserve code blocks
- do not split inside a function/class where possible
- store language metadata

## 8. Benchmarking

Chunking benchmarks should happen after the full retrieval pipeline is stable enough to evaluate.

But create the evaluation framework early.

The final benchmark must compare:

```text
fixed
semantic
structural
parent-child
adaptive selector
```

Metrics:

- Recall@K
- MRR
- nDCG
- answer correctness
- faithfulness
- context token count
- ingestion cost
- retrieval latency

## 9. Benchmark principle

A chunking strategy is not "better" because chunks look better.

It is better only if it improves the downstream objective:

```text
retrieval quality
+
answer quality
+
latency
+
context efficiency
```
