<template>
  <header>
    <div class="wrapper">
      <h1>Stitches By Shelly</h1>
      <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/contact">Contact</RouterLink>
        <RouterLink to="/create">Create</RouterLink>
      </nav>
    </div>
  </header>

  <RouterView />
</template>

<script setup>
import { RouterLink, RouterView } from "vue-router";
</script>

<style scoped>
.wrapper {
  background-color: #d4a59a;
}

.wrapper h1 {
  color: #8e6c88;
}
</style>
