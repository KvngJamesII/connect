// What the user asked the video to do. Time itself lives on the element.
import * as Types from '../actions/types';
import { clampToLoop, mediaOffset } from './media';

function trimLoopToVideo(state) {
  if (!state.currentRoute?.videoStartOffset || !state.loop || !state.zoom) {
    return;
  }
  if (state.loop.startTime !== state.zoom.start || state.zoom.start !== 0) {
    return;
  }
  const loopRouteOffset = state.loop.startTime - state.zoom.start;
  if (state.currentRoute.videoStartOffset > loopRouteOffset) {
    state.loop = {
      startTime: state.zoom.start + state.currentRoute.videoStartOffset,
      duration: state.loop.duration - (state.currentRoute.videoStartOffset - loopRouteOffset),
    };
  }
}

function bumpSeek(state, offset) {
  state.offset = offset;
  state.startTime = Date.now();
  state.seekId = (state.seekId || 0) + 1;
}

export function reducer(_state, action) {
  const state = { ..._state };

  switch (action.type) {
    case Types.ACTION_SEEK:
      bumpSeek(state, action.offset);
      break;
    case Types.ACTION_PAUSE: {
      state.desiredPlaySpeed = 0;
      const live = mediaOffset();
      if (live != null) {
        state.offset = live;
      }
      break;
    }
    case Types.ACTION_PLAY:
      if (action.speed !== state.desiredPlaySpeed) {
        state.desiredPlaySpeed = action.speed;
      }
      break;
    case Types.ACTION_LOOP:
      if (action.start != null && action.end != null) {
        state.loop = {
          startTime: action.start,
          duration: action.end - action.start,
        };
      } else {
        state.loop = null;
      }
      break;
    case Types.ACTION_RESET:
      state.desiredPlaySpeed = 1;
      bumpSeek(state, 0);
      break;
    default:
      break;
  }

  trimLoopToVideo(state);

  if (action.type === Types.ACTION_LOOP && state.loop) {
    const live = mediaOffset();
    const base = live ?? state.offset ?? state.loop.startTime;
    const clamped = clampToLoop(base, state.loop);
    const outside = live == null || clamped !== live;
    if (outside && clamped !== state.offset) {
      bumpSeek(state, clamped);
    } else if (!outside && state.offset !== live) {
      state.offset = live;
    }
  }

  if (action.type === Types.ACTION_SEEK || action.type === Types.ACTION_RESET) {
    state.offset = clampToLoop(state.offset, state.loop);
  }

  return state;
}

export function seek(offset) {
  return {
    type: Types.ACTION_SEEK,
    offset,
  };
}

export function pause() {
  return {
    type: Types.ACTION_PAUSE,
  };
}

export function play(speed = 1) {
  return {
    type: Types.ACTION_PLAY,
    speed,
  };
}

export function selectLoop(start, end) {
  return {
    type: Types.ACTION_LOOP,
    start,
    end,
  };
}

export function resetPlayback() {
  return {
    type: Types.ACTION_RESET,
  };
}
