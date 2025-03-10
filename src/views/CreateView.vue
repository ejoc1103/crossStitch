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
        :style="{ backgroundColor: `#${color.hex}` }"
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
  <div v-if="threadData" class="newImage">
    <div
      v-for="thread in threadData"
      :key="thread.hex"
      :style="{ backgroundColor: `#${thread.hex}` }"
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

        let tempData = [];

        let trackY = 0;
        let trackX = 0;
        let maxX = 700;

        this.startImage = await image.getBase64("image/jpeg");

        image.pixelate(22);
        this.processedImage = await image.getBase64("image/jpeg");
        image.scan(
          0,
          0,
          image.bitmap.width,
          image.bitmap.height,
          function (x, y, idx) {
            // if (x % 1320 === 0 || y % 1980 === 0) {
            //   this.bitmap.data[idx] = 0;
            //   this.bitmap.data[idx + 1] = 0;
            //   this.bitmap.data[idx + 2] = 0;
            // }

            if (x % 22 === 0 && y % 22 === 0) {
              let r = this.bitmap.data[idx];
              let g = this.bitmap.data[idx + 1];
              let b = this.bitmap.data[idx + 2];

              r = r.toString(16).padStart(2, "0");
              g = g.toString(16).padStart(2, "0");
              b = b.toString(16).padStart(2, "0");
              let hex = `#${r}${g}${b}`;

              if (y / 22 > trackY) {
                trackY++;
                maxX = trackX;
                trackX = 0;
                tempData.push({ hex, x: trackX, y: trackY });
              } else {
                trackX++;
                tempData.push({ hex, x: trackX, y: trackY });
              }
            }
          }
        );

        this.pixelData = tempData;

        const base64 = await image.getBase64("image/jpeg");
        this.gridImage = base64;
        console.log(maxX);
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

        chart.forEach((thread) => {
          const dmcColor = hexToRgb(`#${thread.hex}`);
          const distance = colorDistance(color, dmcColor);
          if (distance < minDistance) {
            minDistance = distance;
            closest = thread;
          }
        });

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
  height: 25px;
  width: 25px;
  color: white;
}
.newImage {
  display: grid;
  justify-self: center;
  grid-template-columns: repeat(138, 1fr);
}
</style>
