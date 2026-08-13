# VoiceRAG Frontend Product & UX Specification

## Purpose

VoiceRAG should not look like a generic "chat with PDF" application. The frontend should make the complete system visible:

```text
DOCUMENTS
    |
    v
INGESTION
    |
    v
CHUNKING
    |
    v
INDEXING
    |
    v
+-------------------------------------------------------------+
|                       USER QUERY                            |
|                         VOICE                               |
+-----------------------------+-------------------------------+
                              |
                              v
                             STT
                              |
                              v
                       QUERY ANALYSIS
                              |
                    +---------+---------+
                    v                   v
                  BM25                DENSE
                    |                   |
                    +---------+---------+
                              v
                             RRF
                              |
                              v
                         RERANKER?
                              |
                              v
                          GUARDRAIL
                         /         \
                      PASS        ABSTAIN
                       |
                       v
                    GENERATION
                       |
                       v
                ANSWER + EVIDENCE
                       |
                       v
                 LATENCY + TRACE
```

The frontend should feel like a research lab + developer console + polished AI product.

---

# 1. Product Information Architecture

```text
VoiceRAG
|
+-- Workspace
|   +-- Documents
|   +-- Ask
|   +-- Runs
|
+-- Evaluation
|   +-- Benchmarks
|   +-- Experiments
|
+-- System
    +-- Architecture
    +-- Settings
```

The first-time workflow is intentionally **documents first**:

```text
CREATE WORKSPACE
       |
       v
ADD DOCUMENTS
       |
       v
PROCESS DOCUMENTS
       |
       v
BUILD KNOWLEDGE BASE
       |
       v
READY TO ASK
       |
       v
VOICE Q&A
```

---

# 2. Landing / Workspace Entry

```text
+--------------------------------------------------------------------+
|                                                                    |
|                         ◈ VOICERAG                                 |
|                                                                    |
|             Voice -> Retrieval -> Grounded Answer                  |
|                                                                    |
|        +----------------------------------------------+            |
|        |                                              |            |
|        |              CREATE WORKSPACE                |            |
|        |                                              |            |
|        |   [ Research Papers                      ]  |            |
|        |                                              |            |
|        |             [ Create Workspace ]             |            |
|        +----------------------------------------------+            |
|                                                                    |
|          Documents     Retrieval     Voice     Grounding            |
|                                                                    |
+--------------------------------------------------------------------+
```

---

# 3. Documents Page

This is the first major product screen.

The user should be able to:

- upload documents
- inspect processing status
- see chunk counts
- see indexing status
- inspect individual documents
- delete/reprocess documents
- know when the knowledge base is ready

```text
+--------------------------------------------------------------------+
| ◈ VoiceRAG                                      Research Workspace  |
+--------------------------------------------------------------------+
|                                                                    |
| DOCUMENTS                                      [ + Add documents ]  |
|                                                                    |
| +--------------------------------------------------------------+   |
| |                                                              |   |
| |                 DROP DOCUMENTS HERE                          |   |
| |                                                              |   |
| |                 PDF · DOCX · TXT · MD                        |   |
| |                                                              |   |
| |                     [ Browse files ]                          |   |
| |                                                              |   |
| +--------------------------------------------------------------+   |
|                                                                    |
| KNOWLEDGE BASE                                                     |
|                                                                    |
| Status: ● READY                                                    |
|                                                                    |
| Documents       Chunks       Indexed       Last updated             |
| 12              4,821        4,821         2 min ago               |
|                                                                    |
| +--------------------------------------------------------------+   |
| | Document                  Chunks    Status       Actions       |   |
| +--------------------------------------------------------------+   |
| | research-paper.pdf          842      ● Ready     View · ...    |   |
| | annual-report.pdf           611      ● Ready     View · ...    |   |
| | technical-report.pdf        503      ● Ready     View · ...    |   |
| | notes.md                    122      ● Ready     View · ...    |   |
| +--------------------------------------------------------------+   |
|                                                                    |
+--------------------------------------------------------------------+
```

---

# 4. Document Upload and Processing

The actual document pipeline:

