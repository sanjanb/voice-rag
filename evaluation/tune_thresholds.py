"""Threshold tuning script — evaluates threshold combinations on benchmark dataset."""

from __future__ import annotations

import json
import random
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from evaluation.benchmark import run_benchmark, print_report


@dataclass
class ThresholdConfig:
    """Configuration for a threshold combination."""
    min_confidence: float | None
    reranker_difficulty_threshold: float
    max_unsupported_claims: int


def create_mock_pipeline(config: ThresholdConfig) -> callable:
    """Create a mock pipeline function that simulates behavior based on thresholds."""
    
    # Deterministic seed based on config for reproducibility
    seed = hash((config.min_confidence, config.reranker_difficulty_threshold, config.max_unsupported_claims))
    rng = random.Random(seed)
    
    # Pre-defined chunk pool for citations
    all_chunks = [
        "doc1_chunk1", "doc1_chunk2", "doc1_chunk3", "doc1_chunk4", "doc1_chunk5",
        "doc1_chunk6", "doc1_chunk7", "doc1_chunk8", "doc1_chunk9", "doc1_chunk10",
        "doc1_chunk11", "doc1_chunk14", "doc1_chunk16", "doc1_chunk18",
        "doc2_chunk1", "doc2_chunk3", "doc2_chunk5", "doc2_chunk6", "doc2_chunk8",
        "doc2_chunk9", "doc2_chunk11", "doc2_chunk12", "doc2_chunk14", "doc2_chunk15",
        "doc2_chunk18",
        "doc3_chunk1", "doc3_chunk2", "doc3_chunk3", "doc3_chunk4", "doc3_chunk6",
        "doc3_chunk7", "doc3_chunk8", "doc3_chunk9", "doc3_chunk10", "doc3_chunk11",
        "doc3_chunk12", "doc3_chunk13", "doc3_chunk14", "doc3_chunk15", "doc3_chunk16",
        "doc3_chunk17", "doc3_chunk19", "doc3_chunk20",
        "doc4_chunk2", "doc4_chunk5", "doc4_chunk8", "doc4_chunk11", "doc4_chunk13",
        "doc4_chunk18",
        "doc5_chunk2", "doc5_chunk7",
    ]
    
    def mock_pipeline(query: str) -> dict[str, Any]:
        """Mock pipeline that returns deterministic results based on thresholds."""
        start = time.perf_counter()
        
        # Simulate query analysis - difficulty based on query length and keywords
        word_count = len(query.split())
        has_comparison = any(w in query.lower() for w in ["compare", "versus", "vs", "difference", "better", "worse"])
        has_conditional = any(w in query.lower() for w in ["if", "when", "unless", "provided", "assuming"])
        has_multi_hop = any(w in query.lower() for w in ["and how", "along with", "in addition", "as well as", "combined with"])
        
        # Calculate difficulty score (simplified from classify_difficulty)
        difficulty_score = 0.0
        if "?" in query and query.count("?") > 1:
            difficulty_score += 0.2
        if has_comparison:
            difficulty_score += 0.15
        if has_conditional:
            difficulty_score += 0.1
        if has_multi_hop:
            difficulty_score += 0.15
        if word_count > 15:
            difficulty_score += 0.1
        if word_count < 5:
            difficulty_score += 0.3
        difficulty_score = min(difficulty_score, 1.0)
        
        # Determine if reranker would trigger
        use_reranker = (
            difficulty_score >= config.reranker_difficulty_threshold
        )
        
        # Simulate retrieval - return some relevant chunks
        # More chunks returned if reranker is used (better retrieval)
        num_candidates = rng.randint(3, 8) if use_reranker else rng.randint(1, 5)
        candidates = rng.sample(all_chunks, min(num_candidates, len(all_chunks)))
        
        # Simulate retrieval confidence
        retrieval_confidence = rng.uniform(0.2, 0.9)
        
        # Retrieval guard decision
        min_conf = config.min_confidence if config.min_confidence is not None else 0.0
        if retrieval_confidence < min_conf or len(candidates) < 1:
            decision = "abstain"
            answer = None
            citations = []
            claims = []
        else:
            # Generation decision based on max_unsupported_claims
            # Simulate some claims being unsupported
            num_claims = rng.randint(1, 4)
            unsupported = rng.randint(0, num_claims)
            
            if unsupported > config.max_unsupported_claims:
                decision = "abstain"
                answer = None
                citations = []
                claims = []
            else:
                decision = "answer"
                answer = f"Mock answer for: {query[:50]}"
                # Return some citations (subset of candidates) - as list of chunk IDs (strings)
                num_citations = min(rng.randint(1, 3), len(candidates))
                citation_chunks = rng.sample(candidates, num_citations)
                citations = citation_chunks  # list of strings
                # Claims as list of dicts with citation_ids
                claims = [
                    {"claim": f"Claim {i+1}", "citation_ids": [citation_chunks[i % len(citation_chunks)]]}
                    for i in range(num_claims)
                ]
        
        total_ms = (time.perf_counter() - start) * 1000 + rng.uniform(50, 200)
        
        return {
            "decision": decision,
            "answer": answer,
            "citations": citations,
            "metrics": {"total_ms": total_ms},
            "claims": claims,
        }
    
    return mock_pipeline


