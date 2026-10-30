#!/bin/sh
# Build a throw-away test copy of the PR #17 branch with the round-5 proto injected. The source repo is never modified.
# usage: tools/mkcopy.sh [/tmp/pr17c] [/tmp/r5site]   then: cd /tmp/r5site && python3 -m http.server 8881
SRC=${1:-/tmp/pr17c}; SITE=${2:-/tmp/r5site}; HERE=$(cd "$(dirname "$0")/.." && pwd)
rm -rf "$SITE/app" && mkdir -p "$SITE" && cp -r "$SRC" "$SITE/app" && rm -rf "$SITE/app/.git" && ln -sfn "$HERE" "$SITE/round5"
TAG='<link rel="stylesheet" href="/round5/proto/r5.css"><script type="module" src="/round5/proto/r5.mjs"></script></head>'
sed -i "s#</head>#$TAG#" "$SITE/app/index.html" "$SITE/app/table/index.html"
echo "open http://127.0.0.1:8881/round5/proto/index.html"
