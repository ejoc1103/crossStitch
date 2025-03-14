import { createStore as _createStore } from "vuex";

export function createStore() {
  return _createStore({
    state: {
      startFile: null,
      startImage: null,
    },
    mutations: {
      ADD_FILE(state, file) {
        state.startFile = file;
      },
      ADD_IMAGE(state, image) {
        state.startImage = image;
      },
    },
  });
}
