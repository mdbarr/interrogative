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
      component: () => import('./views/Interview.vue'),
    }, {
      path: '/activate/:id',
      name: 'activate',
      meta: { requiresAuth: false },
      component: () => import('./views/Activate.vue'),
    }, {
      path: '/reset/:id',
      name: 'reset',
      meta: { requiresAuth: false },
      component: () => import('./views/ResetPassword.vue'),
    }, {
      path: '/forgot',
      name: 'forgot',
      meta: { requiresAuth: false },
      component: () => import('./views/ForgotPassword.vue'),
    }, {
      path: '/signup',
      name: 'signup',
      meta: { requiresAuth: false },
      component: () => import('./views/SignUp.vue'),
    }, {
      path: '/signin',
      name: 'signin',
      meta: { requiresAuth: false },
      component: () => import('./views/SignIn.vue'),
    }, {
      path: '/dashboard',
      name: 'dashboard',
      alias: '/',
      meta: { requiresAuth: true },
      component: () => import('./views/Dashboard.vue'),
    }, {
      path: '*',
      component: () => import('./views/SignIn.vue'),
    },
  ],
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
