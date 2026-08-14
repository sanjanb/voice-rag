"""Benchmark runner — loads datasets, runs queries, computes metrics, reports."""

from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Any, Callable

from evaluation.retrieval_eval import recall_at_k, mrr, ndcg
from evaluation.generation_eval import citation_precision, citation_recall, citation_coverage
from evaluation.guardrail_eval import unsupported_answer_rate, false_abstention_rate
from evaluation.latency_eval import compute_latency_percentiles

logger = logging.getLogger(__name__)


def _load_jsonl(path: Path) -> list[dict]:
    """Load a JSONL file into a list of dicts."""
    records = []
    with open(path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                records.append(json.loads(line))
    return records


def run_benchmark(
    dataset_dir: str = "evaluation/datasets",
    pipeline_fn: Callable[[str], dict[str, Any]] | None = None,
    config: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Run the full benchmark suite.

    Args:
        dataset_dir: Path to directory containing queries.jsonl, retrieval_labels.jsonl, unanswerable.jsonl
        pipeline_fn: Callable that takes a query string and returns a response dict with
            keys: decision, answer, citations, metrics (dict with total_ms etc), claims
            If None, uses mock (all abstain).
        config: Optional configuration overrides.

    Returns:
        Aggregated benchmark results dict.
    """
    data_path = Path(dataset_dir)
    queries = _load_jsonl(data_path / "queries.jsonl")
    retrieval_labels = _load_jsonl(data_path / "retrieval_labels.jsonl")
    unanswerable = _load_jsonl(data_path / "unanswerable.jsonl")

    # Build lookup: query_id -> list of (chunk_id, relevance)
    label_map: dict[str, list[tuple[str, int]]] = {}
    for label in retrieval_labels:
        qid = label["query_id"]
        label_map.setdefault(qid, []).append((label["chunk_id"], label["relevance"]))

    unanswerable_ids = {q["id"] for q in unanswerable}
    answerable_ids = {q["id"] for q in queries if q.get("answerable", True)}

    logger.info("Running benchmark: %d queries (%d answerable, %d unanswerable)",
                len(queries), len(answerable_ids), len(unanswerable_ids))

    per_query: list[dict[str, Any]] = []
    latencies: list[float] = []
    decisions: list[dict[str, Any]] = []

    for query in queries:
        qid = query["id"]
        question = query["question"]
        relevant_chunks = query.get("relevant_chunks", [])
        is_answerable = query.get("answerable", True)

        try:
            if pipeline_fn is not None:
                response = pipeline_fn(question)
            else:
                response = {"decision": "abstain", "answer": None, "citations": [], "metrics": {}, "claims": []}

            decision = response.get("decision", "abstain")
            answer = response.get("answer")
            citations = response.get("citations", [])
            metrics = response.get("metrics", {})
            claims = response.get("claims", [])

            # Retrieval metrics — use relevant_chunks from query as ground truth
            retrieved_ids = citations if citations else []
            r_recall = recall_at_k(retrieved_ids, relevant_chunks, k=5)
            r_mrr = mrr(retrieved_ids, relevant_chunks)
            r_ndcg = ndcg(retrieved_ids, relevant_chunks, k=5)

            # Citation metrics
            valid_cites = [c[0] for c in label_map.get(qid, [])]
            c_precision = citation_precision(citations, valid_cites) if citations else 0.0
            c_recall = citation_recall(citations, relevant_chunks) if citations else 0.0

            # Citation coverage
            c_coverage = citation_coverage(claims, citations) if claims else 0.0

            # Latency
            total_ms = metrics.get("total_ms") if isinstance(metrics, dict) else None
            if total_ms is not None:
                latencies.append(total_ms)

            # Guardrail decision
            decisions.append({"id": qid, "decision": decision, "answerable": is_answerable})

            per_query.append({
                "id": qid,
                "question": question,
                "decision": decision,
                "recall@5": r_recall,
                "mrr": r_mrr,
                "ndcg@5": r_ndcg,
                "citation_precision": c_precision,
                "citation_recall": c_recall,
                "citation_coverage": c_coverage,
                "total_ms": total_ms,
            })

        except Exception as e:
            logger.warning("Query %s failed: %s", qid, e)
            decisions.append({"id": qid, "decision": "error", "answerable": is_answerable})
            per_query.append({
                "id": qid,
                "question": question,
                "decision": "error",
                "recall@5": 0.0,
                "mrr": 0.0,
                "ndcg@5": 0.0,
                "citation_precision": 0.0,
                "citation_recall": 0.0,
                "citation_coverage": 0.0,
                "total_ms": None,
            })

    # Aggregate
    n = len(per_query)
    mean = lambda vals: sum(vals) / len(vals) if vals else 0.0

    retrieval_agg = {
        "mean_recall@5": mean([q["recall@5"] for q in per_query]),
        "mean_mrr": mean([q["mrr"] for q in per_query]),
        "mean_ndcg@5": mean([q["ndcg@5"] for q in per_query]),
    }

    generation_agg = {
        "mean_citation_precision": mean([q["citation_precision"] for q in per_query]),
        "mean_citation_recall": mean([q["citation_recall"] for q in per_query]),
        "mean_citation_coverage": mean([q["citation_coverage"] for q in per_query]),
    }

    guardrail_agg = {
        "unsupported_answer_rate": unsupported_answer_rate(decisions, unanswerable_ids),
        "false_abstention_rate": false_abstention_rate(decisions, answerable_ids),
    }

    latency_agg = compute_latency_percentiles(latencies) if latencies else {}

    summary = {
        "total_queries": n,
        "answerable_count": len(answerable_ids),
        "unanswerable_count": len(unanswerable_ids),
        "answer_rate": sum(1 for d in decisions if d["decision"] == "answer") / n if n else 0.0,
        "abstention_rate": sum(1 for d in decisions if d["decision"] == "abstain") / n if n else 0.0,
        "error_rate": sum(1 for d in decisions if d["decision"] == "error") / n if n else 0.0,
    }

    return {
        "retrieval": retrieval_agg,
        "generation": generation_agg,
        "guardrails": guardrail_agg,
        "latency": latency_agg,
        "per_query": per_query,
        "summary": summary,
    }


def print_report(results: dict[str, Any]) -> None:
    """Pretty-print benchmark results to stdout."""
    print("\n" + "=" * 60)
    print("  BENCHMARK REPORT")
    print("=" * 60)

    summary = results.get("summary", {})
    print(f"\n  Queries: {summary.get('total_queries', 0)} total "
          f"({summary.get('answerable_count', 0)} answerable, "
          f"{summary.get('unanswerable_count', 0)} unanswerable)")
    print(f"  Answer rate: {summary.get('answer_rate', 0):.1%}")
    print(f"  Abstention rate: {summary.get('abstention_rate', 0):.1%}")
    print(f"  Error rate: {summary.get('error_rate', 0):.1%}")

    print("\n  --- Retrieval ---")
    for k, v in results.get("retrieval", {}).items():
        print(f"  {k}: {v:.4f}")

    print("\n  --- Generation ---")
    for k, v in results.get("generation", {}).items():
        print(f"  {k}: {v:.4f}")

    print("\n  --- Guardrails ---")
    for k, v in results.get("guardrails", {}).items():
        print(f"  {k}: {v:.4f}")

    lat = results.get("latency", {})
    if lat:
        print("\n  --- Latency (ms) ---")
        for k in ["p50", "p90", "p95", "p99", "mean"]:
            if k in lat:
                print(f"  {k}: {lat[k]:.1f}")

    print("\n  --- Per-Query ---")
    for q in results.get("per_query", []):
        status = "OK" if q["decision"] == "answer" else "--" if q["decision"] == "abstain" else "!!"
        lat_str = f"{q['total_ms']:.0f}ms" if q.get("total_ms") else "n/a"
        print(f"  {status} {q['id']}: R@5={q['recall@5']:.2f} "
              f"MRR={q['mrr']:.2f} nDCG={q['ndcg@5']:.2f} "
              f"CP={q['citation_precision']:.2f} CR={q['citation_recall']:.2f} "
              f"{lat_str}")

    print("\n" + "=" * 60)
