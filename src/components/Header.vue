<template>
  <div class="main">
    <h1>Stitch By Shelly</h1>
    <nav>
      <RouterLink to="/">Home</RouterLink>
      <RouterLink to="/contact">Contact</RouterLink>
      <RouterLink to="/create">Create</RouterLink>
    </nav>
  </div>
</template>

<script>
import { RouterLink } from "vue-router";
</script>

<style scoped>
.main {
  display: flex;
  justify-content: space-around;
  width: 100%;
  background-color: #8e6c88;
}
h1 {
  color: #d4a59a;
  font-size: 4em;
}
nav {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 2em;
  gap: 10px;
}
</style>
