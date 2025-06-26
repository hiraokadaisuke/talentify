const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongo;

async function initTestApp() {
  mongo = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongo.getUri();
  process.env.JWT_SECRET = 'testsecret';
  process.env.PORT = 3001;
  const app = require('../app');
  return app;
}

async function shutdown() {
  await mongoose.connection.close();
  if (mongo) await mongo.stop();
}

module.exports = { initTestApp, shutdown };
