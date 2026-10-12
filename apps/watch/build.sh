#!/usr/bin/env bash
# digiVoice watch — evidence build.
# 1) typecheck + emit a real arm64 watchOS dynamic library (Apple watchOS 11.5 SDK)
# 2) compile the same SwiftUI sources for macOS and render every state to PNG
set -euo pipefail
cd "$(dirname "$0")"

echo "== watchOS compile (arm64, watchos11.5-simulator SDK) =="
xcrun -sdk watchsimulator swiftc -typecheck \
  -target arm64-apple-watchos11.5-simulator Sources/*.swift
xcrun -sdk watchsimulator swiftc -emit-library -parse-as-library \
  -target arm64-apple-watchos11.5-simulator \
  -module-name digiVoiceWatch -o Renders/libdigivoice-watchos.dylib Sources/*.swift
file Renders/libdigivoice-watchos.dylib

echo "== render (same sources, macOS host) =="
swiftc -O -o /tmp/dv-render Sources/WatchViews.swift Sources/RenderMain.swift
/tmp/dv-render "$PWD/Renders"
ls -la Renders/
