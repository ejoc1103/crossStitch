<template>
  <div class="create">
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
    <div v-if="startFile">
      <h1>File Uploded</h1>
      <button>Pixelate Image</button>
      <button>Set Image Grid</button>
    </div>
    <div v-if="processedImage">
      <button @click="changeColors">Change Colors</button>
    </div>
    <div v-if="colorData.length > 0">
      <div
        v-for="color in colorData"
        :key="color.index"
        :style="{
          backgroundColor: `#${color.hex}`,
        }"
      >
        {{ color.floss }}
        <h1>{{ color.symbol }}</h1>
      </div>
    </div>
    <!-- Display Processed Image -->
    <!-- <div v-if="startImage">
      <h3>Starter Image</h3>
      <img :src="startImage" alt="Original Image" class="pixel" />
    </div>
    <div v-if="processedImage">
      <h3>Processed Image:</h3>
      <img :src="processedImage" alt="Modified Image" class="pixel" />
    </div>
    <div v-if="gridImage">
      <h3>Display with grid</h3>
      <img :src="gridImage" alt="Grid Image" class="pixel" />
    </div> -->

    <!-- Save Button -->
    <!-- <button v-if="processedImage" @click="downloadImage">Download Image</button> -->
  </div>
  <div
    v-if="threadData"
    class="newImage"
    :style="{ gridTemplateColumns: `repeat(${maxX}, 1fr)` }"
  >
    <div
      v-for="thread in threadData"
      :key="thread.hex"
      :style="{
        backgroundColor: `#${thread.hex}`,
      }"
      class="block"
    ></div>
  </div>
</template>

<script>
//I need to break things up so they run more smoothly and it's clearer what is going on.
//Need to research and understand image sizing and how to maintain quality while allowing cropping and resizing

// Import FilePond
import vueFilePond from "vue-filepond";

// Import plugins
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type/dist/filepond-plugin-file-validate-type.esm.js";
import FilePondPluginImagePreview from "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.esm.js";

// Import styles
import "filepond/dist/filepond.min.css";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.min.css";
import { Jimp } from "jimp";

import chart from "../assets/chart";
import symbols from "../assets/symbols";
// Create FilePond component
const FilePond = vueFilePond(
  FilePondPluginFileValidateType,
  FilePondPluginImagePreview
);

export default {
  data: function () {
    return {
      myFiles: [],
      startFile: null,
      startImage: null,
      processedImage: null,
      gridImage: null,
      // x and y positions and hex code
      pixelData: [],
      // hex code and matching floss #
      threadData: [],
      colorData: [],
      maxX: null,
    };
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
      this.startFile = fileUrl;

      try {
        const image = await Jimp.read(fileUrl);

        const width = image.bitmap.width;
        const height = image.bitmap.height;
        let gridSize = 22;

        let tempData = [];

        let trackY = 0;
        let trackX = 0;

        this.startImage = await image.getBase64("image/jpeg");

        image.pixelate(22);
        this.processedImage = await image.getBase64("image/jpeg");

        for (let y = 0; y < height - gridSize; y += gridSize) {
          for (let x = 0; x < width - gridSize; x += gridSize) {
            const colorCount = {};

            image.scan(x, y, gridSize, gridSize, function (px, py, idx) {
              // Sets the grid over the image during the scan will need to be adjusted or moved
              // if (x % 1320 === 0 || y % 1980 === 0) {
              //   this.bitmap.data[idx] = 0;
              //   this.bitmap.data[idx + 1] = 0;
              //   this.bitmap.data[idx + 2] = 0;
              // }

              let r = this.bitmap.data[idx];
              let g = this.bitmap.data[idx + 1];
              let b = this.bitmap.data[idx + 2];

              r = r.toString(16).padStart(2, "0");
              g = g.toString(16).padStart(2, "0");
              b = b.toString(16).padStart(2, "0");
              let hex = `#${r}${g}${b}`;

              colorCount[hex] = (colorCount[hex] || 0) + 1;
            });

            const predominantColor = Object.entries(colorCount).sort(
              (a, b) => b[1] - a[1]
            )[0][0];

            tempData.push({ hex: predominantColor, x: trackX, y: trackY });
            trackX++;
          }
          trackY++;
          this.maxX = trackX;
          trackX = 0;
        }

        this.pixelData = tempData;

        const base64 = await image.getBase64("image/jpeg");
        this.gridImage = base64;
        console.log(this.maxX + "     maxX");
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
    changeColors() {
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

        if (Math.abs(currentMin - minDistance) < 15) {
          closest = currentClosest;
        }
        let symbol = symbols[tempColors.length];
        this.threadData.push({
          floss: closest.floss,
          hex: closest.hex,
          symbol,
        });
        if (tempColors.indexOf(closest.hex) === -1) {
          this.colorData.push({
            floss: closest.floss,
            hex: closest.hex,
            symbol,
          });
          tempColors.push(closest.hex);
        }
      }
      console.log(this.colorData.length);
      console.log(this.pixelData);
      console.log(this.threadData.length);
    },
  },
  components: {
    FilePond,
  },
};
</script>

<style>
.create {
  display: grid;
}
.block {
  height: 10px;
  width: 10px;
  color: white;
}
.newImage {
  display: grid;
  justify-self: center;
}
</style>
