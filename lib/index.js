"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var componentController_1 = __importDefault(require("./helper/componentController"));
var xml_koa_middleware_1 = __importDefault(require("./helper/xml.koa-middleware"));
var wxComponentService = function (strapi) {
    var middlewareName = 'wxopen';
    var middlewareInitialisedLog = middlewareName + " middleware has been initialised.";
    var settingErrorLog = middlewareName + " middleware configuration must contain a \"settings\" object. This object must contain at least the wxConfig property to initialise wxOpen SDK. Check the config/environments/**/middleware.json file.";
    return {
        initialize: function () {
            var strapiMiddlewareSettings = strapi.config.middleware.settings;
            var _a = strapiMiddlewareSettings[middlewareName], debug = _a.debug, settings = _a.settings;
            if (typeof settings === 'undefined' ||
                typeof settings.wxConfig === 'undefined') {
                strapi.log.error(settingErrorLog);
            }
            else {
                var wxcCtx = new componentController_1["default"](settings.wxConfig, settings.storeConfig, strapi, debug);
                strapi.wxc = wxcCtx;
                strapi.app.use(xml_koa_middleware_1["default"]);
                if (debug) {
                    strapi.log.info(middlewareInitialisedLog);
                }
            }
        }
    };
};
module.exports = wxComponentService;
//# sourceMappingURL=index.js.map