module.exports = {
  name: 'Interrogative',
  manager: {
    port: 1311,
    host: '0.0.0.0',
    interviews: './interviews'
  },
  metadata: {
    port: 1312,
    host: '0.0.0.0'
  },
  container: {
    port: 1313,
    host: '0.0.0.0',
    home: process.env.INTERROGATIVE_HOME || process.env.HOME,
    open: [
      'README.md'
    ],
    git: {
      enabled: true,
      repository: process.env.INTERROGATIVE_HOME || process.env.HOME,
      limit: 100
    }
  }
};
