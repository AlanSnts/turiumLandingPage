#!/bin/sh
# Turium — filme 3: monta os MP4 a partir dos quadros e do áudio.
# Uso (dentro de assets/motion): sh tools/encode.sh <pasta_quadros> [audio.wav]
# Saída: ../../assets/video/ (raiz do site) ou a pasta em $OUTDIR.
HERE=$(cd "$(dirname "$0")" && pwd)
F=${1:?pasta dos quadros}
A=${2:-$HERE/../assets/audio/mix-perdas.wav}
O=${OUTDIR:-$HERE/../../video}
mkdir -p "$O"
ffmpeg -y -hide_banner -loglevel error -framerate 30 -i "$F/f%05d.jpg" -i "$A" -map 0:v -map 1:a \
  -c:v libx264 -preset slow -crf 20 -profile:v high -pix_fmt yuv420p \
  -c:a aac -b:a 160k -af "loudnorm=I=-16:TP=-1.5:LRA=11" -ar 48000 -movflags +faststart -shortest "$O/filme3-perdas-1080.mp4"
ffmpeg -y -hide_banner -loglevel error -framerate 30 -i "$F/f%05d.jpg" -i "$A" -map 0:v -map 1:a -vf scale=1280:720:flags=lanczos \
  -c:v libx264 -preset slow -crf 23 -profile:v high -pix_fmt yuv420p \
  -c:a aac -b:a 128k -af "loudnorm=I=-16:TP=-1.5:LRA=11" -ar 48000 -movflags +faststart -shortest "$O/filme3-perdas-720.mp4"
# WebM (VP9 + Opus) para navegadores sem H.264
ffmpeg -y -hide_banner -loglevel error -framerate 30 -i "$F/f%05d.jpg" -i "$A" -map 0:v -map 1:a \
  -c:v libvpx-vp9 -b:v 0 -crf 34 -row-mt 1 -deadline good -cpu-used 4 -pix_fmt yuv420p \
  -c:a libopus -b:a 128k -af "loudnorm=I=-16:TP=-1.5:LRA=11" -ar 48000 -shortest "$O/filme3-perdas-1080.webm"
ffmpeg -y -hide_banner -loglevel error -framerate 30 -i "$F/f%05d.jpg" -i "$A" -map 0:v -map 1:a -vf scale=1280:720:flags=lanczos \
  -c:v libvpx-vp9 -b:v 0 -crf 36 -row-mt 1 -deadline good -cpu-used 4 -pix_fmt yuv420p \
  -c:a libopus -b:a 96k -af "loudnorm=I=-16:TP=-1.5:LRA=11" -ar 48000 -shortest "$O/filme3-perdas-720.webm"
echo "ok webm: $O"
