"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var API = require("open-weixin-api");
var redis_1 = require("redis");
var apiServicePool_1 = __importDefault(require("./utils/apiServicePool"));
var index_1 = __importDefault(require("../tokenStore/index"));
var redisLocker_1 = __importDefault(require("./utils/redisLocker"));
var COMPONENT_TOKEN_ID = 'WX_OPEND_COMPONENT_TOKEN_ID';
var COMPONENT_VERIFY_TICKET_ID = 'WX_OPEND_COMPONENT_VERIFY_TICKET_ID';
var COMPONENT_AUTHORIZER_TOKEN_ID = 'WX_OPEND_AUTHORIZER_TOKEN_ID';
var COMPONENT_AUTHORIZER_REFRESH_TOKEN_ID = 'WX_OPEND_AUTHORIZER_REFRESH_TOKEN_ID';
var ComponentController = (function () {
    function ComponentController(componetConfig, storeConfig, strapi, debug) {
        Object.assign(this, componetConfig);
        var store = new index_1["default"].MemoryStore();
        if (storeConfig) {
            this.client = (0, redis_1.createClient)(storeConfig);
            store = new index_1["default"].RedisStore(this.client);
        }
        this.store = store;
        this.apiServicePool = new apiServicePool_1["default"]();
        this.debug = debug;
        this.strapi = strapi;
        this.wxMsgCrypt = new API.WXBizMsgCrypt(this.componentAppId, this.token, this.encodingAESKey);
    }
    ComponentController.prototype.setValue = function (key, value, expire) {
        return __awaiter(this, void 0, void 0, function () {
            var expire_in;
            return __generator(this, function (_a) {
                if (!!expire && expire > Date.now()) {
                    expire_in = expire - Date.now();
                }
                return [2, this.store.set(key, value, expire_in)];
            });
        });
    };
    ComponentController.prototype.getValue = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, this.store.get(key)];
            });
        });
    };
    ComponentController.prototype.delValue = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, this.store["delete"](key)];
            });
        });
    };
    ComponentController.prototype.getCrypto = function () {
        return this.wxMsgCrypt;
    };
    ComponentController.prototype.setFetchAuthorizerRefreshTokenCb = function (cb) {
        this.fetchAuthorizerRefreshToken = cb;
    };
    ComponentController.prototype.setRequestSpeedHook = function (hook) {
        this.requestSpeedHook = hook;
    };
    ComponentController.prototype.setAuthorizerToken = function (authAppId, authToken, expireTime) {
        return __awaiter(this, void 0, void 0, function () {
            var key;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        key = COMPONENT_AUTHORIZER_TOKEN_ID + ":" + authAppId;
                        if (!!authToken) return [3, 1];
                        this.delValue(key);
                        return [3, 3];
                    case 1: return [4, this.setValue(key, JSON.stringify({ accessToken: authToken, expireTime: expireTime }), expireTime)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2];
                }
            });
        });
    };
    ComponentController.prototype.setAuthorizerRefreshToken = function (authAppId, authRefreshToken) {
        return __awaiter(this, void 0, void 0, function () {
            var key;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        key = COMPONENT_AUTHORIZER_REFRESH_TOKEN_ID + ":" + authAppId;
                        if (!!authRefreshToken) return [3, 1];
                        this.delValue(key);
                        return [3, 3];
                    case 1: return [4, this.setValue(key, authRefreshToken)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2];
                }
            });
        });
    };
    ComponentController.prototype.setComponentVerifyTicket = function (body) {
        return __awaiter(this, void 0, void 0, function () {
            var wxMsgCrypt, bodyObj, encryptData, decodedXml, decodedJson, ticket;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        wxMsgCrypt = this.wxMsgCrypt;
                        return [4, wxMsgCrypt.xml2obj(body)];
                    case 1:
                        bodyObj = _a.sent();
                        encryptData = bodyObj.xml.Encrypt;
                        decodedXml = wxMsgCrypt.decrypt(encryptData);
                        return [4, wxMsgCrypt.xml2obj(decodedXml)];
                    case 2:
                        decodedJson = _a.sent();
                        ticket = decodedJson.xml.ComponentVerifyTicket;
                        if (!(decodedJson.xml.InfoType === 'component_verify_ticket')) return [3, 4];
                        return [4, this.setValue(COMPONENT_VERIFY_TICKET_ID, ticket)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2, decodedJson];
                }
            });
        });
    };
    ComponentController.prototype.genAuthorizationUrl = function (preAuthCode, redirectUri, isPC, auth_type, biz_appid) {
        return __awaiter(this, void 0, void 0, function () {
            var url;
            return __generator(this, function (_a) {
                url = '';
                if (isPC) {
                    url = "https://mp.weixin.qq.com/cgi-bin/componentloginpage?component_appid=" + this.componentAppId + "&pre_auth_code=" + preAuthCode + "&redirect_uri=" + redirectUri;
                    if (typeof auth_type !== 'undefined') {
                        url += "&auth_type=" + auth_type;
                    }
                    if (typeof biz_appid !== 'undefined') {
                        url += "&biz_appid=" + biz_appid;
                    }
                }
                else {
                    url = "https://mp.weixin.qq.com/safe/bindcomponent?action=bindcomponent&no_scan=1&component_appid=" + this.componentAppId + "&pre_auth_code=" + preAuthCode + "&redirect_uri=" + redirectUri;
                    if (typeof auth_type !== 'undefined') {
                        url += "&auth_type=" + auth_type;
                    }
                    if (typeof biz_appid !== 'undefined') {
                        url += "&biz_appid=" + biz_appid;
                    }
                    url += '#wechat_redirect';
                }
                return [2, url];
            });
        });
    };
    ComponentController.prototype.getApiService = function (authAppid) {
        return __awaiter(this, void 0, void 0, function () {
            var apiService;
            return __generator(this, function (_a) {
                apiService = this.apiServicePool.get(authAppid);
                if (!apiService) {
                    apiService = this.apiServiceFactory(authAppid);
                    this.apiServicePool.set(authAppid, apiService);
                }
                return [2, apiService];
            });
        });
    };
    ComponentController.prototype.apiServiceFactory = function (authAppid) {
        var _this = this;
        var getComponentToken = function () { return __awaiter(_this, void 0, void 0, function () {
            var res, obj;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.getValue(COMPONENT_TOKEN_ID)];
                    case 1:
                        res = _a.sent();
                        if (!res) {
                            return [2, null];
                        }
                        obj = JSON.parse(res);
                        return [2, obj];
                }
            });
        }); };
        var saveComponentToken = function (componentToken) { return __awaiter(_this, void 0, void 0, function () {
            var componentAccessToken, expireTime;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        componentAccessToken = componentToken.componentAccessToken;
                        expireTime = componentToken.expireTime;
                        return [4, this.setValue(COMPONENT_TOKEN_ID, JSON.stringify({ componentAccessToken: componentAccessToken, expireTime: expireTime }), expireTime)];
                    case 1:
                        _a.sent();
                        return [2];
                }
            });
        }); };
        var getToken = function (authorizerAppid) { return __awaiter(_this, void 0, void 0, function () {
            var key, res, obj;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        key = COMPONENT_AUTHORIZER_TOKEN_ID + ":" + authorizerAppid;
                        return [4, this.getValue(key)];
                    case 1:
                        res = _a.sent();
                        if (!res) {
                            return [2, null];
                        }
                        obj = JSON.parse(res);
                        return [2, obj];
                }
            });
        }); };
        var saveToken = function (authorizerAppid, token) { return __awaiter(_this, void 0, void 0, function () {
            var accessToken, expireTime;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        accessToken = token.accessToken;
                        expireTime = token.expireTime;
                        return [4, this.setAuthorizerToken(authorizerAppid, accessToken, expireTime)];
                    case 1:
                        _a.sent();
                        return [2];
                }
            });
        }); };
        var getAuthorizerRefreshToken = function (authorizerAppid) { return __awaiter(_this, void 0, void 0, function () {
            var key, res, authorizer_refresh_token;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        key = COMPONENT_AUTHORIZER_REFRESH_TOKEN_ID + ":" + authorizerAppid;
                        return [4, this.getValue(key)];
                    case 1:
                        res = _a.sent();
                        if (!!res) return [3, 6];
                        authorizer_refresh_token = '';
                        if (!this.fetchAuthorizerRefreshToken) return [3, 3];
                        return [4, this.fetchAuthorizerRefreshToken(authorizerAppid)];
                    case 2:
                        authorizer_refresh_token = _a.sent();
                        _a.label = 3;
                    case 3:
                        if (!authorizer_refresh_token) return [3, 5];
                        return [4, this.setValue(key, authorizer_refresh_token)];
                    case 4:
                        _a.sent();
                        res = authorizer_refresh_token;
                        return [3, 6];
                    case 5: return [2, null];
                    case 6: return [2, res];
                }
            });
        }); };
        var getComponentVerifyTicket = function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, this.getValue(COMPONENT_VERIFY_TICKET_ID)];
            });
        }); };
        var locker = new redisLocker_1["default"](this.client, authAppid, this.debug, this.strapi.log);
        var acquiredLocker = function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, locker.acquireLocker()];
            });
        }); };
        var apiService = new API(this.componentAppId, this.componentAppSecret, '', authAppid, '', getComponentToken, saveComponentToken, getToken, saveToken, getAuthorizerRefreshToken, getComponentVerifyTicket, acquiredLocker);
        apiService.setRequestSpeedHook(this.requestSpeedHook);
        return apiService;
    };
    return ComponentController;
}());
exports["default"] = ComponentController;
//# sourceMappingURL=componentController.js.map