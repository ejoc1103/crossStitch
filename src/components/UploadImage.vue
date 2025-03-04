<template>
  <div id="app">
    <file-pond
      name="file"
      ref="pond"
      class-name="my-pond"
      label-idle="Drag & Drop your image or <span class='filepond--label-action'>Browse Files</span>"
      allow-multiple="true"
      accepted-file-types="image/*"
      v-bind:files="myFiles"
      v-on:init="handleFilePondInit"
      @addfile="handleFileUpload"
    />

    <!-- Display Processed Image -->
    <div v-if="processedImage">
      <h3>Processed Image:</h3>
      <img :src="processedImage" alt="Modified Image" class="pixel" />
    </div>

    <!-- Save Button -->
    <button v-if="processedImage" @click="downloadImage">Download Image</button>
  </div>
</template>

<script>
// Import FilePond
import vueFilePond from "vue-filepond";

// Import plugins
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type/dist/filepond-plugin-file-validate-type.esm.js";
import FilePondPluginImagePreview from "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.esm.js";

// Import styles
import "filepond/dist/filepond.min.css";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.min.css";
import { Jimp } from "jimp";

// Create FilePond component
const FilePond = vueFilePond(
  FilePondPluginFileValidateType,
  FilePondPluginImagePreview
);

export default {
  data: function () {
    return { myFiles: [], processedImage: null };
  },
  methods: {
    handleFilePondInit: function () {
      console.log("FilePond has initialized");

      // example of instance method call on pond reference
      this.$refs.pond.getFiles();
    },
    async handleFileUpload(e, file) {
      if (e) {
        console.error("File upload error:", e);
        return;
      }

      const fileUrl = URL.createObjectURL(file.file);

      try {
        const image = await Jimp.read(fileUrl);

        image.pixelate(12);

        const base64 = await image.getBase64("image/jpeg");
        this.processedImage = base64;
      } catch (e) {
        console.error("Error loading image with Jimp:", e);
      }
    },
    downloadImage() {
      const link = document.createElement("a");
      link.href = this.processedImage;
      link.download = "processed-image.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
  },
  components: {
    FilePond,
  },
};
</script>

<style>
.pixel {
  height: 1085px;
  width: 610px;
}
</style>
