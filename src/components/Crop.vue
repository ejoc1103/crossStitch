<template>
  <div class="crop-page">
    <div class="cropper-area">
      <!-- Cropper Component -->
      <div v-if="imageUrl">
        <vue-cropper
          ref="cropper"
          :src="imageUrl"
          :aspect-ratio="selectedAspectRatio"
          :view-mode="2"
          :minCropBoxWidth="minCropWidth"
          :minCropBoxHeight="minCropHeight"
          :drag-mode="'move'"
          :auto-crop-area="0.8"
          :zoomable="false"
          :scalable="true"
          :movable="true"
          :crop-box-movable="true"
          :crop-box-resizable="true"
          @cropmove="checkCropSize"
        />
        <div>
          <p :style="{ color: widthColor }">
            Crop Width: {{ cropBoxWidth }} px
          </p>
          <p :style="{ color: heightColor }">
            Crop Height: {{ cropBoxHeight }} px
          </p>
        </div>
        <!-- Aspect Ratio Selector -->
        <label>Aspect Ratio:</label>
        <select v-model="selectedAspectRatio" @change="setAspectRatio">
          <option :value="NaN">Free</option>
          <option :value="1">Square (1:1)</option>
          <option :value="4 / 3">Standard (4:3)</option>
          <option :value="16 / 9">Widescreen (16:9)</option>
        </select>
      </div>
      <!-- Crop Button -->
      <button @click="cropImage">Crop</button>
    </div>

    <!-- Cropped Image Preview -->
    <div v-if="croppedImage" class="cropper-wrapper">
      <label for="colorRange">Detail Level:</label>
      <select v-model="colorRange" id="colorRange">
        <option :value="50">Very Low</option>
        <option :value="35">Low</option>
        <option :value="25">Medium</option>
        <option :value="15">High</option>
        <option :value="10">Very High</option>
      </select>
      <button @click="processImage">Process Image</button>
      <img :src="croppedImage" alt="Cropped Result" />
    </div>
  </div>
</template>

