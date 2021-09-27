import redis from 'redis';
import { configuration } from '../config';
import { LoggerService } from '../logger.service';

export class RedisService {
  client: redis.RedisClient;

  constructor() {
    this.client = redis.createClient({
      db: configuration.redis.db,
      host: configuration.redis.host,
      port: configuration.redis.port,
      auth_pass: configuration.redis.auth,
    });

    if (this.client.connected) {
      LoggerService.log('✅ Redis connection is ready');
    } else {
      LoggerService.error('❌ Redis connection is not ready');
      throw new Error('Redis connection error');
    }
  }

  getJson(key: string): void {
    this.client.get(key, (err, reply) => {
      if (err) {
        LoggerService.error('Error while getting key from redis with message:', err, 'RedisService');
      }
      return reply;
    });
  }

  setJson(key: string, value: string): void {
    this.client.set(key, value, (err, reply) => {
      if (err) {
        LoggerService.error('Error while setting key to redis with message:', err, 'RedisService');
      }
      return reply;
    });
  }

  deleteKey(key: string): void {
    this.client.del(key, (err, reply) => {
      if (err) {
        LoggerService.error('Error while deleting key from redis with message:', err, 'RedisService');
      }
      return reply;
    });
  }
}