```text
ADD DOCUMENTS
      |
      v
FILE SELECTION
      |
      v
VALIDATE
   /      \
VALID     INVALID
  |          |
  v          v
UPLOAD     ERROR
  |
  v
PARSING
  |
  v
TEXT EXTRACTION
  |
  v
DOCUMENT ANALYSIS
  |
  v
CHUNKING
  |
  v
EMBEDDING
  |
  +------------------+
  |                  |
  v                  v
SPARSE INDEX      VECTOR INDEX
  |                  |
  +--------+---------+
           |
           v
         READY
```

Processing UI:

```text
+--------------------------------------------------------------------+
| <- Documents                                                       |
|                                                                    |
| PROCESSING DOCUMENT                                                |
|                                                                    |
| research-paper.pdf                                                |
|                                                                    |
| +----------------------------------------------------------------+ |
| |                                                                | |
| | ✓ Upload                         100%                           | |
| |                                                                | |
| | ✓ Parse                          100%                           | |
| |                                                                | |
| | ✓ Extract text                   100%                           | |
| |                                                                | |
| | ● Chunking                       ███████████░░░ 68%              | |
| |                                                                | |
| | ○ Embeddings                                                    | |
| | ○ Sparse index                                                    | |
| | ○ Vector index                                                    | |
| |                                                                | |
| +----------------------------------------------------------------+ |
|                                                                    |
| Chunking strategy: Structure-aware / Recursive                     |
| Estimated chunks: 842                                              |
|                                                                    |
+--------------------------------------------------------------------+
```

Do not fake progress with timers. The UI should reflect real backend events.

---

# 5. Document Details

```text
+--------------------------------------------------------------------+
| <- Documents                                                       |
|                                                                    |
| research-paper.pdf                                                |
|                                                                    |
| Status             ● READY                                         |
| Pages              24                                              |
| Characters         182,421                                         |
| Chunks             842                                             |
| Embeddings         842                                             |
| Indexed            Yes                                             |
|                                                                    |
+--------------------------------------------------------------------+
| PROCESSING                                                         |
|                                                                    |
| Parser             PDF                                             |
| Chunking           Recursive                                       |
| Chunk size         512 tokens                                      |
| Overlap            64 tokens                                       |
| Sparse index       BM25                                            |
| Dense index        <configured model>                              |
|                                                                    |
+--------------------------------------------------------------------+
| CHUNKS                                                             |
|                                                                    |
| #001  Section 1                                                    |
| +----------------------------------------------------------------+ |
| | The study investigates...                                      | |
| +----------------------------------------------------------------+ |
|                                                                    |
| #002  Section 1                                                    |
| +----------------------------------------------------------------+ |
| | Previous research demonstrates...                              | |
| +----------------------------------------------------------------+ |
+--------------------------------------------------------------------+
```

---

# 6. Knowledge Base Ready State

```text
+--------------------------------------------------------------+
|                                                              |
|                    KNOWLEDGE BASE READY                      |
|                                                              |
|                         ● READY                              |
|                                                              |
|                 12 documents indexed                         |
|                 4,821 chunks available                        |
|                                                              |
|                    [ Start asking ]                           |
|                                                              |
+--------------------------------------------------------------+
```

---

# 7. Ask Page

The Ask page is the primary product experience.

```text
+--------------------------------------------------------------------+
| ◈ VoiceRAG                  Research Workspace       ● READY        |
+--------------------------------------------------------------------+
|                                                                    |
|                        ASK YOUR DOCUMENTS                           |
|                                                                    |
|                 +--------------------------------+                 |
|                 |                                |                 |
|                 |               ◉                |                 |
|                 |                                |                 |
|                 |            SPEAK NOW           |                 |
|                 |                                |                 |
|                 +--------------------------------+                 |
|                                                                    |
|              "Ask a question about your documents"                 |
|                                                                    |
| Documents: 12       Chunks: 4,821       Knowledge base: ● READY    |
|                                                                    |
+--------------------------------------------------------------------+
```

If no documents are ready, the microphone should not pretend to be usable:

```text
+--------------------------------------------------------------+
|                                                              |
|                    DOCUMENTS REQUIRED                        |
|                                                              |
| Add and index documents before asking questions.             |
|                                                              |
|                    [ Go to Documents ]                       |
|                                                              |
+--------------------------------------------------------------+
```

---

# 8. Voice Recording

State machine:

