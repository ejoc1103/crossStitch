<template>
  <div class="estimate-view">
    <!-- Main content for the Estimate View -->
    <h1>Get Estimate</h1>
    <UploadPhoto />
    <Crop />
    <CreatePattern />
    <div v-if="$store.state.colorData">
      <button @click="calculateEstimate">calculateEstimate</button>
      {{ supplyCost }} {{ laborCost }} {{ totalCost }}
    </div>
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
    };
  },
  methods: {
    // Add any methods you need here
    calculateEstimate() {
      // Example calculation for estimate
      const colors = this.$store.state.colorData;
      console.log(colors);
      let count = 0;
      colors.forEach((color) => {
        // About 2400 stitches per sceen;
        count += Math.ceil(color.count / 2400);
      });
      this.supplyCost = Math.floor(count * 0.69, 2); // Replace with actual logic
      this.laborCost = 0; // Replace with actual logic
      this.totalCost = this.supplyCost + this.laborCost;
    },
  },
};
</script>

<style scoped>
.estimate-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  height: 100%;
}
</style>
