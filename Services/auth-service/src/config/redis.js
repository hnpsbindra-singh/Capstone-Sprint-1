const Redis = require('ioredis');
const config = require('./env');

const redisOptions = {
  host: config.redis.host,
  port: config.redis.port,
  username: config.redis.username,
  lazyConnect: true,
  maxRetriesPerRequest: 3,
};

if (config.redis.password) {
  redisOptions.password = config.redis.password;
}

if (config.redis.tls) {
  redisOptions.tls = config.redis.tls;
}

const redis = new Redis(redisOptions);

redis.on('connect', () => console.log('[Redis] Connected successfully'));
redis.on('error', (err) => console.error('[Redis] Error:', err.message));

module.exports = redis;
