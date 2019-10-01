import Vue from 'vue';
import Router from 'vue-router';
import state from './state';

Vue.use(Router);

let preauth = true;

const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/interview/:id',
      name: 'interview',
      meta: { requiresAuth: false },
      component: () => { return import('./views/Interview.vue'); }
    }, {
      path: '/activate/:id',
      name: 'activate',
      meta: { requiresAuth: false },
      component: () => { return import('./views/Activate.vue'); }
    }, {
      path: '/signup',
      name: 'signup',
      meta: { requiresAuth: false },
      component: () => { return import('./views/SignUp.vue'); }
    }, {
      path: '/signin',
      name: 'signin',
      meta: { requiresAuth: false },
      component: () => { return import('./views/SignIn.vue'); }
    }, {
      path: '/dashboard',
      name: 'dashboard',
      alias: '/',
      meta: { requiresAuth: true },
      component: () => { return import('./views/Dashboard.vue'); }
    }, {
      path: '*',
      component: () => { return import('./views/SignIn.vue'); }
    }
  ]
});

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth === false) {
    return next();
  }

  if (preauth) {
    return router.app.$api.get('/session').
      then((response) => {
        router.app.$session(response.data);
        preauth = false;

        if (to.name === 'signin') {
          return next({ name: 'dashboard' });
        }
        return next();
      }).
      catch(() => {
        preauth = false;
        return next({ name: 'signin' });
      });
  }

  if (!state.session && to.name !== 'signin') {
    return next({ name: 'signin' });
  } else if (state.session && to.name === 'signin') {
    return next({ name: 'dashboard' });
  }

  return next();
});

export default router;
