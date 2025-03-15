<template>
  <div class="upload-photo">
    <h1>Upload Photo</h1>
    <file-pond
      v-if="!startFile"
      name="file"
      ref="pond"
      class-name="my-pond"
      label-idle="Drag & Drop your image or Browse Files"
      allow-multiple="true"
      accepted-file-types="image/*"
      @addfile="handleFileUpload"
    />
  </div>
</template>

<script>
import vueFilePond from "vue-filepond";
// Import plugins
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type/dist/filepond-plugin-file-validate-type.esm.js";

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

        // const width = image.bitmap.width;
        // const height = image.bitmap.height;
        // this.maxWidth = width / this.gridSize / this.gridSize;
        // this.maxHeight = height / this.gridSize / this.gridSize;

        // this.cropWidth = width / this.gridSize / this.gridSize;
        // this.cropHeight = height / this.gridSize / this.gridSize;

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

<style scoped>
.upload-photo {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>
