import { default as Warlock } from 'node-redis-warlock'
import { RedisClient } from 'redis';
import { v4 as uuidv4 } from 'uuid'


const key = 'opt-lock';
const ttl = 5000;
const maxAttempts = 4; // Max number of times to try setting the lock before erroring
const wait = 1000; // Time to wait before another attempt if lock already in place

const consoleLogger = {
    debug(...args) {
        console.log.apply(console, args)
    },
    error(...args) {
        console.log.apply(console, args)
    }
}

export default class RedisLocker {
    // private client: RedisClient;
    private locker: Warlock;
    private debug: boolean = false;

    constructor(client: RedisClient, debug=false, private logger= consoleLogger) {
        this.locker = Warlock(client);
        this.debug = debug;
    }

    async acquireLocker() {
        const uuid = uuidv4()
        const start = Date.now()
        
        if(this.debug) {
            this.logger.debug(`locker:${uuid} start acquire locker`)
        }

        return new Promise((resolve) => {
            this.locker.optimistic(key, ttl, maxAttempts, wait, (err, unlock) => {
                // console.log("callback1 ", err, ' unlock ', unlock)
                if(this.debug) {
                    this.logger.debug(`locker:${uuid} end acquire locker - ${Date.now()-start},`)
                }

                if (err) {
                    if(this.debug) {
                        this.logger.error(`locker:${uuid} acquire locker error - ${Date.now()-start},`,err)
                    }

                    resolve(null)
                    return
                }

                const unlockFun = () => {
                    if(this.debug) {
                        this.logger.debug(`locker:${uuid} release locker - ${Date.now()-start},`)
                    }

                    unlock()
                }
                resolve(unlockFun)
            });
        })
    }
}