```text
IDLE
 |
 v
LISTENING
 |
 v
RECORDING
 |
 v
STOP
 |
 v
TRANSCRIBING
 |
 v
QUERY READY
```

Recording UI:

```text
+--------------------------------------------------------------+
|                                                              |
|                         LISTENING                            |
|                                                              |
|                    +--------------+                          |
|                 +--|      ◉       |--+                       |
|                /   |              |   \                      |
|                 +--|    00:03     |--+                       |
|                    +--------------+                          |
|                                                              |
|               ▁▂▃▅▇▆▅▃▂▃▆▇▅▃▂                               |
|                                                              |
|                   [ Stop recording ]                         |
|                                                              |
+--------------------------------------------------------------+
```

---

# 9. STT / Transcription

```text
+--------------------------------------------------------------+
|                                                              |
|                      TRANSCRIBING                            |
|                                                              |
|          "What are the main conclusions..."                  |
|                                                              |
|                         STT                                  |
|                         |                                    |
|                         +-- Provider: Hosted                  |
|                         +-- Latency: 42 ms                    |
|                         +-- Confidence: 0.96                  |
|                         +-- Fallback: Not used                |
|                                                              |
+--------------------------------------------------------------+
```

Fallback:

```text
PRIMARY STT
    |
    X
    |
    v
FALLBACK STT
    |
    v
TRANSCRIPTION
```

Show the real reason:

```text
STT fallback activated
Primary provider timeout: 800ms
Fallback provider: Local
Additional latency: +61ms
```

---

# 10. Query Analysis

```text
+--------------------------------------------------------------------+
| QUERY                                                               |
|                                                                    |
| "What are the main conclusions from the research paper?"            |
|                                                                    |
+--------------------------------------------------------------------+
| QUERY ANALYSIS                                                      |
|                                                                    |
| Complexity             MEDIUM                                      |
| Ambiguity              0.62                                        |
| Query type             Analytical                                  |
|                                                                    |
| RETRIEVAL PLAN                                                        |
| +-- Dense retrieval       ✓                                        |
| +-- BM25                  ✓                                        |
| +-- RRF                   ✓                                        |
| +-- Reranker              ✓ REQUIRED                               |
|                                                                    |
+--------------------------------------------------------------------+
```

Easy query example:

```text
QUERY ANALYSIS

Complexity             LOW
Evidence confidence    0.96

Retrieval plan
+-- Dense       ✓
+-- BM25        ✓
+-- RRF         ✓
+-- Reranker    SKIPPED

Reason:
High retrieval confidence and strong candidate agreement.
```

---

# 11. Live Pipeline / Run Screen

This is the signature VoiceRAG interface.

```text
+--------------------------------------------------------------------+
| RUN #00482                                  142 ms      ● COMPLETE  |
+--------------------------------------------------------------------+
|                                                                    |
|                         LIVE PIPELINE                              |
|                                                                    |
|                         +---------+                                |
|                         |   STT   |                                |
|                         |    ✓    |                                |
|                         |  42ms   |                                |
|                         +----+----+                                |
|                              |                                     |
|                              v                                     |
|                         +---------+                                |
|                         |  QUERY  |                                |
|                         |    ✓    |                                |
|                         |   3ms   |                                |
|                         +----+----+                                |
|                              |                                     |
|                     +--------+--------+                            |
|                     v                 v                            |
|                 +-------+         +-------+                        |
|                 | BM25  |         | Dense |                        |
|                 |   ✓   |         |   ✓   |                        |
|                 |  7ms  |         | 11ms  |                        |
|                 +---+---+         +---+---+                        |
|                     \                 /                             |
|                      +-------+-------+                              |
|                              v                                     |
|                         +---------+                                |
|                         |   RRF   |                                |
|                         |    ✓    |                                |
|                         |   1ms   |                                |
|                         +----+----+                                |
|                              |                                     |
|                              v                                     |
|                         +---------+                                |
|                         |RERANKER |                                |
|                         |    ✓    |                                |
|                         |  31ms   |                                |
|                         +----+----+                                |
|                              |                                     |
|                              v                                     |
|                         +---------+                                |
|                         |GUARDRAIL|                                |
|                         |    ✓    |                                |
|                         |   4ms   |                                |
|                         +----+----+                                |
|                              |                                     |
|                              v                                     |
|                         +---------+                                |
|                         |GENERATOR|                                |
|                         |    ✓    |                                |
|                         |  78ms   |                                |
|                         +----+----+                                |
|                              |                                     |
|                              v                                     |
|                          ANSWER ✓                                  |
|                                                                    |
+--------------------------------------------------------------------+
```

