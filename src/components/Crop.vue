<template>
  <div class="crop-container">
    <h3>Upload & Crop Image</h3>

    <vue-cropper
      v-if="imageUrl"
      ref="cropper"
      class="custom-cropper"
      :src="imageUrl"
      :aspect-ratio="selectedAspectRatio"
      :view-mode="1"
      :drag-mode="crop"
      :auto-crop-area="0.8"
      :background="true"
      :zoomable="true"
      :scalable="true"
      :movable="true"
      :crop-box-movable="true"
      :crop-box-resizable="true"
    />

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

export default {
  data() {
    return {
      croppedImage: null,
      selectedAspectRatio: 1, // Default: Free selection
    };
  },
  components: {
    VueCropper,
  },
  computed: {
    // startFile is the fileURL from the store
    imageUrl() {
      return this.$store.state.startImage;
    },
  },
  watch: {
    // Watch for changes in the imageUrl to reinitialize the cropper
  },
  methods: {
    cropImage() {
      const cropper = this.$refs.cropper;

      if (!cropper) return;

      this.croppedImage = cropper.getCroppedCanvas().toDataURL("image/png");
    },
    setAspectRatio() {
      if (this.cropper) {
        this.cropper.setAspectRatio(this.aspectRatio);
      }
    },
  },
};
</script>

<style scoped>
.crop-container {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
}
.cropper-wrapper {
  width: 70%;
  height: auto;
}
.cropper-wrapper img {
  max-width: 60%;
  height: auto;
}
.custom-cropper-wrapper {
  text-align: center;
  padding: 10px;
}
.custom-cropper {
  width: 60vh;
  height: auto;
}
</style>
