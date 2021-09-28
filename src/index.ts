import ComponentController from './helper/componentController';
import xmlMiddleWare from './helper/xml.koa-middleware';

export interface wxc extends ComponentController { }

const wxComponentService = (strapi) => {
  const middlewareName = 'wxopen'
  const middlewareInitialisedLog = `${middlewareName} middleware has been initialised.`
  const settingErrorLog = `${middlewareName} middleware configuration must contain a "settings" object. This object must contain at least the wxConfig property to initialise wxOpen SDK. Check the config/environments/**/middleware.json file.`

  return {
    initialize() {
      // Get Strapi level middleware settings
      const strapiMiddlewareSettings = strapi.config.middleware.settings
      const { debug, settings } = strapiMiddlewareSettings[middlewareName]
      // const environment = strapi.config.environment

      if (
        typeof settings === 'undefined' ||
        typeof settings.wxConfig === 'undefined'
      ) {
        strapi.log.error(settingErrorLog)
      } else {
        const wxcCtx = new ComponentController(settings.wxConfig, settings.storeConfig, strapi, debug);
        strapi.wxc = wxcCtx;
        strapi.app.use(xmlMiddleWare);

        // IF debug mode is on, let the user know if middleware was initialised
        if (debug) {
          strapi.log.info(middlewareInitialisedLog)
        }
      }
    },
  }
}

module.exports = wxComponentService