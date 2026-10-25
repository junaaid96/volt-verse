#!/usr/bin/env bash
# Compiles every guide sketch with arduino-cli for the board it targets.
# Needs arduino-cli with the arduino:avr, esp32:esp32 and esp8266:esp8266 cores plus the guides' libraries.
#
# Usage: [OUT=dir] [JOBS=n] scripts/compile-sketches.sh [filter]   (filter = grep pattern on "<fqbn> <dir>")
set -uo pipefail

OUT=${OUT:-.sketch-check}
JOBS=${JOBS:-4}
FILTER=${1:-}

npx -y tsx scripts/extract-sketches.ts "$OUT" || exit 1
mkdir -p "$OUT/logs"

node -e 'for (const s of require(process.argv[1])) console.log(s.fqbn + " " + s.dir)' "$PWD/$OUT/manifest.json" \
  | grep -- "$FILTER" \
  | xargs -P "$JOBS" -L 1 sh -c '
      log="'"$OUT"'/logs/$(basename "$1").log"
      if arduino-cli compile --fqbn "$0" "$1" >"$log" 2>&1; then echo "PASS $(basename "$1")"; else echo "FAIL $(basename "$1")"; fi
    ' \
  | sort | tee "$OUT/results.txt"

FAILED=$(grep -c '^FAIL' "$OUT/results.txt")
echo "$FAILED failed — logs in $OUT/logs"
[ "$FAILED" -eq 0 ]
