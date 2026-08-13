"""Document ingestion script."""

from __future__ import annotations

import argparse
import logging
from pathlib import Path

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def main(data_dir: str, strategy: str = "fixed") -> None:
    """Ingest documents from a directory."""
    logger.info("Ingesting from %s with strategy %s", data_dir, strategy)
    # TODO: wire up loader → parser → chunker → indexer
    logger.info("Ingestion complete (placeholder)")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Ingest documents into VoiceRAG")
    parser.add_argument("--data-dir", default="data/raw", help="Directory with raw documents")
    parser.add_argument("--strategy", default="fixed", help="Chunking strategy")
    args = parser.parse_args()
    main(args.data_dir, args.strategy)