Nodes should animate only when the backend actually emits the corresponding event.

---

# 12. Retrieval Visualization

```text
+--------------------------------------------------------------------+
| RETRIEVAL                                                          |
|                                                                    |
|        BM25                         DENSE                          |
|                                                                    |
|   #12   0.91                  #42   0.94                           |
|   #42   0.87                  #18   0.91                           |
|   #18   0.81                  #77   0.88                           |
|   #91   0.76                  #12   0.83                           |
|                                                                    |
|               +---------------------+                              |
|               |         RRF         |                              |
|               +----------+----------+                              |
|                          |                                           |
|                          v                                           |
|                                                                    |
| FINAL CANDIDATES                                                    |
|                                                                    |
| 1    chunk_042                  0.94                               |
| 2    chunk_018                  0.89                               |
| 3    chunk_012                  0.86                               |
| 4    chunk_077                  0.81                               |
|                                                                    |
+--------------------------------------------------------------------+
```

Clicking a candidate should reveal the chunk and its source document.

---

# 13. Reranker Decision

Enabled:

```text
+--------------------------------------------------------------+
| RERANKER                                                     |
|                                                              |
| Decision: ENABLED                                            |
|                                                              |
| Query complexity          MEDIUM                             |
| Dense/BM25 agreement      LOW                                |
| Top score margin          0.04                               |
| Evidence confidence       0.68                               |
|                                                              |
| 8 candidates -> 4 candidates                                |
|                                                              |
| Latency: 31ms                                                |
+--------------------------------------------------------------+
```

Skipped:

```text
+--------------------------------------------------------------+
| RERANKER                                                     |
|                                                              |
| Decision: SKIPPED                                            |
|                                                              |
| Reason:                                                      |
| High retrieval confidence.                                   |
| Dense and sparse retrieval agree strongly.                   |
|                                                              |
| Saved latency: ~31ms                                         |
+--------------------------------------------------------------+
```

---

# 14. Guardrail

Pass:

```text
+--------------------------------------------------------------+
| GUARDRAIL                                                    |
|                                                              |
|                         ✓ PASS                               |
|                                                              |
| Evidence coverage       0.94                                 |
| Retrieval confidence    0.91                                 |
| Contradiction score     0.03                                 |
| Answerability           HIGH                                 |
|                                                              |
| Decision: ANSWER                                             |
+--------------------------------------------------------------+
```

Abstention:

```text
+--------------------------------------------------------------+
|                                                              |
|                     CANNOT VERIFY                            |
|                                                              |
| I found related information, but the available evidence      |
| is not strong enough to answer this question confidently.    |
|                                                              |
| Evidence confidence      0.31                                |
| Required threshold       0.72                                |
|                                                              |
| Decision                  ABSTAIN                             |
|                                                              |
|              [ Show retrieved evidence ]                     |
|                                                              |
+--------------------------------------------------------------+
```

Abstention is a successful safety decision, not a generic error.

---

# 15. Answer + Evidence

```text
+--------------------------------------------------------------------+
| ANSWER                                                             |
|                                                                    |
| The study identifies three major conclusions. First, ...           |
|                                                                    |
| Second, the results indicate that ...                              |
|                                                                    |
| Finally, the authors conclude that ...                             |
|                                                                    |
| ------------------------------------------------------------------ |
|                                                                    |
| GROUNDED ✓        CONFIDENCE 0.94          142ms                   |
|                                                                    |
+--------------------------------------------------------------------+
| EVIDENCE                                                           |
|                                                                    |
| [1] research-paper.pdf · Page 12 · Score 0.94                      |
| +----------------------------------------------------------------+ |
| | "...the results demonstrate..."                                | |
| +----------------------------------------------------------------+ |
|                                                                    |
| [2] research-paper.pdf · Page 13 · Score 0.89                      |
| +----------------------------------------------------------------+ |
| | "...the findings suggest..."                                    | |
| +----------------------------------------------------------------+ |
+--------------------------------------------------------------------+
```

