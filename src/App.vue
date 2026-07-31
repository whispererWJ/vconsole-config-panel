<template>
  <div id="app">
    <nav>
      <router-link to="/">Basic Config Demo</router-link> |
      <router-link to="/encrypted">Encrypted Config Demo</router-link>
    </nav>
    <router-view />
  </div>
</template>

<style>
nav {
  padding: 16px;
  border-bottom: 1px solid #e8ecf1;
}

nav a {
  color: #1a73e8;
  text-decoration: none;
  margin: 0 8px;
}

nav a.router-link-active {
  font-weight: bold;
  text-decoration: underline;
}
</style>
