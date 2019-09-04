module.exports = {
  name: 'Interrogative',
  manager: {
    port: 1311,
    host: '0.0.0.0',
    storage: '/interrogative/interviews',
    bootstrap: true,
    engine: { socketPath: '/var/run/docker.sock' }
  },
  metadata: {
    port: 1312,
    host: '0.0.0.0'
  },
  container: {
    port: 1313,
    host: '0.0.0.0',
    ttl: 720000,
    heartbeat: 30000
  },
  interaction: {
    port: 1314,
    host: '127.0.0.1'
  },
  uploads: {
    maxSize: 10485760,
    path: '~/uploads'
  }
};
