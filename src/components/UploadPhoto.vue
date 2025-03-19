<template>
  <div class="upload-photo">
    <h2>Upload Your Photo!</h2>
    <file-pond
      v-if="!loading"
      name="file"
      ref="pond"
      class-name="my-pond"
      label-idle="Drag & Drop your image or <span class='filepond--label-action'>Browse</span>"
      allow-multiple="true"
      accepted-file-types="image/*"
      :style="{ width: '100%', height: '100%' }"
      @addfile="handleFileUpload"
    />
    <transition name="fade">
      <div v-if="loading" class="loading"><h1>Loading...</h1></div>
    </transition>
  </div>
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
      loading: false,
    };
  },
  components: {
    FilePond,
  },
  methods: {
    async handleFileUpload(e, file) {
      this.loading = true; // Set loading to true when file upload starts
      if (e) {
        console.error("File upload error:", e);
        this.loading = false;
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
      this.loading = false; // Set loading to false when file upload is done
      this.$store.commit("ADD_FILE", fileUrl);
      this.$store.commit("ADD_IMAGE", this.startImage);
    },
  },
};
</script>
<style scoped>
h2 {
  font-size: 3em;
  background-color: #f4e1e6;
  color: #4e3535;
  text-align: center;
  margin: 0;
  padding: 10px;
  border-radius: 10px;
  box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.upload-photo {
  display: grid;
  grid-template-columns: 1fr;
  align-items: center;
  justify-items: center;
  gap: 30px;
  background: linear-gradient(90deg, #d1a3b8, #8e6c88);
  padding: 30px;
  border-radius: 15px;
}
@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.1);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0.8;
  }
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 20vh;
  width: 30vw;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.2);
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  animation: pulse 1.5s infinite ease-in-out;
}
.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 20vh;
  width: 30vw;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.2);
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
}
.loading h1 {
  font-size: 2em;
  color: #4e3535;
  text-align: center;
  margin: 0;
  padding: 10px;
  border-radius: 10px;
  box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.2);
}
</style>
