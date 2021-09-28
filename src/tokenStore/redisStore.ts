import { RedisClient } from 'redis';
import {Store} from './types';
class redisStore implements Store {
  private client: RedisClient;

  constructor(client: RedisClient) {
    this.client = client;
  }

  get(key: string) {
    return new Promise((resolve, reject) => {
      this.client.get(key, (err, reply) => {
        resolve(reply);
        reject(err);
      });
    });
  }
  set(key: string, value: string, expire?: number) {
    return new Promise((resolve, reject) => {
      if (expire) {
        this.client.setex(key, expire, value, (err, reply) => {
          resolve(reply);
          reject(err);
        });
      } else {
        this.client.set(key, value, (err, reply) => {
          resolve(reply);
          reject(err);
        });
      }
    });
  }
}

export default redisStore;
