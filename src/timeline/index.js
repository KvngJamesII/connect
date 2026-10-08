import store from '../store';
import { clampToLoop, mediaOffset } from './media';

/**
 * Current playback position in milliseconds from the start of the route.
 * The video element is the clock. State is only the fallback for when no
 * video is attached yet (or in tests).
 *
 * @param {object} state
 * @returns {number}
 */
export function currentOffset(state = null) {
  if (!state) {
    state = store.getState();
  }

  let offset = mediaOffset();
  if (offset == null) {
    offset = state.offset;
    if (offset == null && state.loop?.startTime != null) {
      offset = state.loop.startTime;
    }
  }

  return clampToLoop(offset, state.loop);
}
