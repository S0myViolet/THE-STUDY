#!/usr/bin/env bash
# Keeps a dev server alive at :3000 for QA. Idempotent.
cd "$(dirname "$0")/.."
if curl -sS -o /dev/null http://localhost:3000/api/ai/status 2>/dev/null; then echo "dev server already running"; exit 0; fi
nohup npx next dev -p 3000 > /tmp/the-study-dev.log 2>&1 &
for i in $(seq 1 40); do sleep 1; if curl -sS -o /dev/null http://localhost:3000/api/ai/status 2>/dev/null; then echo "dev server up"; exit 0; fi; done
echo "dev server failed to start"; tail -20 /tmp/the-study-dev.log; exit 1
