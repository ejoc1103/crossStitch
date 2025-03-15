<template>
  <div class="estimate-view">
    <!-- Main content for the Estimate View -->
    <h1>Get Estimate</h1>
    <UploadPhoto />
    <Crop />
  </div>
</template>
<script>
import UploadPhoto from "@/components/UploadPhoto.vue";
import Crop from "@/components/Crop.vue";
export default {
  name: "EstimateView",
  components: {
    UploadPhoto,
    Crop,
  },
  data() {
    return {
      // Add any data properties you need here
    };
  },
  methods: {
    // Add any methods you need here
  },
};
</script>

<style scoped>
.estimate-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}
</style>
