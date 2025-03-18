<template>
  <div class="nav">
    <h1>Stitch By Shelly</h1>
    <nav>
      <RouterLink to="/">Home</RouterLink>
      <RouterLink to="/contact">Contact</RouterLink>
      <RouterLink to="/estimate">Get Estimate</RouterLink>
      <RouterLink to="/create">Create</RouterLink>
    </nav>
  </div>
</template>

<script>
import { RouterLink } from "vue-router";
</script>
<style scoped>
.nav {
  display: flex;
  justify-content: space-around;
  align-items: center;
  background: linear-gradient(90deg, #8e6c88, #d1a3b8);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  height: 15vh; /* Adjusted to take up more of the top of the screen */
  width: 100%; /* Ensures it spans the full width */
  max-width: 100vw; /* Prevents overflow */
  color: #fff;
}

h1 {
  font-size: 3em;
  font-family: "Cursive", sans-serif;
  color: #fff;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

nav {
  display: flex;
  gap: 1.5rem;
}

nav a {
  text-decoration: none;
  color: #fff;
  font-size: 1.5em;
  font-weight: bold;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

nav a:hover {
  background-color: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

nav a.active {
  background-color: rgba(255, 255, 255, 0.4);
}
</style>
