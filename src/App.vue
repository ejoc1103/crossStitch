<template>
  <div class="app">
    <Header />
    <RouterView />
  </div>
</template>

<script setup>
import Header from "./components/Header.vue";
import { RouterView } from "vue-router";
</script>

<style>
.app {
  display: grid;
  justify-items: center;
  background-color: #f5efe6;
  font-family: "Lora", serif;
}

h1,
h2,
h3 {
  font-family: "Playfair Display", serif;
}
</style>
