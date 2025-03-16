<template>
  <div class="create">
    <h1>Create Pattern</h1>
    <UploadPhoto />
    <Crop />
    <CreatePattern />
  </div>
</template>

<script>
import UploadPhoto from "@/components/UploadPhoto.vue";
import Crop from "@/components/Crop.vue";
import CreatePattern from "@/components/CreatePattern.vue";

// Import styles
import { Jimp } from "jimp";

export default {
  data: function () {
    return {};
  },
  components: {
    UploadPhoto,
    Crop,
    CreatePattern,
  },
  methods: {
    async getGridImage() {
      const image = await Jimp.read(this.startFile);

      image.pixelate(22);

      image.scan(
        0,
        0,
        image.bitmap.width,
        image.bitmap.height,
        function (x, y, idx) {
          // Sets the grid over the image during the scan will need to be adjusted or moved

          if (x % 1320 === 0 || y % 1980 === 0) {
            this.bitmap.data[idx] = 0;
            this.bitmap.data[idx + 1] = 0;
            this.bitmap.data[idx + 2] = 0;
          }
        }
      );

      const base64 = await image.getBase64("image/jpeg");
      this.gridImage = base64;
    },
    downloadImage() {
      const link = document.createElement("a");
      link.href = this.croppedImage;
      link.download = "processed-image.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
  },
};
</script>

<style scoped>
.create {
  display: grid;
  grid-template-columns: 1fr;
  max-width: 100vw;
}
.block {
  height: 5px;
  width: 5px;
}
.color-container {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
}
.cropArea {
  display: grid;
  grid-template-columns: 1fr 1fr;
}
.pattern-container {
  display: grid;
  grid-template-columns: 1fr;
}
.newImage {
  max-width: 30vw;
}
</style>
