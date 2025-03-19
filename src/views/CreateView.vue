<template>
  <div class="create">
    <button @click="getGridImage">Get Grid Image</button>
    <div>
      <img
        v-if="gridImage"
        :src="gridImage"
        alt="Grid Image"
        class="newImage"
      />
      <DisplayPattern />
    </div>
  </div>
</template>

<script>
import DisplayPattern from "@/components/DisplayPattern.vue";
import { Jimp } from "jimp";

export default {
  data: function () {
    return {
      gridImage: null,
    };
  },
  components: {
    DisplayPattern,
  },
  //If the image is about 96 pixels per inch
  //And it's 22 stiches per inch
  methods: {
    async getGridImage() {
      const image = await Jimp.read(this.$store.state.cropFile);
      const thickness = 3;
      const gridWidth = 1320;
      const gridHeight = 1980;
      const cols = Math.ceil(image.bitmap.width / gridWidth);
      const rows = Math.ceil(image.bitmap.height / gridHeight);

      image.pixelate(22);

      image.scan(
        0,
        0,
        image.bitmap.width,
        image.bitmap.height,
        function (x, y, idx) {
          for (let t = 0; t < thickness; t++) {
            if (x % gridWidth === 0 || y % gridHeight === 0) {
              if (x + t < this.bitmap.width) {
                this.bitmap.data[idx + t * 4] = 0;
                this.bitmap.data[idx + 1 + t * 4] = 0;
                this.bitmap.data[idx + 2 + t * 4] = 0;
              }
              if (y + t < this.bitmap.height) {
                const offset = this.bitmap.width * t * 4;
                this.bitmap.data[idx + offset] = 0;
                this.bitmap.data[idx + 1 + offset] = 0;
                this.bitmap.data[idx + 2 + offset] = 0;
              }
            }
          }
        }
      );

      image.greyscale();
      const base64 = await image.getBase64("image/jpeg");

      // Draw numbers using a canvas
      const img = new Image();
      img.src = base64;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        let endX = image.bitmap.width - gridWidth * (cols - 1);
        let endY = image.bitmap.height - gridHeight * (rows - 1);

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        ctx.font = "350px Arial"; // Adjust size as needed
        ctx.fillStyle = "black";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        let number = 1;
        for (let y = 0; y < rows; y++) {
          for (let x = 0; x < cols; x++) {
            let posX;
            let posY;
            if (x + 1 !== cols && y + 1 !== rows) {
              posX = x * gridWidth + gridWidth / 2;
              posY = y * gridHeight + gridHeight / 2;
            } else if (x + 1 === cols && y + 1 !== rows) {
              posX = x * gridWidth + endX / 2;
              posY = y * gridHeight + gridHeight / 2;
            } else if (x + 1 !== cols && y + 1 === rows) {
              posX = x * gridWidth + gridWidth / 2;
              posY = y * gridHeight + endY / 2;
            } else {
              posX = x * gridWidth + endX / 2;
              posY = y + gridHeight + endY / 2;
            }
            ctx.fillText(number.toString(), posX, posY);
            number++;
          }
        }

        this.gridImage = canvas.toDataURL("image/jpeg");
      };
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
.newImage {
  max-width: 50vw;
}
</style>
