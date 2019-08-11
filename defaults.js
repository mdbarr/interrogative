module.exports = {
  name: 'Interrogative',
  container: {
    port: 1311,
    host: '0.0.0.0',
    home: process.env.INTERROGATIVE_HOME || process.env.HOME
  }
};
