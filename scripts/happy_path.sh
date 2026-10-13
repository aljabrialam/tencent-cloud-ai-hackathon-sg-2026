#!/usr/bin/env bash
# [e2e] happy path: text → draft → clarify? → authorise → execute → ledger read-back
# Usage: ./scripts/happy_path.sh [API_URL]   (default http://localhost:8787)
set -euo pipefail
API="${1:-http://localhost:8787}"
SIG_NODE='const c=require("crypto");console.log(c.createHash("sha256").update(process.argv[1]+":"+process.argv[2]).digest("hex"))'

say(){ printf '\033[36m▸ %s\033[0m\n' "$*"; }
need(){ command -v "$1" >/dev/null || { echo "need $1"; exit 1; }; }
need curl; need node; need python3

say "health"
curl -sf "$API/health" | python3 -m json.tool

say "register device key"
curl -sf -X POST "$API/api/device/keys" -H 'content-type: application/json' \
  -d '{"publicKey":"devkey_demo_phone","deviceId":"demo-phone"}' | python3 -m json.tool

say "draft: send two hundred to mum, then buy DBS shares with half of what is left"
DRAFT=$(curl -sf -X POST "$API/api/drafts" -H 'content-type: application/json' \
  -d '{"text":"send two hundred to mum for groceries, then buy DBS shares with half of what is left"}')
echo "$DRAFT" | python3 -c "import json,sys; d=json.load(sys.stdin)['draft']; [print(f'  step{i+1}: {s[\"intent\"][\"kind\"]} S\${s[\"amountCents\"]/100:.2f} {s.get(\"formulaText\") or \"\"}') for i,s in enumerate(d['steps'])]; print(f'  status={d[\"status\"]} tier={d[\"policy\"][\"tier\"]} verdict={d[\"validation\"][\"verdict\"]}')"
ID=$(echo "$DRAFT" | python3 -c "import json,sys; print(json.load(sys.stdin)['draft']['id'])")
HASH=$(echo "$DRAFT" | python3 -c "import json,sys; print(json.load(sys.stdin)['draft']['hash'])")

say "authorise (mock signature over draft hash)"
SIG=$(node -e "$SIG_NODE" devkey_demo_phone "$HASH")
curl -sf -X POST "$API/api/drafts/$ID/authorise" -H 'content-type: application/json' \
  -d "{\"tier\":\"biometric\",\"method\":\"faceid\",\"signature\":\"$SIG\",\"deviceId\":\"demo-phone\"}" \
  | python3 -c "import json,sys; print('  status:', json.load(sys.stdin)['draft']['status'])"

say "execute via gateway"
curl -sf -X POST "$API/api/execute" -H 'content-type: application/json' \
  -d "{\"draftId\":\"$ID\"}" | python3 -c "
import json,sys
r=json.load(sys.stdin)['execution']
for s in r['results']: print(f'  step{s[\"stepIndex\"]+1}: {s[\"status\"]} ({s[\"ledgerRef\"]})')
print(f'  ledger read-back: S\${r[\"ledgerReadBack\"][\"balanceCents\"]/100:.2f}')"

say "unsigned execute on a fresh draft must 403"
D2=$(curl -sf -X POST "$API/api/drafts" -H 'content-type: application/json' -d '{"text":"send mum fifty dollars"}')
ID2=$(echo "$D2" | python3 -c "import json,sys; print(json.load(sys.stdin)['draft']['id'])")
CODE=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$API/api/execute" -H 'content-type: application/json' -d "{\"draftId\":\"$ID2\"}")
[ "$CODE" = "403" ] && echo "  ✓ unsigned → 403" || { echo "  ✗ expected 403, got $CODE"; exit 1; }

say "audit chain"
CONV=$(echo "$DRAFT" | python3 -c "import json,sys; print(json.load(sys.stdin)['draft']['conversationId'])")
curl -sf "$API/api/audit/$CONV" | python3 -c "import json,sys; r=json.load(sys.stdin); [print(f'  {e[\"seq\"]:>2} {e[\"stage\"]}') for e in r['entries']]; print('  chainOk:', r['chainOk'])"

say "voice path: audio + hint → transcribe → draft (FR-021)"
TR=$(curl -sf -X POST "$API/api/transcribe" -H 'content-type: application/json' \
  -d '{"audio":"QUJDREVGRw==","mime":"audio/webm","hint":"send mum fifty dollars","lang":"en"}')
echo "$TR" | python3 -c "import json,sys; r=json.load(sys.stdin); print(f'  asr → \"{r[\"text\"]}\" · transcriptId={r[\"transcriptId\"]}')"
TID=$(echo "$TR" | python3 -c "import json,sys; print(json.load(sys.stdin)['transcriptId'])")
curl -sf -X POST "$API/api/drafts" -H 'content-type: application/json' \
  -d "{\"transcriptId\":\"$TID\"}" | python3 -c "import json,sys; d=json.load(sys.stdin)['draft']; print(f'  draft by transcriptId → {d[\"status\"]} · {len(d[\"steps\"])} step(s)')"

say "multi-lang: zh + ms produce the same typed draft (FR-016)"
for pair in '转账两百给妈妈|zh' 'hantar dua ratus kepada ibu|ms'; do
  IFS='|' read -r txt lang <<< "$pair"
  curl -sf -X POST "$API/api/drafts" -H 'content-type: application/json' \
    -d "{\"text\":\"$txt\",\"lang\":\"$lang\"}" | python3 -c "
import json,sys
d=json.load(sys.stdin)['draft']
s=d['steps'][0]
assert s['payeeId']=='payee_mum' and s['amountCents']==20000, s
print(f'  $lang → transfer S\$200.00 → payee_mum ✓')"
done

say "happy path PASSED"
