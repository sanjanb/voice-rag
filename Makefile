.PHONY: install dev test lint type-check run docker-up docker-down ingest benchmark smoke

install:
	pip install -e .

dev:
	pip install -e ".[dev]"

test:
	pytest tests/ -v --tb=short

test-unit:
	pytest tests/unit/ -v

test-integration:
	pytest tests/integration/ -v

test-e2e:
	pytest tests/e2e/ -v

lint:
	ruff check app/ tests/

type-check:
	mypy app/

run:
	uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

ingest:
	python scripts/ingest.py

benchmark:
	python scripts/benchmark.py

smoke:
	python scripts/smoke_test.py

docker-up:
	docker compose -f docker/docker-compose.yml up -d

docker-down:
	docker compose -f docker/docker-compose.yml down

format:
	ruff format app/ tests/
