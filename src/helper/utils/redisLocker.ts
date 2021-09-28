import { default as Warlock } from 'node-redis-warlock'
import { RedisClient } from 'redis';
import { v4 as uuidv4 } from 'uuid'

const PREFIX = 'WX-OPEN-SERVICE-LOCKER'
const TTL = 5000;
const MAX_ATTEMPTS = 4; // Max number of times to try setting the lock before erroring
const WAIT = 1000; // Time to wait before another attempt if lock already in place

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
    private debug: boolean;
    private lockerKey: string;
    private logger: any;

    constructor(client: RedisClient, appId = '', debug= false, logger= consoleLogger) {
        this.locker = Warlock(client);
        this.debug = debug;
        this.logger = logger;
        this.lockerKey = appId ? [PREFIX, appId].join('-') : PREFIX;
    }

    async acquireLocker() {
        const uuid = uuidv4()
        const start = Date.now()
        
        if(this.debug) {
            this.logger.debug(`locker:${uuid} start acquire locker`)
        }

        return new Promise((resolve) => {
            this.locker.optimistic(this.lockerKey, TTL, MAX_ATTEMPTS, WAIT, (err, unlock) => {
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