#!/usr/bin/env bash
# Renders the film in 150-frame chunks (retrying any that stall), then joins them and lays the score under.
set -u
cd "$(dirname "$0")/.."
mkdir -p out/parts
TOTAL=1620; STEP=150
for ((a=0; a<TOTAL; a+=STEP)); do
  b=$((a+STEP-1)); [ $b -ge $TOTAL ] && b=$((TOTAL-1)); part=$(printf "out/parts/p%04d.mp4" $a)
  [ -s "$part" ] && continue
  for try in 1 2 3; do
    echo "chunk $a-$b try $try"
    timeout 420 npx remotion render src/index.ts VoidPromo3 "$part" --frames=$a-$b --muted --codec=h264 --crf=16 --concurrency=3 --timeout=180000 --log=error && [ -s "$part" ] && break
    rm -f "$part"
  done
  [ -s "$part" ] || { echo "FAILED chunk $a"; exit 1; }
done
ls out/parts/p*.mp4 | sed "s/^/file '/; s/$/'/" | sed "s#file 'out/parts/#file '#" > out/parts/list.txt
ffmpeg -loglevel error -y -f concat -safe 0 -i out/parts/list.txt -i public/score.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -shortest -movflags +faststart out/voidui-promo-3-1080p.mp4
echo DONE
