<template>
  <div class="crop-page">
    <h3>Upload & Crop Image</h3>
    <div class="cropper-area">
      <!-- Cropper Component -->
      <div v-if="imageUrl" class="img-cropper">
        <!-- IM going to need to set min and max for width and height -->
        <vue-cropper
          ref="cropper"
          :ready="onReady"
          :src="imageUrl"
          :aspect-ratio="selectedAspectRatio"
          :view-mode="2"
          :minCropBoxWidth="minCropWidth"
          :minCropBoxHeight="minCropHeight"
          :maxCropBoxWidth="maxCropWidth"
          :maxCropBoxHeight="maxCropHeight"
          :drag-mode="'move'"
          :auto-crop-area="0.8"
          :zoomable="false"
          :scalable="true"
          :movable="true"
          :crop-box-movable="true"
          :crop-box-resizable="true"
        />
      </div>
    </div>

    <!-- Aspect Ratio Selector -->
    <label>Aspect Ratio:</label>
    <select v-model="selectedAspectRatio" @change="setAspectRatio">
      <option :value="NaN">Free</option>
      <option :value="1">Square (1:1)</option>
      <option :value="4 / 3">Standard (4:3)</option>
      <option :value="16 / 9">Widescreen (16:9)</option>
    </select>

    <!-- Crop Button -->
    <button @click="cropImage">Crop & Save</button>

    <!-- Cropped Image Preview -->
    <div v-if="croppedImage">
      <h3>Cropped Image</h3>
      <img :src="croppedImage" alt="Cropped Result" />
    </div>
  </div>
</template>

<script>
import VueCropper from "vue-cropperjs";
import "../assets/cropper.css"; // Ensure you have the CSS for cropper

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
    setAspectRatio() {
      if (this.$refs.cropper) {
        console.log(this.$refs.cropper);
        this.$refs.cropper.setAspectRatio(this.selectedAspectRatio);
      }
    },
  },
};
</script>

<style scoped>
img {
  max-width: 900px;
  height: auto;
}
.crop-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  height: 100%;
}
.cropper-wrapper {
  width: 800px;
  height: auto;
  border: 3px solid #ccc;
}
.cropper {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
}
.cropper-area {
  width: 614px;
}
</style>