def main() -> None:
    """Run threshold tuning across the grid."""
    dataset_dir = "evaluation/datasets"
    
    # Grid of threshold combinations to test
    min_confidence_values = [0.1, 0.2, 0.3, 0.5]
    reranker_difficulty_threshold_values = [0.3, 0.4, 0.5]
    max_unsupported_claims_values = [0, 1]
    
    configs: list[ThresholdConfig] = []
    for mc in min_confidence_values:
        for rdt in reranker_difficulty_threshold_values:
            for muc in max_unsupported_claims_values:
                configs.append(ThresholdConfig(
                    min_confidence=mc,
                    reranker_difficulty_threshold=rdt,
                    max_unsupported_claims=muc,
                ))
    
    print(f"Testing {len(configs)} threshold combinations...")
    print("=" * 80)
    
    results: list[dict[str, Any]] = []
    
    for i, config in enumerate(configs):
        print(f"\n[{i+1}/{len(configs)}] Testing: min_conf={config.min_confidence}, "
              f"rerank_thresh={config.reranker_difficulty_threshold}, "
              f"max_unsupported={config.max_unsupported_claims}")
        
        pipeline_fn = create_mock_pipeline(config)
        benchmark_results = run_benchmark(dataset_dir, pipeline_fn)
        
        # Extract key metrics
        summary = benchmark_results.get("summary", {})
        retrieval = benchmark_results.get("retrieval", {})
        generation = benchmark_results.get("generation", {})
        guardrails = benchmark_results.get("guardrails", {})
        latency = benchmark_results.get("latency", {})
        
        result = {
            "config": {
                "min_confidence": config.min_confidence,
                "reranker_difficulty_threshold": config.reranker_difficulty_threshold,
                "max_unsupported_claims": config.max_unsupported_claims,
            },
            "metrics": {
                "answer_rate": summary.get("answer_rate", 0),
                "abstention_rate": summary.get("abstention_rate", 0),
                "error_rate": summary.get("error_rate", 0),
                "mean_recall@5": retrieval.get("mean_recall@5", 0),
                "mean_mrr": retrieval.get("mean_mrr", 0),
                "mean_ndcg@5": retrieval.get("mean_ndcg@5", 0),
                "mean_citation_precision": generation.get("mean_citation_precision", 0),
                "mean_citation_recall": generation.get("mean_citation_recall", 0),
                "mean_citation_coverage": generation.get("mean_citation_coverage", 0),
                "unsupported_answer_rate": guardrails.get("unsupported_answer_rate", 0),
                "false_abstention_rate": guardrails.get("false_abstention_rate", 0),
                "latency_p50": latency.get("p50", 0),
                "latency_p95": latency.get("p95", 0),
            }
        }
        results.append(result)
        
        # Print quick summary
        m = result["metrics"]
        print(f"  Answer: {m['answer_rate']:.1%} | Abstain: {m['abstention_rate']:.1%} | "
              f"R@5: {m['mean_recall@5']:.3f} | MRR: {m['mean_mrr']:.3f} | "
              f"Unsupported: {m['unsupported_answer_rate']:.3f} | FalseAbstain: {m['false_abstention_rate']:.3f} | "
              f"P50: {m['latency_p50']:.0f}ms")
    
    # Sort by a composite score (higher is better)
    # We want high answer rate, high recall, low unsupported, low false abstention
    def composite_score(r: dict[str, Any]) -> float:
        m = r["metrics"]
        return (
            m["answer_rate"] * 0.3
            + m["mean_recall@5"] * 0.2
            + m["mean_mrr"] * 0.15
            + (1 - m["unsupported_answer_rate"]) * 0.2
            + (1 - m["false_abstention_rate"]) * 0.15
        )
    
    results.sort(key=composite_score, reverse=True)
    
    # Print comparison table
    print("\n" + "=" * 80)
    print("THRESHOLD TUNING RESULTS (sorted by composite score)")
    print("=" * 80)
    print(f"{'Rank':<4} {'min_conf':<8} {'rerank_thresh':<14} {'max_unsupp':<11} "
          f"{'Ans%':<6} {'Abst%':<6} {'R@5':<6} {'MRR':<6} {'Unsupp%':<8} {'F-Abst%':<8} {'P50ms':<6}")
    print("-" * 80)
    
    for rank, r in enumerate(results, 1):
        c = r["config"]
        m = r["metrics"]
        print(f"{rank:<4} {c['min_confidence']:<8} {c['reranker_difficulty_threshold']:<14} "
              f"{c['max_unsupported_claims']:<11} "
              f"{m['answer_rate']:.1%}  {m['abstention_rate']:.1%}  "
              f"{m['mean_recall@5']:.3f}  {m['mean_mrr']:.3f}  "
              f"{m['unsupported_answer_rate']:.3f}    {m['false_abstention_rate']:.3f}    "
              f"{m['latency_p50']:.0f}")
    
    # Best config
    best = results[0]
    print("\n" + "=" * 80)
    print("BEST CONFIGURATION:")
    print(f"  min_confidence: {best['config']['min_confidence']}")
    print(f"  reranker_difficulty_threshold: {best['config']['reranker_difficulty_threshold']}")
    print(f"  max_unsupported_claims: {best['config']['max_unsupported_claims']}")
    print(f"  Composite score: {composite_score(best):.4f}")
    
    # Save results
    output_path = Path("evaluation/tuning_results.json")
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump({
            "best_config": best["config"],
            "best_score": composite_score(best),
            "all_results": results,
        }, f, indent=2)
    
    print(f"\nResults saved to {output_path}")


if __name__ == "__main__":
    main()