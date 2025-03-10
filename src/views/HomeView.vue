<template>
  <div class="home">
    <div class="floating-gallery">
      <div class="info-blurb">
        <h2>
          Turn Your Most Cherished Memories into Timeless Cross Stitch Art
        </h2>
      </div>

      <div class="image-container">
        <img
          src="../assets/photos/photo1.jpeg"
          alt="Example 1"
          class="floating-image"
        />
        <p>
          Transform your
          <strong
            >wedding photos, family portraits, and sentimental moments</strong
          >
          into stunning, hand-stitched keepsakes.
        </p>
      </div>
      <RouterLink to="/estimate">
        <h3>Get an estimate now!</h3>
      </RouterLink>
      <div class="image-container-alt">
        <p>
          Upload your favorite photo, and we’ll create a
          <strong>beautiful, personalized cross-stitch pattern</strong>
        </p>
        <img
          src="../assets/photos/photo2.jpeg"
          alt="Example 2"
          class="floating-image"
        />
      </div>
      <RouterLink to="/contact">
        <h3>Send me your photo and get things started!</h3>
      </RouterLink>
      <div class="image-container">
        <img
          src="../assets/photos/photo3.jpeg"
          alt="Example 3"
          class="floating-image"
        />
        <p>A perfect way to preserve your memories in thread.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { RouterLink } from "vue-router";
// {
//   "primary": "#F5EFE6",
//   "secondary": "#D4A59A",
//   "accent": "#8E6C88",
//   "background": "#FAF8F3",
//   "textPrimary": "#333333",
//   "textSecondary": "#666666",
//   "button": "#C5B3A3",
//   "buttonHover": "#A08776"
// }
</script>
<style scoped>
p {
  font-size: 2.5em;
}
h2 {
  font-size: 3em;
}
.home {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.gallery-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.info-blurb {
  text-align: center;
}
.floating-gallery {
  display: grid;
  grid-template-columns: 1fr;
  height: 100%;
  width: 80%;
  gap: 20px;
  justify-items: center;
  align-content: center;
  background-color: #f4e1e6;
  padding: 20px;
}
.floating-image {
  width: 50vw;
  height: auto;
  border-radius: 15px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
}
.floating-image:hover {
  transform: translateY(-10px) scale(1.05);
  box-shadow: 0px 15px 40px rgba(0, 0, 0, 0.3);
}
.image-container {
  display: grid;
  grid-template-columns: auto auto;
  align-items: center;
  justify-items: center;
  gap: 20px;
}
.image-container-alt {
  display: grid;
  grid-template-columns: auto auto;
  align-items: center;
  justify-items: center;
}
</style>