---

# 16. Evidence / Document Viewer

Clicking a citation:

```text
+--------------------------------------------------------------------+
| <- Answer                     research-paper.pdf                   |
+--------------------------------------+-----------------------------+
|                                      |                             |
| ANSWER                               | DOCUMENT                    |
|                                      |                             |
| The study concludes that... [1]     | Page 12                    |
|                                      |                             |
|                                      | +-------------------------+ |
|                                      | |                         | |
|                                      | |      Research Paper     | |
|                                      | |                         | |
|                                      | |  ...                    | |
|                                      | |                         | |
|                                      | |  [ HIGHLIGHTED TEXT ]   | |
|                                      | |                         | |
|                                      | +-------------------------+ |
|                                      |                             |
+--------------------------------------+-----------------------------+
```

The exact supporting passage should be highlighted.

---

# 17. Runs Page

Every query becomes a traceable run.

```text
+--------------------------------------------------------------------+
| RUNS                                                               |
+--------------------------------------------------------------------+
|                                                                    |
| RUN       QUERY                         STATUS       LATENCY         |
|                                                                    |
| #00482    What are the conclusions?    ● Complete    142ms         |
| #00481    Explain the methodology      ● Complete    127ms         |
| #00480    What is the sample size?    ● Complete     98ms         |
| #00479    Does the paper mention X?   ● Abstained    121ms         |
|                                                                    |
+--------------------------------------------------------------------+
```

---

# 18. Run Details

```text
+--------------------------------------------------------------------+
| RUN #00482                                                         |
|                                                                    |
| Query                                                               |
| "What are the main conclusions?"                                   |
|                                                                    |
| Total latency                     142ms                            |
| STT                                42ms                            |
| Query analysis                     3ms                             |
| BM25                               7ms                             |
| Dense                             11ms                             |
| RRF                                1ms                             |
| Reranker                          31ms                             |
| Guardrail                          4ms                             |
| Generation                        78ms                             |
|                                                                    |
| RETRIEVAL                                                          |
| Candidates                         16                              |
| After RRF                           8                              |
| After reranking                     4                              |
|                                                                    |
| GUARDRAIL                                                          |
| Decision                           PASS                            |
|                                                                    |
+--------------------------------------------------------------------+
```

---

# 19. Benchmarks Page

This page exposes measured engineering performance.

```text
+--------------------------------------------------------------------+
| BENCHMARKS                                                         |
+--------------------------------------------------------------------+
|                                                                    |
| Dataset             VoiceRAG-Bench v1                              |
| Queries             500                                            |
| Hardware            <actual hardware>                              |
| Commit              <actual git commit>                            |
|                                                                    |
| PIPELINE LATENCY                                                     |
|                                                                    |
| P50        P70        P95        P99                                |
| <real>     <real>     <real>     <real>                            |
|                                                                    |
| STAGE LATENCY                                                       |
|                                                                    |
| STT             ███████████████                 <real>ms            |
| Query           ██                              <real>ms            |
| BM25            ███                             <real>ms            |
| Dense           █████                           <real>ms            |
| RRF             █                               <real>ms            |
| Reranker        ███████████                     <real>ms            |
| Generation      █████████████████████           <real>ms            |
|                                                                    |
| RETRIEVAL QUALITY                                                   |
|                                                                    |
| Recall@5                         <real>                              |
| Recall@10                        <real>                              |
| MRR                               <real>                              |
| nDCG                              <real>                              |
|                                                                    |
| ANSWER QUALITY                                                     |
|                                                                    |
| Groundedness                     <real>                              |
| Correctness                      <real>                              |
| Abstention precision             <real>                              |
|                                                                    |
+--------------------------------------------------------------------+
```

**Never hard-code or fake benchmark values in the UI.**

---

# 20. Experiment Comparison

```text
+--------------------------------------------------------------------+
| EXPERIMENT COMPARISON                                              |
+--------------------------------------------------------------------+
|                                                                    |
|                    Baseline      Semantic       Hybrid             |
|                                                                    |
| Recall@10           <real>        <real>         <real>             |
| MRR                 <real>        <real>         <real>             |
| P50                 <real>        <real>         <real>             |
| P95                 <real>        <real>         <real>             |
|                                                                    |
+--------------------------------------------------------------------+
```

