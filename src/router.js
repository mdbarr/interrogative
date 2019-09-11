import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/interview/:id',
      name: 'interview',
      component: () => { return import('./views/Interview.vue'); }
    }, {
      path: '/signin',
      name: 'signin',
      component: () => { return import('./views/SignIn.vue'); }
    }, {
      path: '/dashboard',
      name: 'dashboard',
      alias: '/',
      component: () => { return import('./views/Dashboard.vue'); }
    }
  ]
});
