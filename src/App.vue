<template>
  <div class="app">
    <Nav />
    <RouterView />
  </div>
</template>

<script setup>
import Nav from "./components/Nav.vue";
import { RouterView } from "vue-router";
</script>

<style>
.app {
  display: grid;
  justify-items: center;
  background-color: #f5efe6;
  font-family: "Lora", serif;
  min-height: 100vh;
}

h1,
h2,
h3 {
  font-family: "Playfair Display", serif;
  color: #333333;
}
</style>