<script>
import VueCropper from "vue-cropperjs";
import "../assets/cropper.css"; // Ensure you have the CSS for cropper
import { Jimp } from "jimp"; // Import Jimp for image processing
import chart from "../assets/chart";
import symbols from "../assets/symbols";
export default {
  components: {
    VueCropper,
  },
  data() {
    return {
      croppedImage: null,
      selectedAspectRatio: 1,
      imageUrl: null,
      minCropWidth: 192,
      minCropHeight: 192,
      maxCropWidth: 768,
      maxCropHeight: 768,
      pixelData: [],
      threadData: [],
      colorData: [],
      gridSize: 22,
      colorRange: 35,
      cropBoxWidth: 0,
      cropBoxHeight: 0,
      widthColor: "black",
      heightColor: "black",
    };
  },
  watch: {
    "$store.state.startFile": {
      handler(newValue) {
        this.imageUrl = newValue;
      },
      immediate: true, // Ensures watcher runs on component mount
    },
  },
  methods: {
    cropImage() {
      if (!this.$refs.cropper) return;
      this.croppedImage = this.$refs.cropper
        .getCroppedCanvas()
        ?.toDataURL("image/png");
      this.$store.commit("ADD_CROP_FILE", this.croppedImage); // Commit the cropped image to Vuex store
    },
    checkCropSize() {
      const cropper = this.$refs.cropper;
      if (!cropper) return;

      const { width, height } = cropper.getCropBoxData();
      this.cropBoxWidth = Math.floor((width / 96) * 100) / 100;
      this.cropBoxHeight = Math.floor((height / 96) * 100) / 100;
      this.widthColor = width > this.maxCropWidth ? "red" : "black";
      this.heightColor = height > this.maxCropHeight ? "red" : "black";
    },
    setAspectRatio() {
      if (this.$refs.cropper) {
        this.$refs.cropper.setAspectRatio(this.selectedAspectRatio);
      }
    },
    async processImage() {
      let tempData = [];

      let trackY = 0;
      let trackX = 0;

      let image = await Jimp.read(this.croppedImage);

      const width = image.bitmap.width;
      const height = image.bitmap.height;

      for (let y = 0; y < height - this.gridSize; y += this.gridSize) {
        for (let x = 0; x < width - this.gridSize; x += this.gridSize) {
          const colorCount = {};

          image.scan(
            x,
            y,
            this.gridSize,
            this.gridSize,
            function (px, py, idx) {
              let r = this.bitmap.data[idx];
              let g = this.bitmap.data[idx + 1];
              let b = this.bitmap.data[idx + 2];

              r = r.toString(16).padStart(2, "0");
              g = g.toString(16).padStart(2, "0");
              b = b.toString(16).padStart(2, "0");
              let hex = `#${r}${g}${b}`;

              colorCount[hex] = (colorCount[hex] || 0) + 1;
            }
          );
          //sorts to get the predominant color
          const predominantColor = Object.entries(colorCount).sort(
            (a, b) => b[1] - a[1]
          )[0][0];

          tempData.push({ hex: predominantColor, x: trackX, y: trackY });
          trackX++;
        }
        trackY++;
        this.$store.commit("SET_MAX_X", trackX);
        trackX = 0;
      }

      this.$store.commit("SET_MAX_Y", trackY);

      this.$store.commit("ADD_PIXEL_DATA", tempData);
      this.pixelData = tempData;

      this.limitColors();
    },
    limitColors() {
      let tempColors = [];
      function hexToRgb(hex) {
        const bigint = parseInt(hex.slice(1), 16);
        return {
          r: (bigint >> 16) & 255,
          g: (bigint >> 8) & 255,
          b: bigint & 255,
        };
      }

      function colorDistance(c1, c2) {
        return Math.sqrt(
          Math.pow(c1.r - c2.r, 2) +
            Math.pow(c1.g - c2.g, 2) +
            Math.pow(c1.b - c2.b, 2)
        );
      }

      for (let i = 0; i < this.pixelData.length; i++) {
        const color = hexToRgb(this.pixelData[i].hex);
        let closest = null;
        let currentClosest = null;
        let currentMin = Infinity;
        let minDistance = Infinity;
        // Searches the chart for the closest matching thread to the pixel
        chart.forEach((thread) => {
          const dmcColor = hexToRgb(`#${thread.hex}`);
          const distance = colorDistance(color, dmcColor);
          if (distance < minDistance) {
            minDistance = distance;
            closest = thread;
          }
        });
        // Filters through existing threads to see if there's one already close enough
        if (this.threadData.length > 0) {
          this.threadData.forEach((thread) => {
            const dmcColor = hexToRgb(`#${thread.hex}`);
            const distance = colorDistance(color, dmcColor);
            if (distance < currentMin) {
              currentMin = distance;
              currentClosest = thread;
            }
          });
        }

        if (Math.abs(currentMin - minDistance) < this.colorRange) {
          closest = currentClosest;
        }
        let symbol = symbols[tempColors.length];
        this.threadData.push({
          floss: closest.floss,
          hex: closest.hex,
          symbol,
        });
        this.pixelData[i].hex = closest.hex;

        if (tempColors.indexOf(closest.hex) === -1) {
          this.colorData.push({
            floss: closest.floss,
            hex: closest.hex,
            symbol,
            count: 1,
          });
          tempColors.push(closest.hex);
        } else {
          this.colorData.forEach((color) => {
            if (color.hex === closest.hex) {
              color.count++;
            }
          });
        }
      }
      console.log("done");
      console.log(this.threadData.length);
      this.$store.commit("ADD_THREAD_DATA", this.threadData);
      this.$store.commit("ADD_COLOR_DATA", this.colorData);
      this.$store.commit("ADD_PIXEL_DATA", this.pixelData);
    },
  },
};
</script>

<style scoped>
img {
  max-width: 900px;
  height: auto;
}
.crop-page {
  display: grid;
  grid-template-columns: 1fr 1fr;
  padding: 20px;
  height: 100%;
}
.cropper-wrapper {
  width: 614px;
  height: auto;
  border: 3px solid #ccc;
}
.cropper-wrapper img {
  max-width: 100%;
  height: auto;
}
.cropper {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
}
.cropper-area {
  width: 614px;
}
</style>
