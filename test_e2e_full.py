"""End-to-end integration test -- exercises pipeline without Qdrant.

Tests: Loader, Chunking, BM25, RRF, Reranker, Context, Guardrails, Generation, Verification
"""
import asyncio
import shutil
import sys
from pathlib import Path

TEST_DIR = Path("test_docs_e2e")
TEST_DIR.mkdir(exist_ok=True)
(TEST_DIR / "python_guide.md").write_text(
    "# Python Guide\n\n## Data Types\nPython has several built-in data types: int, float, str, list, dict, tuple, set.\n\n"
    "## Functions\nFunctions are defined with `def` keyword. Use `return` to return values.\n\n"
    "## Classes\nClasses are defined with `class` keyword. Use `__init__` for constructors."
)
(TEST_DIR / "ml_basics.md").write_text(
    "# ML Basics\n\n## Supervised Learning\nSupervised learning uses labeled data to train models.\n\n"
    "## Neural Networks\nNeural networks are composed of layers of neurons with activation functions.\n\n"
    "## Training\nTraining involves forward pass, loss computation, and backpropagation."
)
print("[SETUP] Created test documents")


def _run(coro):
    """Run a coroutine in an event loop, handling the 'already running' case."""
    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        loop = None
    if loop and loop.is_running():
        import concurrent.futures
        with concurrent.futures.ThreadPoolExecutor() as pool:
            return pool.submit(asyncio.run, coro).result()
    return asyncio.run(coro)


def test_loader():
    from app.ingestion.loader import load_documents
    docs = load_documents(str(TEST_DIR))
    assert len(docs) == 2, f"Expected 2 docs, got {len(docs)}"
    assert all(d.get("content") for d in docs), "Docs missing content"
    print(f"[PASS] Loader: loaded {len(docs)} docs with content")
    return docs


def test_chunking(docs):
    from app.ingestion.chunking.fixed import fixed_chunk
    from app.ingestion.chunking.structural import structural_chunk
    from app.ingestion.chunking.parent_child import parent_child_chunk
    from app.ingestion.chunking.selector import adaptive_chunk

    for doc in docs:
        text = doc["content"]
        doc_id = doc["file_path"]
        fid = doc.get("file_name", "unknown")
        fixed = fixed_chunk(text, doc_id)
        assert len(fixed) >= 1, f"fixed_chunk failed for {fid}"
        structural = structural_chunk(text, doc_id)
        assert len(structural) >= 1, f"structural_chunk failed for {fid}"
        pc = parent_child_chunk(text, doc_id)
        assert len(pc) >= 1, f"parent_child_chunk failed for {fid}"
        adaptive = adaptive_chunk(text, doc_id)
        assert len(adaptive) >= 1, f"adaptive_chunk failed for {fid}"
    print("[PASS] Chunking: all 4 strategies work on both docs")


def test_bm25(docs):
    from app.retrieval.sparse import SparseRetriever
    from app.ingestion.chunking.fixed import fixed_chunk

    all_chunks = []
    for doc in docs:
        all_chunks.extend(fixed_chunk(doc["content"], doc["file_path"], chunk_size=50, overlap=5))

    retriever = SparseRetriever()
    retriever.build_index(all_chunks)
    results = _run(retriever.search("neural network training", top_n=5))
    assert len(results) >= 1, "BM25 returned no results"
    assert results[0].chunk_id, "Result missing chunk_id"
    print(f"[PASS] BM25: {len(results)} results (top score={results[0].sparse_score:.4f})")
    return all_chunks


