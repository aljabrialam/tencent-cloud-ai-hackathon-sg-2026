#!/usr/bin/env bash
# Demo hooks — corrupt-draft, validator-timeout, velocity-reset, reseed.
# Usage: ./scripts/demo_hooks.sh <hook> [API_URL]
set -euo pipefail
HOOK="${1:?hook: corrupt|timeout|velocity|seed}"
API="${2:-http://localhost:8787}"
case "$HOOK" in
  corrupt)  curl -sf -X POST "$API/api/demo/corrupt-draft" -H 'x-demo: 1' ;;
  timeout)  curl -sf -X POST "$API/api/demo/validator-timeout" -H 'x-demo: 1' ;;
  velocity) curl -sf -X POST "$API/api/demo/reset-velocity" -H 'x-demo: 1' ;;
  seed)     curl -sf -X POST "$API/api/demo/seed" -H 'x-demo: 1' ;;
  *) echo "unknown hook $HOOK" >&2; exit 1 ;;
esac | python3 -m json.tool
