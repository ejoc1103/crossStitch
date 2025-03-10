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
  width: 100%;
  background-color: #8e6c88;
}
h1 {
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
