<template>
  <div class="create">
    <file-pond
      name="file"
      ref="pond"
      class-name="my-pond"
      label-idle="Drag & Drop your image or Browse Files"
      allow-multiple="true"
      accepted-file-types="image/*"
      @addfile="handleFileUpload"
    />
    <!-- <div v-if="startFile">
      <h1>File Uploded</h1>
      <button @click="getGridImage">Set Image Grid</button>
    </div> -->
    <div v-if="startImage">
      <button @click="processImage">Get Color Pallet</button>
      <div v-if="colorData.length > 0">
        <button @click="createPattern">Get Pattern Data</button>
      </div>
    </div>

    <div v-if="colorData.length > 0" class="color-container">
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

    <!-- <div v-if="gridImage">
      <h3>Display with grid</h3>
      <img :src="gridImage" alt="Grid Image" class="pixel" />
    </div> -->

    <!-- Save Button -->
    <!-- <button v-if="processedImage" @click="downloadImage">Download Image</button> -->
    <div class="cropArea">
      <div v-if="startImage">
        <h3>Starter Image</h3>
        <img
          ref="image"
          :src="startImage"
          alt="Original Image"
          class="newImage"
        />

        <label>Aspect Ratio:</label>
        <select v-model="aspectRatio" @change="setAspectRatio">
          <option :value="NaN">Free</option>
          <option :value="1">Square (1:1)</option>
          <option :value="4 / 3">Standard (4:3)</option>
          <option :value="16 / 9">Widescreen (16:9)</option>
        </select>

        <div>
          <label>X Position: {{ cropX }}</label>
          <input type="range" v-model="cropX" min="0" :max="maxWidth" />
          <label>Y Position: {{ cropY }}</label>
          <input type="range" v-model="cropY" min="0" :max="maxHeight" />
          <label>Width: {{ cropWidth }}</label>
          <input type="range" v-model="cropWidth" min="0" :max="maxWidth" />
          <label>Height: {{ cropHeight }}</label>
          <input type="range" v-model="cropHeight" min="0" :max="maxHeight" />

          <button @click="cropImage">Crop</button>
        </div>
      </div>

      <div v-if="croppedDisplay">
        <h3>Processed Image:</h3>
        <img :src="croppedDisplay" alt="Modified Image" class="newImage" />
      </div>
    </div>

    <div v-if="patternData.length > 0" class="pattern-container">
      <div
        v-for="page in patternData"
        :style="{
          display: `grid`,
          gridTemplateColumns: `repeat(${page.maxX}, auto)`,
        }"
      >
        <div
          v-for="stitch in page.withSymbols"
          class="block"
          :style="{ backgroundColor: `#${stitch.hex}` }"
        >
          {{ stitch.symbol }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
//I need to break things up so they run more smoothly and it's clearer what is going on.
//Need to research and understand image sizing and how to maintain quality while allowing cropping and resizing

// Import FilePond
import vueFilePond from "vue-filepond";

// Import plugins
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type/dist/filepond-plugin-file-validate-type.esm.js";

// Import styles
import { Jimp } from "jimp";

import Cropper from "cropperjs";

import chart from "../assets/chart";
import symbols from "../assets/symbols";
// Create FilePond component
const FilePond = vueFilePond(FilePondPluginFileValidateType);

export default {
  data: function () {
    return {
      startFile: null,
      startImage: null,
      croppedImage: null,
      gridImage: null,
      // x and y positions and hex code
      pixelData: [],
      patternData: [],
      // hex code and matching floss #
      threadData: [],
      colorData: [],
      maxX: null,
      maxY: null,
      cropX: 0,
      cropY: 0,
      cropHeight: 8,
      cropWidth: 8,
      maxHeight: 8,
      maxWidth: 8,
      gridSize: 22,
      croppedDisplay: null,
      cropper: null,
      aspectRatio: NaN,
    };
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
        this.maxWidth = width / this.gridSize / this.gridSize;
        this.maxHeight = height / this.gridSize / this.gridSize;

        this.cropWidth = width / this.gridSize / this.gridSize;
        this.cropHeight = height / this.gridSize / this.gridSize;

        this.startImage = await image.getBase64("image/jpeg");
      } catch (e) {
        console.error("Error loading image with Jimp:", e);
      }
    },
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
    limitColors() {
      console.log("Limiting Colors");
      console.log(this.pixelData.length);
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

        if (Math.abs(currentMin - minDistance) < 20) {
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
          });
          tempColors.push(closest.hex);
        }
      }
    },
    async cropImage() {
      console.log("Cropping Image");
      console.log(this.cropX, this.cropY, this.cropWidth, this.cropHeight);
      const image = await Jimp.read(this.startFile);

      let pixelConversion = 22 * 22;

      const maxWidth = this.cropWidth * pixelConversion;
      const maxHeight = this.cropHeight * pixelConversion;

      const cropX = this.cropX * pixelConversion;
      const cropY = this.cropY * pixelConversion;

      console.log(maxHeight, maxWidth, cropX, cropY);

      const crop = { h: maxHeight, w: maxWidth, x: cropX, y: cropY };
      image.crop(crop);

      this.croppedImage = image;
      this.croppedDisplay = await image.getBase64("image/jpeg");
    },
    async processImage() {
      let tempData = [];

      let trackY = 0;
      let trackX = 0;

      let image = null;
      if (this.croppedImage) {
        image = this.croppedImage;
      } else {
        image = await Jimp.read(this.startFile);
      }

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
        this.maxX = trackX;
        trackX = 0;
      }

      this.maxY = trackY;

      this.pixelData = tempData;

      this.limitColors();
    },
    createPattern() {
      console.log("Creating Pattern");
      let colors = this.colorData;
      // 60 X 90 blocks 5400
      // Has to be be able to account for partial pages
      let pages = Math.ceil(this.maxY / 90) * Math.ceil(this.maxX / 60);
      let temp = [];

      const width = 60;
      const height = 90;

      let xCount = 60;
      let yCount = 90;

      let xStart = 0;
      let yStart = 0;

      for (let i = 0; i < pages; i++) {
        temp = this.pixelData.filter((thread) => {
          if (
            thread.x < xCount &&
            thread.y < yCount &&
            thread.x >= xStart &&
            thread.y >= yStart
          ) {
            return thread;
          }
        });

        let withSymbols = getSymbols(temp);

        this.patternData.push(withSymbols);

        xStart += width;
        xCount += width;
        if (xStart > this.maxX) {
          yStart += height;
          yCount += height;
          xStart = 0;
          xCount = 60;
        }
        temp = [];
      }

      function getSymbols(page) {
        let withSymbols = [];

        page.forEach((stitch) => {
          let currentSymbol = "x";

          colors.forEach((color) => {
            if (color.hex === stitch.hex) {
              currentSymbol = color.symbol;
            }
          });
          withSymbols.push({
            x: stitch.x,
            y: stitch.y,
            symbol: currentSymbol,
            hex: stitch.hex,
          });
        });

        let thisMaxX = 0;
        let thisMaxY = 0;

        withSymbols.forEach((stitch) => {
          if (stitch.x > thisMaxX) {
            thisMaxX = stitch.x;
          }
          if (stitch.y > thisMaxY) {
            thisMaxY = stitch.y;
          }
        });

        if ((thisMaxX + 1) % 60 !== 0) {
          thisMaxX = (thisMaxX % 60) + 1;
        } else {
          thisMaxX = 60;
        }

        return { withSymbols, maxX: thisMaxX };
      }
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
