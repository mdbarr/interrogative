import axios from 'axios';
import moment from 'moment';
import state from '../state';
import events from '@mdbarr/events';

const baseURL = (process.env.NODE_ENV === 'production') ?
  `https://${ window.location.hostname }/api/` :
  `http://${ window.location.hostname }:8080/api/`;

const websocketURL = (process.env.NODE_ENV === 'production') ?
  `wss://${ window.location.hostname }/ws/` :
  `ws://${ window.location.hostname }:8080/ws/`;

const defaults = {
  baseURL,
  headers: {},
  withCredentials: true,
};

function jsonClone (object) {
  return JSON.parse(JSON.stringify(object));
}

const SIZES = [ 'Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB' ];

const NUMBERS = [
  'zero', 'one', 'two', 'three', 'four', 'five', 'six',
  'seven', 'eight', 'nine', 'ten',
];

//////////

export default {
  install (Vue) {
  // Filters
    Vue.filter('calendar', (value = Date.now()) => moment(value).calendar());

    Vue.filter('capitalize', (value) => value.charAt(0).toUpperCase() + value.slice(1));

    Vue.filter('plural', (word, array) => {
      if (array.length !== 1) {
        return `${ word }s`;
      }
      return word;
    });

    Vue.filter('formatBytes', (bytes) => {
      bytes = Number(bytes) || 0;
      if (bytes === 0) {
        return '0 Bytes';
      }
      const kilobyte = 1024;
      const places = 2;

      const index = Math.floor(Math.log(bytes) / Math.log(kilobyte));
      return `${ parseFloat((bytes / Math.pow(kilobyte, index)).toFixed(places)) } ${ SIZES[index] }`;
    });

    Vue.filter('number', (value) => {
      if (NUMBERS[value]) {
        return NUMBERS[value];
      }
      return value.toString();
    });

    Vue.filter('duration', (diff) => {
      const days = Math.floor(diff / 86400000);
      diff = diff % 86400000;
      const hours = Math.floor(diff / 3600000);
      diff = diff % 3600000;
      const minutes = Math.floor(diff / 60000);

      const duration = [];
      if (days > 0) {
        if (days === 1) {
          duration.push(`${ days } day`);
        } else {
          duration.push(`${ days } day`);
        }
      }
      if (hours > 0) {
        if (hours === 1) {
          duration.push(`${ hours } hour`);
        } else {
          duration.push(`${ hours } hours`);
        }
      }
      if (minutes > 0) {
        if (minutes === 1) {
          duration.push(`${ minutes } minute`);
        } else {
          duration.push(`${ minutes } minutes`);
        }
      }

      return duration.join(', ');
    });

    //////////
    // event handlers

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

    const buildDirectories = (branch, depth = 0) => {
      if (depth === 0) {
        state.directories = [];
      }

      const node = {
        name: branch.name,
        path: branch.path,
        depth,
        icon: 'mdi-folder',
      };

      if (node.path === state.interview.home) {
        node.icon = 'mdi-folder-home';
      } else if (node.path === state.interview.uploadsPath) {
        node.icon = 'mdi-folder-upload';
      }

      state.directories.push(node);

      if (branch.children) {
        for (const child of branch.children) {
          if (child.type === 'directory') {
            buildDirectories(child, depth + 1);
          }
        }
      }

      if (depth === 0) {
        state.directories.reverse();
      }
    };

    $events.on('files:tree:update', (event) => {
      Vue.set(state.tree, 0, event.data);
      Vue.set(state.treeOpen, 0, event.data.path);

      buildDirectories(event.data);
      console.log('directories', state.directories);
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
          data: { path: model.path },
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
          role: state.role,
        },
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

    $events.on('terminal:tab:closed', (event) => {
      for (let i = 0; i < state.terminals.length; i++) {
        if (state.terminals[i].id === event.data.id) {
          state.terminals.splice(i, 1);
          console.log('terminal closed', event.data);
          return true;
        }
      }
      return false;
    });

    $events.on('messages:message:send', (event) => {
      state.messages.push(event.data);
    });

    $events.on('messages:history:list', (event) => {
      state.messages.splice(0, state.messages.length, ...event.data);
    });

    $events.on('timeline:events:list', (event) => {
      state.timeline.splice(0, state.timeline.length, ...event.data);
    });

    //////////
    // api and websocket interface

    function api (method, url, body, progress) {
      const request = jsonClone(defaults);

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
      del: (url, body) => api('delete', url, body),
      delete: (url, body) => api('delete', url, body),
      get: (url, body) => api('get', url, body),
      head: (url, body) => api('head', url, body),
      opts: (url, body) => api('options', url, body),
      patch: (url, body) => api('patch', url, body),
      post: (url, body) => api('post', url, body),
      put: (url, body) => api('put', url, body),

      upload: (url, body, progress) => api('upload', url, body, progress),
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
              data: event,
            });
          }
        } catch (error) {
        // ignore
        }
      };
    };

    //////////
    // navigation

    Vue.prototype.$navigate = function (where) {
      if (!this.$router.currentRoute || this.$router.currentRoute.name !== where) {
        this.$router.push({ name: where });
      }
    };

    //////////
    // sessions

    Vue.prototype.$session = function (session) {
      if (session) {
        state.session = session;

        defaults.headers.Authorization = `Bearer ${ session.id }`;
      } else {
        state.session = null;

        delete defaults.headers.Authorization;

        this.$navigate('signin');
      }
    };
  },
};
