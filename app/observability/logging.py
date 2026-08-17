"""Structured logging setup."""

from __future__ import annotations

import json
import logging
import sys


class StructuredFormatter(logging.Formatter):
    """JSON structured log formatter."""

    def format(self, record: logging.LogRecord) -> str:
        log_entry = {
            "event": record.getMessage(),
            "level": record.levelname,
            "logger": record.name,
            "timestamp": self.formatTime(record),
        }
        if record.exc_info:
            log_entry["exception"] = self.formatException(record.exc_info)
        return json.dumps(log_entry)


def setup_logging(level: str = "INFO") -> None:
    """Configure structured logging."""
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(StructuredFormatter())

    root = logging.getLogger()
    if not root.handlers:
        root.addHandler(handler)
    root.setLevel(getattr(logging, level.upper(), logging.INFO))
