#!/usr/bin/env bash
# Post-export: make the web build installable on iOS/Android (PWA + A2HS).
# Run after `npx expo export --platform web`, before `vercel --prod`.
set -euo pipefail
cd "$(dirname "$0")/.."

HTML=dist/index.html
[ -f "$HTML" ] || { echo "run expo export first"; exit 1; }

# inject PWA + iOS Add-to-Home-Screen tags before </head>
python3 - "$HTML" <<'PY'
import re, sys
p = sys.argv[1]
html = open(p).read()
tags = '''
    <meta name="theme-color" content="#E60023" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="digiVoice" />
    <link rel="manifest" href="/manifest.json" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
'''
if 'apple-touch-icon' not in html:
    html = html.replace('</head>', tags + '  </head>')
open(p, 'w').write(html)
PY

echo "PWA tags injected into $HTML"