Experiments can compare:

```text
Chunking
Retrieval
Reranking
STT
Embedding models
Prompt versions
Guardrail thresholds
```

---

# 21. Architecture Page

```text
+--------------------------------------------------------------------+
| ARCHITECTURE                                                        |
+--------------------------------------------------------------------+
|                                                                    |
|                         USER                                       |
|                           |                                        |
|                           v                                        |
|                          STT                                       |
|                           |                                        |
|                           v                                        |
|                    QUERY ANALYSIS                                  |
|                           |                                        |
|                  +--------+--------+                               |
|                  v                 v                               |
|                BM25              DENSE                             |
|                  |                 |                               |
|                  +--------+--------+                               |
|                           v                                        |
|                          RRF                                       |
|                           |                                        |
|                           v                                        |
|                       RERANKER                                     |
|                           |                                        |
|                           v                                        |
|                       GUARDRAIL                                    |
|                           |                                        |
|                           v                                        |
|                       GENERATOR                                    |
|                           |                                        |
|                           v                                        |
|                    GROUNDED ANSWER                                 |
|                                                                    |
+--------------------------------------------------------------------+
```

Each component should be clickable and expose:

```text
Purpose
Model
Inputs
Outputs
Latency
Fallback
Failure behavior
Benchmark results
```

---

# 22. Settings Page

```text
+--------------------------------------------------------------------+
| SETTINGS                                                            |
+--------------------------------------------------------------------+
|                                                                    |
| VOICE                                                               |
| STT Provider                 [ Hosted v ]                          |
| Fallback                     [ Local v ]                           |
|                                                                    |
| RETRIEVAL                                                           |
| Dense top-k                  [ 10 ]                                |
| Sparse top-k                 [ 10 ]                                |
| RRF k                        [ 60 ]                                |
|                                                                    |
| RERANKING                                                           |
| Mode                         [ Adaptive v ]                        |
| Threshold                    [ 0.72 ]                              |
|                                                                    |
| GUARDRAILS                                                          |
| Abstention threshold         [ 0.72 ]                              |
|                                                                    |
| GENERATION                                                          |
| Model                        [ configured model v ]                 |
| Temperature                 [ 0.0 ]                                |
|                                                                    |
|                    [ Save configuration ]                           |
+--------------------------------------------------------------------+
```

---

# 23. System Health

Top navigation:

```text
● READY
```

Click:

```text
+--------------------------------------+
| SYSTEM STATUS                        |
|                                      |
| API                 ● Healthy        |
| Vector DB           ● Healthy        |
| STT                 ● Healthy        |
| Embeddings          ● Healthy        |
| Reranker            ● Healthy        |
| Generator           ● Healthy        |
|                                      |
| Last checked: 2 sec ago              |
+--------------------------------------+
```

Degraded:

```text
● DEGRADED

STT primary          X unavailable
STT fallback         ● available

System will continue using fallback.
```

---

# 24. Error States

Document processing:

```text
+--------------------------------------------------------------+
| DOCUMENT PROCESSING FAILED                                   |
|                                                              |
| research-paper.pdf                                           |
|                                                              |
| Stage: Text extraction                                      |
| Reason: <actual error>                                      |
|                                                              |
| [ Retry ]                    [ Remove document ]             |
+--------------------------------------------------------------+
```

Retrieval:

```text
RETRIEVAL FAILED

Vector database unavailable.

Retrying...
Attempt 2 / 3

[ Retry now ]
```

Generation:

```text
GENERATION FAILED

Retrieved evidence is available, but generation did not
complete successfully.

[ Retry generation ]
[ View evidence ]
```

---

# 25. Empty States

No documents:

```text
+--------------------------------------------------------------+
|                                                              |
|                    NO DOCUMENTS YET                          |
|                                                              |
| Add documents to create your knowledge base.                 |
|                                                              |
|                    [ Add documents ]                         |
|                                                              |
+--------------------------------------------------------------+
```

Documents processing:

```text
Knowledge base is being prepared.

8 / 12 documents ready.

[ View processing ]
```

---

