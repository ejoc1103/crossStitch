<template>
  <div v-if="$store.state.colorData">
    <button @click="calculateEstimate">Calculate Estimate</button>
    <div>
      <p>Supply Cost: ${{ supplyCost }}</p>
      <p>Height {{ $store.state.imageHeight }}</p>
      <p>Width {{ $store.state.imageWidth }}</p>
    </div>
  </div>
  <div class="estimate-view">
    <!-- Main content for the Estimate View -->
    <UploadPhoto v-if="!$store.state.startFile" />

    <Crop v-if="$store.state.startFile && !$store.state.colorData" />
    <CreatePattern v-if="$store.state.colorData" />
  </div>
</template>
<script>
import UploadPhoto from "@/components/UploadPhoto.vue";
import Crop from "@/components/Crop.vue";
import CreatePattern from "@/components/CreatePattern.vue";
export default {
  name: "EstimateView",
  components: {
    UploadPhoto,
    Crop,
    CreatePattern,
  },
  data() {
    return {
      // Add any data properties you need here
      supplyCost: 0,
      laborCost: 0,
      totalCost: 0,
      count: 0,
    };
  },
  methods: {
    // Add any methods you need here
    calculateEstimate() {
      // Example calculation for estimate
      const colors = this.$store.state.colorData;
      console.log(colors);

      colors.forEach((color) => {
        // About 2400 stitches per sceen;
        this.count += Math.ceil(color.count / 2400);
      });
      this.supplyCost = Math.floor(this.count * 0.69 * 100) / 100; // Replace with actual logic
      this.laborCost = 0; // Replace with actual logic
      this.totalCost = this.supplyCost + this.laborCost / 100;
    },
  },
};
</script>

<style scoped>
.estimate-view {
  display: grid;
  grid-template-columns: 1fr;
  padding: 20px;
  align-items: start;
  justify-items: center;
  text-align: center;
  min-height: 90vh;
}
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
</style>
