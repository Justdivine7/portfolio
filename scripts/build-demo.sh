#!/usr/bin/env bash
# Builds the Relay Flutter demo (demo/) to WebAssembly in assets/demo/.
# Usage: bash scripts/build-demo.sh        (from the repo root)
set -euo pipefail
root="$(cd "$(dirname "$0")/.." && pwd)"
out="$root/assets/demo"

cd "$root/demo"
flutter analyze
flutter test
# Still image for the hero, rendered from the real widget tree with real fonts.
FLUTTER_ROOT="${FLUTTER_ROOT:-$(dirname "$(dirname "$(readlink -f "$(command -v flutter)")")")}" \
  flutter test tool/poster_test.dart --update-goldens
python3 - "$root/demo/tool/poster.png" "$root/assets/relay-poster.webp" <<'PY'
import sys
from PIL import Image
Image.open(sys.argv[1]).convert('RGB').save(sys.argv[2], 'WEBP', quality=84, method=6)
PY
flutter build web --wasm --release \
  --base-href /assets/demo/ \
  --no-web-resources-cdn \
  -o "$out"

# Trim what a visitor never downloads.
rm -f "$out"/flutter_service_worker.js "$out"/version.json "$out"/.last_build_id
find "$out" -name '*.symbols' -delete
rm -f "$out"/canvaskit/wimp.*   # only used with the opt-in "wimp" renderer flag

echo "assets/demo: $(du -sh "$out" | cut -f1) on disk"
