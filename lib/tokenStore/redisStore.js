"use strict";
exports.__esModule = true;
var redisStore = (function () {
    function redisStore(client) {
        this.client = client;
    }
    redisStore.prototype.get = function (key) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.client.get(key, function (err, reply) {
                !err ? resolve(reply) : reject(err);
            });
        });
    };
    redisStore.prototype.set = function (key, value, expire) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (expire) {
                _this.client.psetex(key, expire, value, function (err, reply) {
                    !err ? resolve(reply) : reject(err);
                });
            }
            else {
                _this.client.set(key, value, function (err, reply) {
                    !err ? resolve(reply) : reject(err);
                });
            }
        });
    };
    redisStore.prototype["delete"] = function (key) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.client.del(key, function (err, reply) {
                !err ? resolve(reply) : reject(err);
            });
        });
    };
    return redisStore;
}());
exports["default"] = redisStore;
//# sourceMappingURL=redisStore.js.map