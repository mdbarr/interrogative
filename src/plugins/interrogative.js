import axios from 'axios';
import state from '../state';
import events from '@mdbarr/events';

const baseURL = (process.env.NODE_ENV === 'production')
  ? `https://${ window.location.hostname }/api/`
  : `http://${ window.location.hostname }:8080/api/`;

const websocketURL = (process.env.NODE_ENV === 'production')
  ? `wss://${ window.location.hostname }/ws/`
  : `ws://${ window.location.hostname }:8080/ws/`;

const defaults = {
  baseURL,
  headers: {},
  withCredentials: true
};

export default { install (Vue) {
  const $events = new events.EventBus();
  Vue.prototype.$events = $events;

  $events.on('git:repository:svg', (event) => {
    state.gitSVG = event.data;
  });

  $events.on('file:upload:start', (event) => {
    Vue.set(state.uploads, event.data.id, event.data);
  });

  $events.on('file:upload:progress', (event) => {
    Vue.set(state.uploads, event.data.id, event.data);
  });

  $events.on('file:upload:failed', (event) => {
    console.log('failed', event, state.uploads[event.data.id]);
    if (state.uploads[event.data.id]) {
      Vue.delete(state.uploads, event.data.id);
    }
  });

  $events.on('files:tree:update', (event) => {
    Vue.set(state.tree, 0, event.data);
    Vue.set(state.treeOpen, 0, event.data.path);
  });

  $events.on('files:file:opened', (event) => {
    let model = event.data;
    if (!state.files[model.path]) {
      Vue.set(state.files, model.path, model);
    } else {
      const file = state.files[model.path];
      model = Object.assign(file, model);
    }

    console.log('opened', model.path);
    if (model.focus !== false) {
      $events.emit({
        type: 'editor:tab:focus',
        data: { path: model.path }
      });
    }
  });

  $events.on('files:file:updated', (event) => {
    const model = event.data;
    const file = state.files[model.path];
    Object.assign(file, model);
  });

  $events.on('files:file:closed', (event) => {
    if (state.files[event.data.path]) {
      delete state.files[event.data.path];
    }
  });

  $events.once('register', (event) => {
    $events.id = event.data.id;

    state.user = event.data.id;
    state.name = event.data.name;
    state.role = event.data.role || 'user';

    console.log(event.data);

    $events.emit({
      type: 'connected',
      data: {
        user: state.user,
        name: state.name,
        role: state.role
      }
    });
  });

  $events.on('online', (event) => {
    console.log('online', event.data);
    for (const id in state.online) {
      console.log(state.online[id]);
      Vue.set(state.online, id, false);
    }
    console.log(state.online);
    for (const user of event.data) {
      Vue.set(state.online, user.id, true);
    }
    console.log(state.online);
  });

  $events.on('files:upload:list', (event) => {
    console.log('uploads', event.data);
    Vue.set(state, 'uploads', {});
    Object.assign(state.uploads, event.data);
  });

  $events.on('terminal:tab:list', (event) => {
    console.log('terminals', event.data);
    state.terminals.splice(0, state.terminals.length, ...event.data);
  });

  $events.on('terminal:tab:opened', (event) => {
    console.log('terminal opened', event.data);
    state.terminals.push(event.data);
  });

  //////////

  function api (method, url, body, progress) {
    const request = Object.assign({}, defaults);

    if (method === 'upload') {
      request.method = 'post';
      request.headers['Content-Type'] = 'multipart/form-data';
    } else {
      request.method = method;
    }

    if (typeof progress === 'function') {
      request.onUploadProgress = progress;
    }

    request.url = url;

    if (body) {
      request.data = body;
    }

    return axios(request);
  }

  Vue.prototype.$api = {
    del: (url, body) => { return api('delete', url, body); },
    get: (url, body) => { return api('get', url, body); },
    head: (url, body) => { return api('head', url, body); },
    opts: (url, body) => { return api('options', url, body); },
    patch: (url, body) => { return api('patch', url, body); },
    post: (url, body) => { return api('post', url, body); },
    put: (url, body) => { return api('put', url, body); },

    upload: (url, body, progress) => { return api('upload', url, body, progress); }
  };

  Vue.prototype.$socket = function (urlFragment) {
    const url = `${ websocketURL }${ state.id }${ urlFragment }`.replace(/(\/+)/, '/');
    const socket = new WebSocket(url);

    socket.interval = setInterval(() => {
      if (socket.readyState === 1) {
        socket.send('PING');
      } else if (socket.readyState === 2 || socket.readyState === 3) {
        clearInterval(socket.interval);
      }
    }, 5000);

    socket.$send = (object) => {
      if (socket.readyState === 1) {
        const message = JSON.stringify(object);
        socket.send(message);
      }
    };

    return socket;
  };

  Vue.prototype.$connect = function (id) {
    const socket = this.$socket('/main');

    socket.onclose = () => {
      state.disconnected = true;
    };

    $events.on('*', (event) => {
      if (event.origin === $events.id && event.type !== 'register') {
        socket.$send(event);
      }
    });

    socket.onmessage = (message) => {
      try {
        const event = JSON.parse(message.data);
        if (event.type) {
          $events.emit(event);
        } else {
          $events.emit({
            type: 'unknown',
            data: event
          });
        }
      } catch (error) {
        // ignore
      }
    };
  };

  //////////

  Vue.prototype.$navigate = function (where) {
    this.$router.push({ name: where });
  };

  //////////

  Vue.prototype.$session = function (session) {
    if (session) {
      state.loggedIn = true;
      state.session = session;
      state.user = session.user;

      defaults.headers.Authorization = `Bearer ${ session.id }`;

      this.$navigate('home');
    } else {
      state.loggedIn = false;
      state.session = false;
      state.user = false;

      delete defaults.headers.Authorization;

      this.$navigate('login');
    }
  };
} };
