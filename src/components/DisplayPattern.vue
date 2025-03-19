<template>
  <div class="display-pattern">
    <h1>Pattern</h1>
    <button @click="createKey">Create Key</button>
    <button v-if="keyData" @click="downloadAsPDF">Download as PDF</button>
    <div
      ref="patternRef"
      v-if="$store.state.colorData"
      class="pattern-container"
    >
      <div
        v-for="(page, index) in $store.state.patternData"
        :key="index"
        class="pattern-page"
        :ref="(el) => (patternRef[index] = el)"
        :style="{
          display: 'grid',
          justifyContent: 'center',
          gridTemplateColumns: `repeat(${page.maxX}, 1fr)`,
          maxWidth: '90vw',
        }"
      >
        <div
          v-for="stitch in page.withSymbols"
          :key="`${stitch.x}-${stitch.y}`"
          class="block"
        >
          {{ stitch.symbol }}
        </div>
      </div>
    </div>

    <div ref="keyRef" v-if="keyData" class="key-container">
      <div
        v-for="(page, index) in keyData"
        :key="index"
        class="key-page-container"
        :ref="(el) => (keyRef[index] = el)"
      >
        <div v-for="color in page" class="key-block">
          <p>{{ color.symbol }} {{ color.floss }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default {
  name: "DisplayPattern",
  data() {
    return {
      keyData: null,
      patternRef: [],
      keyRef: [],
    };
  },
  methods: {
    createKey() {
      let patternData = this.$store.state.patternData;
      let colorData = this.$store.state.colorData;

      let pages = [];

      for (let i = 0; i < patternData.length; i++) {
        const uniqueBySymbol = [
          ...new Map(
            patternData[i].withSymbols.map((item) => [item.symbol, item])
          ).values(),
        ];
        pages.push(uniqueBySymbol);
      }

      pages.forEach((page) => {
        colorData.forEach((color) => {
          page.forEach((color2) => {
            if (color2.symbol === color.symbol) {
              color2.floss = color.floss;
            }
          });
        });
      });

      this.keyData = pages;
    },
    async downloadAsPDF() {
      const pdf = new jsPDF("p", "mm", "a4");

      console.log(this.patternRef[0], this.keyRef);

      for (let i = 0; i < this.patternRef.length; i++) {
        const canvas = await html2canvas(this.patternRef[i]);
        const imgData = canvas.toDataURL("image/png");

        const imgWidth = 190;
        const imgHeight = 285;

        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, "PNG", 5, 5, imgWidth, imgHeight);
      }

      // Convert and add each key page
      for (let i = 0; i < this.keyRef.length; i++) {
        const canvas = await html2canvas(this.keyRef[i]);
        const imgData = canvas.toDataURL("image/png");

        const imgWidth = 190;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addPage();
        pdf.addImage(imgData, "PNG", 5, 5, imgWidth, imgHeight);
      }

      pdf.save("Pattern.pdf");
    },
  },
};
</script>

<style scoped>
.display-pattern {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  justify-items: center;
  text-align: center;
}
.block {
  max-width: 20px; /* Adjust size as needed */
  max-height: 15px; /* Adjust size as needed */
  border: 1px solid #ccc; /* Optional for visibility */
}
.pattern-container {
  display: grid;
  gap: 20px;
  grid-template-columns: 1fr;
  justify-items: center;
}

.key-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 40px;
  margin-top: 20px;
}
.key-page-container {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
  gap: 10px;
}
.key-block {
  border: 1px solid #ccc; /* Optional for visibility */
  text-align: center;
}
</style>
