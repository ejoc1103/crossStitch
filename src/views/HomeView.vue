<template>
  <div class="home">
    <div class="floating-gallery">
      <h2>Turn Your Most Cherished Memories into Timeless Cross Stitch Art</h2>

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
  background-color: #f4e1e6;
  color: #333333;
  text-align: center;
  margin: 0;
  padding: 10px;
  border-radius: 10px;
  width: 80%;
  max-width: 800px;
  box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
h2,
h3 {
  font-size: 3em;
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
h3 {
  width: 100%;
}
.home {
  display: grid;
  grid-template-columns: 1fr;
  justify-items: center;
  height: 100%;
}
.gallery-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
}
.floating-gallery {
  display: grid;
  grid-template-columns: 1fr;
  width: 80%;
  gap: 40px;
  justify-items: center;
  align-content: center;
  padding: 20px;
}
.floating-image {
  width: 30vw;
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
  background: linear-gradient(90deg, #d1a3b8, #8e6c88);
  padding: 20px;
  border-radius: 15px;
}
.image-container-alt {
  display: grid;
  grid-template-columns: auto auto;
  align-items: center;
  justify-items: center;
  background: linear-gradient(90deg, #8e6c88, #d1a3b8);
  padding: 20px;
  border-radius: 15px;
}
</style>