# 26. Mobile

On mobile, collapse the detailed graph into a vertical pipeline:

```text
STT
 |
 v
QUERY
 |
 v
RETRIEVAL
 |
 v
RERANK
 |
 v
GUARD
 |
 v
ANSWER
```

Each stage becomes expandable:

```text
+------------------------------+
| Retrieval              v     |
+------------------------------+
| BM25                  7ms     |
| Dense                11ms     |
| RRF                   1ms     |
+------------------------------+
```

---

# 27. Visual Language

The design should be restrained and technical.

```text
Primary UI       clean sans-serif
Metrics          monospace
Background       neutral
Surfaces         subtle elevation
Borders          subtle
Success          green
Warning          amber
Error            red
Active           one primary accent
```

Avoid making every pipeline stage a different bright color.

Use state indicators:

```text
○ Waiting
◉ Running
✓ Complete
! Warning
X Failed
⊘ Skipped
```

---

# 28. Frontend Technical Structure

Recommended stack:

```text
Next.js
 |
 +-- TypeScript
 +-- Tailwind CSS
 +-- shadcn/ui
 +-- React Flow
 |      |
 |      +-- live pipeline visualization
 |
 +-- Recharts
 |      |
 |      +-- benchmark charts
 |
 +-- Framer Motion
 |      |
 |      +-- state transitions
 |
 +-- WebSocket / SSE
        |
        +-- live backend pipeline events
```

Frontend structure:

```text
frontend/
|
+-- app/
|   +-- page.tsx
|   +-- workspace/page.tsx
|   +-- documents/page.tsx
|   +-- documents/[documentId]/page.tsx
|   +-- ask/page.tsx
|   +-- runs/page.tsx
|   +-- runs/[runId]/page.tsx
|   +-- benchmarks/page.tsx
|   +-- experiments/page.tsx
|   +-- architecture/page.tsx
|   +-- settings/page.tsx
|
+-- components/
|   +-- documents/
|   +-- voice/
|   +-- pipeline/
|   +-- retrieval/
|   +-- reranking/
|   +-- guardrails/
|   +-- answer/
|   +-- benchmarks/
|   +-- layout/
|
+-- hooks/
|   +-- useVoiceRecorder.ts
|   +-- usePipelineEvents.ts
|   +-- useDocuments.ts
|   +-- useRuns.ts
|   +-- useBenchmarks.ts
|
+-- lib/
|   +-- api.ts
|   +-- websocket.ts
|   +-- types.ts
|
+-- styles/
```

---

# 29. Backend-to-Frontend Event Contract

The frontend should render real pipeline events:

```text
RUN_STARTED
    |
    v
STT_STARTED
    |
    v
STT_COMPLETED
    |
    v
QUERY_ANALYSIS_COMPLETED
    |
    v
DENSE_RETRIEVAL_STARTED
    |
    v
DENSE_RETRIEVAL_COMPLETED
    |
    v
SPARSE_RETRIEVAL_STARTED
    |
    v
SPARSE_RETRIEVAL_COMPLETED
    |
    v
RRF_COMPLETED
    |
    v
RERANKER_DECISION
    |
    v
RERANKING_COMPLETED
    |
    v
GUARDRAIL_COMPLETED
    |
    v
GENERATION_STARTED
    |
    v
GENERATION_COMPLETED
    |
    v
ANSWER_VERIFICATION_COMPLETED
    |
    v
RUN_COMPLETED
```

Do not create fake "AI is thinking" animations disconnected from backend state.

---

# 30. Complete User Journey

```text
                    +-------------+
                    |   LANDING   |
                    +------+------+
                           |
                           v
                  +-----------------+
                  | CREATE WORKSPACE|
                  +--------+--------+
                           |
                           v
                  +-----------------+
                  |    DOCUMENTS    |
                  +--------+--------+
                           |
                           v
                     ADD DOCUMENTS
                           |
                           v
                       VALIDATE
                           |
                           v
                        PARSE
                           |
                           v
                       CHUNK
                           |
                           v
                     EMBEDDINGS
                           |
                           v
                    SPARSE INDEX
                           |
                           v
                    VECTOR INDEX
                           |
                           v
                    KNOWLEDGE BASE
                         READY
                           |
                           v
                     +---------+
                     |   ASK   |
                     +----+----+
                          |
                          v
                        SPEAK
                          |
                          v
                         STT
                          |
                          v
                   QUERY ANALYSIS
                          |
                 +--------+--------+
                 v                 v
               BM25              DENSE
                 |                 |
                 +--------+--------+
                          |
                          v
                         RRF
                          |
                          v
                    RERANKER?
                          |
                          v
                      GUARDRAIL
                     /                             v           v
                 ANSWER      ABSTAIN
                    |
                    v
                 EVIDENCE
                    |
                    v
                  TRACE
                    |
                    v
                BENCHMARK
```

