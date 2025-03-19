<template>
  <div class="crop-page" v-if="!loading">
    <h2>Crop Your Image Here</h2>

    <div class="cropper-area">
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
      <div v-if="croppedImage" class="crop-dimensions">
        <p :style="{ color: widthColor }">
          Crop Width: {{ cropBoxWidth }} inches
        </p>
        <p :style="{ color: heightColor }">
          Crop Height: {{ cropBoxHeight }} inches
        </p>
      </div>
    </div>

    <!-- Cropped Image Preview -->
    <div class="results-box">
      <div v-if="croppedImage" class="cropped-results">
        <div class="detail-level-selector">
          <label for="colorRange">Detail Level:</label>
          <select v-model="colorRange" id="colorRange">
            <option :value="50">$</option>
            <option :value="35">$$</option>
            <option :value="25">$$$</option>
            <option :value="15">$$$$</option>
            <option :value="10">$$$$$</option>
          </select>
        </div>
        <div class="cropped-buttons">
          <button class="crop-button" @click="processImage">
            Process Image
          </button>
          <button class="crop-button" @click="cropImage">Re-Crop</button>
          <button class="crop-button">Reset Image</button>
        </div>
        <img :src="croppedImage" alt="Cropped Result" />
      </div>
      <div v-else class="cropped-waiting">
        <button class="crop-button" @click="cropImage">Crop</button>
        <div class="aspect-ratio-selector">
          <label>Select Ratio:</label>
          <select v-model="selectedAspectRatio" @change="setAspectRatio">
            <option :value="NaN">Free</option>
            <option :value="1">Square (1:1)</option>
            <option :value="4 / 3">Standard (4:3)</option>
            <option :value="16 / 9">Widescreen (16:9)</option>
            <option :value="3 / 2">Landscape (3:2)</option>
            <option :value="2 / 3">Portrait (2:3)</option>
            <option :value="5 / 4">Classic (5:4)</option>
            <option :value="9 / 16">Vertical (9:16)</option>
          </select>
        </div>
        <h3>Cropped Image will show here!</h3>
        <h4>
          Please Keep your Image No larger that 8 inches for height and width
        </h4>
        <div class="crop-dimensions">
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
      <p>{{ croppedWaiting }}</p>
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
      croppedWaiting: "Please wait while we process your image...",
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
      this.$refs.cropper.replace(this.croppedImage);
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
      let messages = [
        "We have to scan each pixel...",
        "To match it to the closest thread color...",
        "Just a moment longer...",
      ];
      let index = 0;

      if (this.loading) {
        setInterval(() => {
          this.croppedWaiting = messages[index];
          index = index + 1;
          if (index >= messages.length) {
            index = 0;
          }
        }, 2000);
      }

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
select {
  font-size: 1.5em;
  background-color: #f4e1e6;
  color: #4e3535;
  text-align: center;
  box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.aspect-ratio-selector {
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
.crop-button {
  background-color: #8e6c88;
  color: #fff;
  border: none;
  padding: 10px 20px;
  font-size: 1.5em;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
}
.cropped-buttons {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  justify-items: center;
  align-items: center;
}
.crop-dimensions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  justify-items: center;
  align-items: center;
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
}
.cropper-area {
  width: 614px;
}
.detail-level-selector {
  font-size: 1.5em;
  background-color: #f4e1e6;
  color: #4e3535;
  text-align: center;
  margin: 0;
  border-radius: 10px;
  box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
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
