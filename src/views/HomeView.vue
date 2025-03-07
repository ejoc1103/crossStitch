<template>
  <div class="main">
    <div class="floating-gallery">
      <div class="gallery-container">
        <div class="info-blurb">
          <h2>
            Turn Your Most Cherished Memories into Timeless Cross Stitch Art
          </h2>
        </div>
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
      <div class="image-container">
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
      <div class="image-container">
        <img
          src="../assets/photos/photo3.jpeg"
          alt="Example 3"
          class="floating-image"
        />
        <p>—a perfect way to preserve your memories in thread.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
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
.main {
  display: flex;
  flex-direction: column;
  justify-content: center;
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
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
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
}
</style>
