<template>
  <div class="create-pattern">
    <div class="pattern-controls">
      <button @click="createPattern">Create Pattern</button>
      <div
        v-if="patternData.length > 0"
        class="pattern-container"
        :style="{
          gridTemplateColumns: `repeat(${numberOfColumns}, auto)`,
        }"
      >
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
            :key="`${stitch.x}-${stitch.y}`"
            :style="{ backgroundColor: `#${stitch.hex}` }"
          ></div>
        </div>
      </div>
    </div>
    <div>
      <img :src="$store.state.cropFile" alt="Cropped Image" />
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      patternData: [],
      numberOfColumns: Math.ceil(this.$store.state.maxX / 60),
    };
  },
  methods: {
    createPattern() {
      let colors = this.$store.state.colorData;
      let maxY = this.$store.state.maxY;
      let maxX = this.$store.state.maxX;
      let pixelData = this.$store.state.pixelData;
      console.log(colors);
      // 60 X 90 blocks 5400
      // Has to be be able to account for partial pages
      let pages = Math.ceil(maxY / 90) * Math.ceil(maxX / 60);
      let temp = [];

      const width = 60;
      const height = 90;

      let xCount = 60;
      let yCount = 90;

      let xStart = 0;
      let yStart = 0;

      for (let i = 0; i < pages; i++) {
        temp = pixelData.filter((thread) => {
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

        console.log(withSymbols);

        this.patternData.push(withSymbols);

        xStart += width;
        xCount += width;
        if (xStart > maxX) {
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

      this.$store.commit("ADD_PATTERN_DATA", this.patternData);
    },
  },
};
</script>

<style scoped>
img {
  max-width: 648px;
  height: auto;
}
.pattern-controls {
  min-width: 648px;
}
.create-pattern {
  display: grid;
  grid-template-columns: auto 1fr;
  padding: 16px;
  max-width: 100vw;
  gap: 20px;
}
.block {
  height: 5px;
  width: 5px;
}
.pattern-container {
  display: grid;
}
</style>
