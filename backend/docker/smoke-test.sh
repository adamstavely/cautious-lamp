#!/usr/bin/env bash
# Checks a built backend image: IRIS analyses real videos through the
# backend's own runner and parser, and Playwright's Chromium starts.
#   backend/docker/smoke-test.sh <image>
# Needs ffmpeg on the host to make the test videos.
set -euo pipefail

IMAGE="${1:?usage: smoke-test.sh <image>}"
VIDEOS="$(mktemp -d)"
trap 'rm -rf "$VIDEOS"' EXIT

# 4 seconds at 30 fps. "flash" alternates black and white every 3 frames
# (5 flashes a second, over IRIS's limit of 3); "steady" is mid-grey.
ffmpeg -loglevel error -f lavfi -i "nullsrc=s=320x240:r=30:d=4,geq=lum='if(mod(floor(N/3)\,2)\,235\,16)':cb=128:cr=128" \
  -c:v libx264 -pix_fmt yuv420p "$VIDEOS/flash.mp4"
ffmpeg -loglevel error -f lavfi -i "color=c=gray:s=320x240:r=30:d=4" -c:v libx264 -pix_fmt yuv420p "$VIDEOS/steady.mp4"
chmod -R a+rX "$VIDEOS"

docker run --rm -v "$VIDEOS:/videos:ro" "$IMAGE" node -e '
const fs = require("fs");
const { runIris, irisSettingsFromEnv, locateIris } = require("./dist/photosensitivity/iris-runner");
const { chromium } = require("playwright");

(async () => {
  const settings = irisSettingsFromEnv();
  const location = await locateIris(settings);
  if (location.problem) throw new Error(location.problem);

  const analyse = async (name) => {
    // runIris moves the video, and /videos is read-only
    const copy = `/tmp/${name}`;
    fs.copyFileSync(`/videos/${name}`, copy);
    return runIris(copy, { patternDetection: true }, settings);
  };

  const flash = await analyse("flash.mp4");
  const steady = await analyse("steady.mp4");
  const failing = (frames) => frames.filter((f) => f.luminanceFrameResult >= 2).length;
  console.log(`flash: ${flash.length} frames, ${failing(flash)} failing; steady: ${steady.length} frames, ${failing(steady)} failing`);
  if (flash.length < 100 || steady.length < 100) throw new Error("IRIS returned too few frames");
  if (failing(flash) === 0) throw new Error("IRIS found no luminance failures in the flashing video");
  if (failing(steady) !== 0) throw new Error("IRIS found luminance failures in the steady video");

  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setContent("<h1>ok</h1>");
  const text = await page.textContent("h1");
  await browser.close();
  if (text !== "ok") throw new Error("Chromium did not render the page");
  console.log("Chromium: ok");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
'
