"use strict";
exports.__esModule = true;
var redis_1 = require("redis");
var redisStore = (function () {
    function redisStore(config) {
        this.client = (0, redis_1.createClient)(config);
    }
    redisStore.prototype.get = function (key) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.client.get(key, function (err, reply) {
                resolve(reply);
                reject(err);
            });
        });
    };
    redisStore.prototype.set = function (key, value, expire) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (expire) {
                _this.client.setex(key, expire, value, function (err, reply) {
                    resolve(reply);
                    reject(err);
                });
            }
            else {
                _this.client.set(key, value, function (err, reply) {
                    resolve(reply);
                    reject(err);
                });
            }
        });
    };
    return redisStore;
}());
exports["default"] = redisStore;
//# sourceMappingURL=redisStore.js.map