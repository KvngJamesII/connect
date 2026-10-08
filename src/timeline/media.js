// The <video> element is the playback clock. Actions seek it; everyone else reads it.

let video = null;
let route = null;
let held = null;

export function attachVideo(nextVideo, nextRoute) {
  video = nextVideo || null;
  route = nextRoute || null;
}

export function detachVideo(nextVideo) {
  if (nextVideo && video !== nextVideo) return;
  video = null;
  route = null;
  held = null;
}

export function setVideoRoute(nextRoute) {
  route = nextRoute || null;
}

export function holdOffset(offsetMs) {
  held = offsetMs;
}

export function releaseHold() {
  held = null;
}

export function videoSeconds(offsetMs, videoStartOffset = 0, durationSeconds = Infinity) {
  const seconds = Math.max(0, ((offsetMs || 0) - (videoStartOffset || 0)) / 1000);
  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) return seconds;
  return Math.min(seconds, Math.max(0, durationSeconds - 0.05));
}

export function clampToLoop(offset, loop) {
  if (offset == null || !loop || loop.startTime == null) return offset;
  const end = loop.startTime + loop.duration;
  if (offset < loop.startTime) return loop.startTime;
  if (offset > end) return end;
  return offset;
}

// Route offset in ms. A seek that has not landed yet wins over a stale currentTime.
export function mediaOffset() {
  const start = route?.videoStartOffset || 0;
  const live = video && video.readyState >= 1 && Number.isFinite(video.currentTime)
    ? start + (video.currentTime * 1000)
    : null;
  if (held != null && (live == null || video.seeking || Math.abs(live - held) > 250)) return held;
  held = null;
  return live;
}

export function resetMediaForTests() {
  video = null;
  route = null;
  held = null;
}
