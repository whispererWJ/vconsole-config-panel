import { createRouter, createWebHistory } from 'vue-router';
import BasicDemo from '../views/BasicDemo.vue';
import EncryptedDemo from '../views/EncryptedDemo.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: BasicDemo, name: 'basic' },
    { path: '/encrypted', component: EncryptedDemo, name: 'encrypted' },
  ],
});

export default router;
