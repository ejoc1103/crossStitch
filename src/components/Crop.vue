<template>
  <div class="crop-page" v-if="!loading">
    <h2>Crop Your Image Here</h2>

    <div class="cropper-area">
      <div class="aspect-ratio-selector">
        <label>Aspect Ratio:</label>
        <select v-model="selectedAspectRatio" @change="setAspectRatio">
          <option :value="NaN">Free</option>
          <option :value="1">Square (1:1)</option>
          <option :value="4 / 3">Standard (4:3)</option>
          <option :value="16 / 9">Widescreen (16:9)</option>
        </select>
        <button @click="cropImage">Crop</button>
      </div>
      <!-- Cropper Component -->
      <div>
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
          :movable="false"
          :crop-box-movable="true"
          :crop-box-resizable="true"
          @cropmove="checkCropSize"
          @ready="checkCropSize"
        />
      </div>
      <!-- Crop Button -->
    </div>

    <!-- Cropped Image Preview -->
    <div class="results-box">
      <div v-if="croppedImage" class="cropped-results">
        <label for="colorRange">Detail Level:</label>
        <select v-model="colorRange" id="colorRange">
          <option :value="50">$</option>
          <option :value="35">$$</option>
          <option :value="25">$$$</option>
          <option :value="15">$$$$</option>
          <option :value="10">$$$$$</option>
        </select>
        <button @click="processImage">Process Image</button>
        <img :src="croppedImage" alt="Cropped Result" />
      </div>
      <div v-else class="cropped-waiting">
        <h3>Cropped Image will show here!</h3>
        <h4>
          Please Keep your Image No larger that 8 inches for height and width
        </h4>
        <div>
          <p :style="{ color: widthColor }">
            Crop Width: {{ cropBoxWidth }} inches
          </p>
          <p :style="{ color: heightColor }">
            Crop Height: {{ cropBoxHeight }} inches
          </p>
        </div>
        <div></div>
      </div>
    </div>
  </div>
  <div v-else class="crop-page">
    <h2 style="grid-column: span 2">Processing Image...</h2>
    <div style="grid-column: span 2" class="cropped-waiting">
      <p>Please wait while we process your image...</p>
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
      loading: false,
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
      this.loading = true;
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
      this.loading = false;
      let cropBoxWidth = this.cropBoxWidth;
      let cropBoxHeight = this.cropBoxHeight;
      if (this.cropBoxWidth === "Ready") {
        cropBoxWidth =
          Math.floor((this.$store.state.imageWidth / 96) * 100) / 100;
      }
      if (this.cropBoxHeight === "Ready") {
        cropBoxHeight =
          Math.floor((this.$store.state.imageHeight / 96) * 100) / 100;
      }
      this.$store.commit("SET_IMAGE_DIMENSIONS", {
        width: cropBoxWidth,
        height: cropBoxHeight,
      });
      this.$store.commit("ADD_THREAD_DATA", this.threadData);
      this.$store.commit("ADD_COLOR_DATA", this.colorData);
      this.$store.commit("ADD_PIXEL_DATA", this.pixelData);
    },
  },
};
</script>

<style scoped>
body {
  font-size: 2em;
}
h2 {
  font-size: 3em;
  background-color: #f4e1e6;
  color: #4e3535;
  text-align: center;
  margin: 0;
  padding: 10px;
  border-radius: 10px;
  width: 80%;
  box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  grid-column: span 2;
}
h3,
h4,
p {
  font-size: 2em;
  background-color: #f4e1e6;
  color: #4e3535;
  text-align: center;
  margin: 0;
  padding: 10px;
  border-radius: 10px;
  width: 80%;
  box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
img {
  width: 614px;
  max-height: 720px;
}
.aspect-ratio-selector {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  grid-column: span 2;
}
.crop-page {
  display: grid;
  grid-template-columns: 1fr 1fr;
  padding: 20px;
  justify-items: center;
  gap: 20px;
  max-width: 100vw;
}
.cropped-results {
  display: grid;
  width: 614px;
  height: auto;
}
.cropper-area {
  width: 614px;
}
.results-box {
  display: grid;
  max-width: 40vw;
  justify-items: center;
  align-items: start;
  text-align: center;
}
.cropped-waiting {
  border: 20px solid;
  border-image: linear-gradient(45deg, #8e6c88, #d80dd5, #ceed05ad, #d71111) 1;
  display: grid;
  grid-template-columns: 1fr;
  background-color: #f9f9f9;
  background-image: linear-gradient(to right, #ddd 1px, transparent 1px),
    linear-gradient(to bottom, #ddd 1px, transparent 1px);
  background-size: 28px 28px; /* Adjust size to match the grid size */
  align-items: center;
  justify-items: center;
  text-align: center;
  color: #888;
  font-size: 1.2em;
  width: 614px;
  height: 800px;
}
</style>
