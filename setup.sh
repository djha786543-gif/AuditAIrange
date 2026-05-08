#!/usr/bin/env bash
set -e

printf '\n[AuditAI Range] Setup helper starting...\n'

if [ -z "$(command -v docker)" ]; then
  echo "ERROR: Docker is not installed or not on PATH." >&2
  exit 1
fi

if [ -z "$(command -v python3)" ] && [ -z "$(command -v python)" ]; then
  echo "ERROR: Python 3 is not installed or not on PATH." >&2
  exit 1
fi

if [ -z "$(command -v npm)" ]; then
  echo "WARNING: npm not found. Promptfoo install step will be skipped."
fi

printf '\nCreating evidence folders...\n'
mkdir -p 07_evidence/wp-{01..15} 07_evidence/wp-cap

printf '\nValidating docker-compose.yml...\n'
if [ ! -f docker-compose.yml ]; then
  echo 'ERROR: docker-compose.yml is missing in the repo root.' >&2
  exit 1
fi

docker compose config > /dev/null
printf 'docker-compose.yml is valid.\n'

printf '\nSetup helper complete. To start the lab, run:\n  docker compose up -d\n'