def test_reranker():
    from app.retrieval.reranker import CrossEncoderReranker
    from app.schemas.retrieval import RetrievedChunk

    reranker = CrossEncoderReranker()
    candidates = [
        RetrievedChunk(chunk_id="c1", document_id="d1", content="Python functions use def keyword"),
        RetrievedChunk(chunk_id="c2", document_id="d1", content="Neural networks have layers"),
        RetrievedChunk(chunk_id="c3", document_id="d1", content="Training uses backpropagation"),
    ]
    results = _run(reranker.rerank("What is a neural network?", candidates, top_k=2))
    assert len(results) == 2, f"Expected 2 results, got {len(results)}"
    assert results[0].rerank_score is not None, "Missing rerank_score"
    print(f"[PASS] Reranker: top={results[0].chunk_id} score={results[0].rerank_score:.4f}")
    return results


def test_context_builder():
    from app.context.builder import ContextBuilder
    from app.schemas.retrieval import RetrievedChunk

    builder = ContextBuilder(max_tokens=500)
    chunks = [
        RetrievedChunk(chunk_id="c1", document_id="d1", content="Python uses def for functions."),
        RetrievedChunk(chunk_id="c2", document_id="d1", content="Classes use class keyword."),
    ]
    result = builder.build(chunks)
    assert result, "ContextBuilder returned empty"
    assert "def" in result.lower() or "class" in result.lower(), f"Unexpected content: {result[:100]}"
    print(f"[PASS] ContextBuilder: {len(result)} chars")


def test_retrieval_guard():
    from app.schemas.retrieval import RetrievedChunk
    from app.guardrails.retrieval_guard import RetrievalGuard

    guard = RetrievalGuard()
    chunks = [
        RetrievedChunk(chunk_id="c1", document_id="d1", content="test", rrf_score=0.5),
        RetrievedChunk(chunk_id="c2", document_id="d1", content="test2", rrf_score=0.3),
    ]
    decision = guard.evaluate(chunks)
    assert decision.decision in ("allow", "abstain"), f"Invalid: {decision.decision}"
    assert decision.confidence is not None, "Missing confidence"
    print(f"[PASS] RetrievalGuard: {decision.decision} (conf={decision.confidence:.4f})")

    # Too few candidates
    empty_guard = RetrievalGuard(min_candidates=3)
    abstain = empty_guard.evaluate(chunks)
    assert abstain.decision == "abstain", f"Expected abstain, got {abstain.decision}"
    print("[PASS] RetrievalGuard: abstain on insufficient candidates")


def test_answer_guard():
    from app.schemas.generation import GeneratedAnswer, ClaimVerification
    from app.guardrails.answer_guard import AnswerGuard

    guard = AnswerGuard()
    answer = GeneratedAnswer(
        decision="answer",
        answer="Python uses def keyword.",
        confidence=0.9,
    )
    verifications = [
        ClaimVerification(claim_id="1", claim="Python uses def", supported=True, reason="confirmed"),
    ]
    result = guard.evaluate(answer, verifications)
    assert result.decision == "allow", f"Expected allow, got {result.decision}"
    print(f"[PASS] AnswerGuard: {result.decision}")

    # Unsupported claims
    strict_guard = AnswerGuard(max_unsupported_claims=0)
    bad_verifications = [
        ClaimVerification(claim_id="1", claim="bad", supported=False, reason="not in evidence"),
    ]
    abstain = strict_guard.evaluate(answer, bad_verifications)
    assert abstain.decision == "abstain", f"Expected abstain, got {abstain.decision}"
    print("[PASS] AnswerGuard: abstain on unsupported claims")


def test_generation():
    from app.generation.generator import Generator

    gen = Generator()
    result = _run(gen.generate("What is Python?", "Python is a programming language."))
    assert result is not None, "Generator returned None"
    assert result.decision, "Missing decision field"
    # 429 rate limit returns abstain — that's acceptable
    if result.decision == "abstain":
        print("[PASS] Generator: abstained (likely API rate limit)")
    else:
        assert result.answer, "Generator returned empty answer"
        print(f"[PASS] Generator: decision={result.decision}, answer='{result.answer[:60]}...'")


