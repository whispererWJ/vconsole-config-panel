import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createPersistedState } from 'pinia-plugin-persistedstate';
import { createRouter, createWebHashHistory } from 'vue-router';
import App from './index.vue';
import EncryptedConfigDemo from './encrypted-config-demo.vue';

// Define routes
const routes = [
  { path: '/', component: App },
  { path: '/encrypted', component: EncryptedConfigDemo }
];

// Create router instance
const router = createRouter({
  history: createWebHashHistory(),
  routes
});

const app = createApp(App);
const pinia = createPinia();

// Add persistence plugin to Pinia
pinia.use(createPersistedState());

app.use(pinia);
app.use(router);
app.mount('#app');