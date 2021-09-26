"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var redisStore_1 = __importDefault(require("./redisStore"));
var memoryStore_1 = __importDefault(require("./memoryStore"));
exports["default"] = {
    RedisStore: redisStore_1["default"],
    MemoryStore: memoryStore_1["default"]
};
//# sourceMappingURL=index.js.map