---

# 31. Primary Product Visual

The final experience should converge toward:

```text
                              VOICERAG

        +-----------------------------------------------+
        |                                               |
        |              🎙 ASK YOUR DOCS                 |
        |                                               |
        |       "What does the paper conclude?"         |
        |                                               |
        +-----------------------+-----------------------+
                                |
                                v
                              STT ✓
                             42 ms
                                |
                                v
                         QUERY: MEDIUM
                                |
                    +-----------+-----------+
                    v                       v
                 BM25 ✓                  DENSE ✓
                  7ms                     11ms
                    |                       |
                    +-----------+-----------+
                                |
                                v
                              RRF ✓
                               1ms
                                |
                                v
                           RERANKER ✓
                              31ms
                                |
                                v
                           GUARDRAIL ✓
                               4ms
                                |
                                v
                           GENERATION ✓
                              78ms
                                |
                                v
                    +----------------------+
                    |        ANSWER        |
                    |                      |
                    | The study...         |
                    |                      |
                    | [1] [2] [3]          |
                    +----------+-----------+
                               |
                               v
                           EVIDENCE
                               |
                    +----------+----------+
                    v                     v
                paper.pdf             report.pdf
                  p.12                   p.04

                         TOTAL: 142ms
                         GROUNDED: ✓
```

---

# 32. Implementation Order

Do not build all pages at once.

```text
PHASE 1
|
+-- App shell
+-- Navigation
+-- Workspace
+-- Documents
|
v
PHASE 2
|
+-- Upload
+-- Processing state
+-- Knowledge base status
+-- Document details
|
v
PHASE 3
|
+-- Voice recorder
+-- Waveform
+-- STT result
+-- Ask page
|
v
PHASE 4
|
+-- Live pipeline
+-- Retrieval visualization
+-- Reranker decision
+-- Guardrail decision
|
v
PHASE 5
|
+-- Answer
+-- Citations
+-- Evidence viewer
+-- Abstention
|
v
PHASE 6
|
+-- Runs
+-- Run details
+-- Pipeline traces
|
v
PHASE 7
|
+-- Benchmarks
+-- Experiments
+-- Architecture
|
v
PHASE 8
|
+-- Responsive polish
+-- Animations
+-- Accessibility
+-- Performance
```

---

# 33. What Not to Build

Avoid:

```text
X Generic ChatGPT clone
X Generic "Chat with PDF" layout
X Fake benchmark numbers
X Fake latency counters
X Fake retrieval scores
X Fake pipeline progress
X Decorative 3D graphics
X Unnecessary micro-interactions
X Complex authentication before the core flow works
X Billing / multi-tenancy before the core product works
```

The UI should expose **real system state**.

---

# 34. Frontend Definition of Done

A user should be able to:

```text
✓ Create a workspace
✓ Upload documents
✓ See document processing
✓ See when the knowledge base is ready
✓ Ask using real voice input
✓ See the actual transcription
✓ See dense + sparse retrieval
✓ See RRF
✓ See whether reranking happened and why
✓ See guardrail status
✓ Receive a grounded answer
✓ See citations
✓ Inspect source evidence
✓ See abstention when evidence is insufficient
✓ Inspect stage latency
✓ Inspect previous runs
✓ View benchmark results
✓ Compare experiments
✓ Understand the architecture
```

The core product message is:

```text
YOUR DOCUMENTS
       |
       v
VOICE QUERY
       |
       v
ENGINEERED RAG
       |
       v
GROUNDED ANSWER
       |
       v
PROVABLE EVIDENCE
```

That is the frontend experience VoiceRAG should implement.
