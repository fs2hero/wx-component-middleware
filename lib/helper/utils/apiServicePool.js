"use strict";
exports.__esModule = true;
var ApiServicePool = (function () {
    function ApiServicePool() {
        this.map = new Map();
    }
    ApiServicePool.prototype.get = function (key) {
        return this.map.get(key);
    };
    ApiServicePool.prototype.set = function (key, value) {
        return this.map.set(key, value);
    };
    ApiServicePool.prototype.remove = function (key) {
        return this.map["delete"](key);
    };
    return ApiServicePool;
}());
exports["default"] = ApiServicePool;
//# sourceMappingURL=apiServicePool.js.map