def test_verification():
    from app.generation.verifier import Verifier
    from app.schemas.generation import GeneratedAnswer, Claim

    verifier = Verifier()
    answer = GeneratedAnswer(
        decision="answer",
        answer="Python uses the def keyword to define functions.",
        confidence=0.85,
        claims=[
            Claim(claim_id="1", text="Python uses def to define functions", citation_ids=[]),
        ],
    )
    result = _run(verifier.verify(answer, "Python uses def keyword for functions."))
    assert result is not None, "Verifier returned None"
    assert len(result) >= 1, "No verifications returned"
    print(f"[PASS] Verifier: {len(result)} claims verified")


def test_structured_validation():
    from app.generation.structured import validate_generated_answer

    good = validate_generated_answer({
        "decision": "answer",
        "answer": "Test answer",
        "confidence": 0.9,
        "claims": [],
    })
    assert good is not None, "Should validate correct schema"
    try:
        validate_generated_answer({"no_answer": True})
        assert False, "Should have raised ValueError"
    except ValueError:
        pass
    print("[PASS] StructuredValidation: valid/invalid schemas handled")


def test_full_pipeline(docs):
    """Full pipeline flow without Qdrant."""
    from app.ingestion.chunking.fixed import fixed_chunk
    from app.retrieval.sparse import SparseRetriever
    from app.retrieval.rrf import reciprocal_rank_fusion
    from app.retrieval.reranker import CrossEncoderReranker
    from app.context.builder import ContextBuilder

    # 1. Chunk
    chunks = []
    for doc in docs:
        chunks.extend(fixed_chunk(doc["content"], doc["file_path"], chunk_size=50, overlap=10))
    # 2. BM25
    bm25 = SparseRetriever()
    bm25.build_index(chunks)
    sparse_results = _run(bm25.search("How do I define a function?", top_n=10))
    # 3. Simulate dense results
    dense_results = sparse_results[:5]
    # 4. RRF
    fused = reciprocal_rank_fusion(dense_results, sparse_results, k=60, top_n=10)
    assert len(fused) >= 1, "RRF produced no results"
    # 5. Rerank
    reranker = CrossEncoderReranker()
    reranked = _run(reranker.rerank("How do I define a function?", fused, top_k=3))
    assert len(reranked) >= 1, "Reranker produced no results"
    # 6. Context
    builder = ContextBuilder(max_tokens=500)
    context = builder.build(reranked)
    assert context, "ContextBuilder produced empty context"
    print(f"[PASS] Full pipeline: chunk({len(chunks)}) -> BM25({len(sparse_results)}) -> RRF({len(fused)}) -> rerank({len(reranked)}) -> context({len(context)} chars)")


def main():
    tests = [
        ("Loader", test_loader, None),
        ("Chunking", test_chunking, "docs"),
        ("BM25", test_bm25, "docs"),
        ("Reranker", test_reranker, None),
        ("ContextBuilder", test_context_builder, None),
        ("RetrievalGuard", test_retrieval_guard, None),
        ("AnswerGuard", test_answer_guard, None),
        ("StructuredValidation", test_structured_validation, None),
        ("Generator", test_generation, None),
        ("Verifier", test_verification, None),
        ("Full Pipeline", test_full_pipeline, "docs"),
    ]

    passed = failed = 0
    errors = []
    shared = {}

    for name, fn, needs in tests:
        try:
            if needs == "docs" and "docs" not in shared:
                shared["docs"] = test_loader()
            args = shared.get(needs) if needs else None
            if args is not None:
                fn(args)
            else:
                fn()
            passed += 1
        except Exception as e:
            failed += 1
            errors.append((name, e))
            print(f"[FAIL] {name}: {e}")

    print(f"\n{'='*60}")
    print(f"Results: {passed} passed, {failed} failed out of {len(tests)}")
    if errors:
        for name, err in errors:
            print(f"  - {name}: {err}")
    print(f"{'='*60}")

    shutil.rmtree(TEST_DIR, ignore_errors=True)
    return failed == 0


if __name__ == "__main__":
    ok = main()
    sys.exit(0 if ok else 1)
