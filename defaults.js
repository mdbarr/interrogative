module.exports = {
  name: 'Interrogative',
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
  sessions: { cookie: 'dapper-session' },
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
    openMaxSize: 262144
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
    smtp: {
      port: 25,
      securePort: 587,
      host: '0.0.0.0',
      domain: 'interrogative.io'
    },
    intervals: {
      registration: 10000,
      invitation: 300000,
      reminder: 300000
    }
  }
};
