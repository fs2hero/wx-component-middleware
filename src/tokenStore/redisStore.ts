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
        !err ? resolve(reply) : reject(err);
      });
    });
  }
  set(key: string, value: string, expire?: number) {
    return new Promise((resolve, reject) => {
      if (expire) {
        this.client.psetex(key, expire, value, (err, reply) => {
          !err ? resolve(reply) : reject(err);
        });
      } else {
        this.client.set(key, value, (err, reply) => {
          !err ? resolve(reply) : reject(err);
        });
      }
    });
  }
  delete(key: string) {
    return new Promise((resolve, reject) => {
      this.client.del(key, (err, reply) => {
        !err ? resolve(reply) : reject(err);
      });
    });
  }
}

export default redisStore;
