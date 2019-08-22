module.exports = {
  name: 'Interrogative',
  manager: {
    port: 1311,
    host: '0.0.0.0',
    storage: '/interrogative/interviews',
    bootstrap: true
  },
  metadata: {
    port: 1312,
    host: '0.0.0.0'
  },
  container: {
    port: 1313,
    host: '0.0.0.0'
  }
};
