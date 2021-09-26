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
var componentAPI_1 = require("./componentAPI");
var wxMsgCrypt_1 = __importDefault(require("./utils/wxMsgCrypt"));
var xml_js_1 = require("xml-js");
var ComponetService = (function () {
    function ComponetService(componetConfig, store) {
        this.store = store;
        this.store = store;
        Object.assign(this, componetConfig);
    }
    ComponetService.prototype.decodeTicket = function (body) {
        return __awaiter(this, void 0, void 0, function () {
            var wxMsgCrypt, encryptData, decodedXml, decodedJson;
            return __generator(this, function (_a) {
                wxMsgCrypt = new wxMsgCrypt_1["default"]({
                    appid: this.componentAppId,
                    token: this.token,
                    encodingAESKey: this.encodingAESKey
                });
                encryptData = (0, xml_js_1.xml2js)(body, { compact: true }).
                    xml.Encrypt._cdata;
                decodedXml = wxMsgCrypt.decode(encryptData);
                decodedJson = (0, xml_js_1.xml2js)(decodedXml, { compact: true });
                return [2, decodedJson];
            });
        });
    };
    ComponetService.prototype.setComponentVerifyTicket = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.store.set('component_verify_ticket', data)];
                    case 1:
                        _a.sent();
                        return [2];
                }
            });
        });
    };
    ComponetService.prototype.getComponentVerifyTicket = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, this.store.get('component_verify_ticket')];
            });
        });
    };
    ComponetService.prototype.getComponentAccessToken = function () {
        return __awaiter(this, void 0, void 0, function () {
            var key, componentAccessToken, component_verify_ticket, _a, newComponentAccessToken, expires_in;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        key = "component_access_token";
                        return [4, this.store.get(key)];
                    case 1:
                        componentAccessToken = _b.sent();
                        if (componentAccessToken)
                            return [2, componentAccessToken];
                        return [4, this.getComponentVerifyTicket()];
                    case 2:
                        component_verify_ticket = _b.sent();
                        return [4, (0, componentAPI_1.fetchComponentAccessToken)({
                                component_appid: this.componentAppId,
                                component_appsecret: this.componentAppSecret,
                                component_verify_ticket: component_verify_ticket
                            })];
                    case 3:
                        _a = _b.sent(), newComponentAccessToken = _a.component_access_token, expires_in = _a.expires_in;
                        return [4, this.store.set(key, newComponentAccessToken, expires_in)];
                    case 4:
                        _b.sent();
                        return [2, newComponentAccessToken];
                }
            });
        });
    };
    ComponetService.prototype.getPreAuthCode = function () {
        return __awaiter(this, void 0, void 0, function () {
            var key, componentPreCode, component_access_token, _a, newAuthCode, expires_in;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        key = "component_pre_code";
                        return [4, this.store.get(key)];
                    case 1:
                        componentPreCode = _b.sent();
                        if (componentPreCode)
                            return [2, componentPreCode];
                        return [4, this.getComponentAccessToken()];
                    case 2:
                        component_access_token = _b.sent();
                        return [4, (0, componentAPI_1.fetchPreAuthCode)({
                                component_appid: this.componentAppId,
                                component_access_token: component_access_token
                            })];
                    case 3:
                        _a = _b.sent(), newAuthCode = _a.pre_auth_code, expires_in = _a.expires_in;
                        return [4, this.store.set(key, newAuthCode, expires_in)];
                    case 4:
                        _b.sent();
                        return [2, newAuthCode];
                }
            });
        });
    };
    ComponetService.prototype.getAuthorizationUrl = function (redirectUri, auth_type) {
        return __awaiter(this, void 0, void 0, function () {
            var preAuthCode, url;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.getPreAuthCode()];
                    case 1:
                        preAuthCode = _a.sent();
                        url = "https://mp.weixin.qq.com/cgi-bin/componentloginpage?component_appid=" + this.componentAppId + "&pre_auth_code=" + preAuthCode + "&redirect_uri=" + redirectUri + "&auth_type=" + auth_type;
                        return [2, url];
                }
            });
        });
    };
    ComponetService.prototype.setAppAccessToken = function (authorization_code) {
        return __awaiter(this, void 0, void 0, function () {
            var component_access_token, _a, authorizer_access_token, authorizer_appid, authorizer_refresh_token, expires_in, RTkey, ATkey;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4, this.getComponentAccessToken()];
                    case 1:
                        component_access_token = _b.sent();
                        return [4, (0, componentAPI_1.fetchAppAccessToken)({
                                component_appid: this.componentAppId,
                                component_access_token: component_access_token,
                                authorization_code: authorization_code
                            })];
                    case 2:
                        _a = _b.sent(), authorizer_access_token = _a.authorizer_access_token, authorizer_appid = _a.authorizer_appid, authorizer_refresh_token = _a.authorizer_refresh_token, expires_in = _a.expires_in;
                        RTkey = "RT:" + authorizer_appid;
                        ATkey = "AT:" + authorizer_appid;
                        this.store.set(RTkey, authorizer_refresh_token);
                        this.store.set(ATkey, authorizer_access_token, expires_in);
                        return [2];
                }
            });
        });
    };
    ComponetService.prototype.getAppAcccessToken = function (authorizer_appid) {
        return __awaiter(this, void 0, void 0, function () {
            var key, ATkey, RTkey, appAcccessToken, authorizer_refresh_token, component_access_token, _a, newAT, expires_in;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        key = "component_pre_code";
                        ATkey = "AT:" + authorizer_appid;
                        RTkey = "RT:" + authorizer_appid;
                        return [4, this.store.get(ATkey)];
                    case 1:
                        appAcccessToken = _b.sent();
                        return [4, this.store.get(RTkey)];
                    case 2:
                        authorizer_refresh_token = _b.sent();
                        if (appAcccessToken)
                            return [2, appAcccessToken];
                        return [4, this.getComponentAccessToken()];
                    case 3:
                        component_access_token = _b.sent();
                        return [4, (0, componentAPI_1.fetchAppAccessTokenByRT)({
                                component_appid: this.componentAppId,
                                component_access_token: component_access_token,
                                authorizer_appid: authorizer_appid,
                                authorizer_refresh_token: authorizer_refresh_token
                            })];
                    case 4:
                        _a = _b.sent(), newAT = _a.authorizer_access_token, expires_in = _a.expires_in;
                        return [4, this.store.set(key, newAT, expires_in)];
                    case 5:
                        _b.sent();
                        return [2, newAT];
                }
            });
        });
    };
    ComponetService.prototype.getAuthorizerList = function (offset, count) {
        if (offset === void 0) { offset = 0; }
        if (count === void 0) { count = 500; }
        return __awaiter(this, void 0, void 0, function () {
            var component_access_token;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.getComponentAccessToken()];
                    case 1:
                        component_access_token = _a.sent();
                        return [2, (0, componentAPI_1.fetchAuthorizerList)({
                                component_appid: this.componentAppId,
                                component_access_token: component_access_token,
                                offset: offset,
                                count: count
                            })];
                }
            });
        });
    };
    return ComponetService;
}());
exports["default"] = ComponetService;
//# sourceMappingURL=component-service.js.map