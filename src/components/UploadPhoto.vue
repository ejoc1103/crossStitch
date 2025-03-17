<template>
  <file-pond
    v-if="!startFile"
    name="file"
    ref="pond"
    class-name="my-pond"
    label-idle="Drag & Drop your image or <span class='filepond--label-action'>Browse</span>"
    allow-multiple="true"
    accepted-file-types="image/*"
    @addfile="handleFileUpload"
  />
</template>

<script>
import vueFilePond from "vue-filepond";
// Import plugins
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type/dist/filepond-plugin-file-validate-type.esm.js";
import "filepond/dist/filepond.min.css";

import { Jimp } from "jimp";

// Create FilePond component
const FilePond = vueFilePond(FilePondPluginFileValidateType);

export default {
  data() {
    return {
      startFile: null,
      startImage: null,
    };
  },
  components: {
    FilePond,
  },
  computed: {
    // Add any computed properties you need here
  },
  methods: {
    async handleFileUpload(e, file) {
      if (e) {
        console.error("File upload error:", e);
        return;
      }
      //turns file into fileURL to be readible by Jimp
      const fileUrl = URL.createObjectURL(file.file);
      this.startFile = fileUrl;
      //Takes file and turns it into a base64 image
      try {
        const image = await Jimp.read(fileUrl);

        const width = image.bitmap.width;
        const height = image.bitmap.height;
        this.$store.commit("SET_IMAGE_DIMENSIONS", { width, height });

        this.startImage = await image.getBase64("image/jpeg");
      } catch (e) {
        console.error("Error loading image with Jimp:", e);
      }
      // Commit the file URL and image to the Vuex store

      this.$store.commit("ADD_FILE", fileUrl);
      this.$store.commit("ADD_IMAGE", this.startImage);
    },
  },
};
</script>

<style scoped></style>
