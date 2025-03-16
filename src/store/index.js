import { createStore as _createStore } from "vuex";

export function createStore() {
  return _createStore({
    state: {
      startFile: null,
      startImage: null,
      cropFile: null,
      pixelData: null,
      threadData: null,
      colorData: null,
      patternData: null,
      maxX: 0,
      maxY: 0,
    },
    mutations: {
      ADD_FILE(state, file) {
        state.startFile = file;
      },
      ADD_IMAGE(state, image) {
        state.startImage = image;
      },
      ADD_CROP_FILE(state, file) {
        state.cropFile = file;
      },
      ADD_PIXEL_DATA(state, data) {
        state.pixelData = data;
      },
      ADD_THREAD_DATA(state, data) {
        state.threadData = data;
      },
      ADD_COLOR_DATA(state, data) {
        state.colorData = data;
      },
      ADD_PATTERN_DATA(state, data) {
        state.patternData = data;
      },
      SET_MAX_X(state, maxX) {
        state.maxX = maxX;
      },
      SET_MAX_Y(state, maxY) {
        state.maxY = maxY;
      },
    },
  });
}
