import Vue from 'vue';
import Router from 'vue-router';
import Interview from './views/Interview.vue';

Vue.use(Router);

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/interview/:id',
      name: 'interview',
      component: Interview
    }
  ]
});
