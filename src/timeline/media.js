import { clamp } from './playback';

let player = null;
let route = null;
let pendingOffset = null;

export function attachMedia(nextPlayer, nextRoute) {
  player = nextPlayer || null;
  route = nextRoute || null;
  applyPendingSeek();
}

export function detachMedia(nextPlayer) {
  if (nextPlayer && player !== nextPlayer) return;
  player = null;
  route = null;
}

export function mediaOffset() {
  if (pendingOffset !== null) return pendingOffset;
  if (!player || typeof player.getCurrentTime !== 'function') return null;
  const seconds = player.getCurrentTime();
  if (!Number.isFinite(seconds)) return null;
  return (route?.videoStartOffset || 0) + (seconds * 1000);
}

export function seekMedia(offset) {
  if (!Number.isFinite(offset)) return false;
  pendingOffset = offset;
  return applyPendingSeek();
}

function applyPendingSeek() {
  if (pendingOffset === null || !player || typeof player.seekTo !== 'function') return false;
  const duration = player.getDuration?.();
  if (!Number.isFinite(duration) || duration <= 0) return false;

  const start = route?.videoStartOffset || 0;
  const seconds = clamp((pendingOffset - start) / 1000, 0, Math.max(0, duration - 0.05));
  player.seekTo(seconds, 'seconds');
  pendingOffset = null;
  return true;
}

export function hasMedia() {
  return Boolean(player);
}

export function mediaErrorMessage(error) {
  const detail = error?.message || error?.details || '';
  const text = String(detail);
  if (/manifest|level|network|frag|buffer|timeout|load/i.test(text)) {
    return 'The video connection dropped. Check your network and try again.';
  }
  if (/decode|media/i.test(text)) {
    return 'This browser could not decode the video. Try again, or open the drive in another browser.';
  }
  return 'The video stopped unexpectedly. Try again.';
}
