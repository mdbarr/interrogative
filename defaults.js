module.exports = {
  name: 'Interrogative',
  url: 'https://interrogative.io',
  domain: 'interrogative.io',
  manager: {
    port: 1311,
    host: '0.0.0.0',
    storage: '/interrogative/interviews',
    bootstrap: true,
    engine: { socketPath: '/var/run/docker.sock' },
    networks: {
      container: 'interrogative',
      database: 'interrogative-db'
    }
  },
  database: {
    retry: 5000,
    slowStart: 10000,
    url: 'mongodb://mongo:27017/interrogative'
  },
  sessions: { cookie: 'interrogative-session' },
  oplog: {
    retry: 5000,
    url: 'mongodb://mongo:27017/local'
  },
  metadata: {
    port: 1312,
    host: '0.0.0.0'
  },
  container: {
    port: 1313,
    host: '0.0.0.0',
    ttl: '2h',
    heartbeat: '30s',
    openMaxSize: 262144,
    persistence: '~/.interrogative'
  },
  interaction: {
    port: 1314,
    host: '127.0.0.1'
  },
  uploads: {
    maxSize: 10485760,
    path: '~/uploads'
  },
  messenger: {
    concurrency: 2,
    interval: 30000,
    smtp: {
      incoming: {
        host: '0.0.0.0',
        port: 25,
        securePort: 587
      },
      outgoing: {
        host: 'localhost',
        port: 25
      }
    }
  }
};
