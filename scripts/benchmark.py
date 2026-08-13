"""Benchmark runner script."""

from __future__ import annotations

import argparse
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def main(dataset: str) -> None:
    """Run benchmarks on a dataset."""
    logger.info("Running benchmark on %s", dataset)
    # TODO: wire up evaluation framework
    logger.info("Benchmark complete (placeholder)")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run VoiceRAG benchmarks")
    parser.add_argument("--dataset", default="evaluation/datasets/queries.jsonl")
    args = parser.parse_args()
    main(args.dataset)
