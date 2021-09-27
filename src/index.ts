import ComponentService from './helper/component-service';
import tokenStore from './tokenStore/index';
// import { ClientOpts } from 'redis';
import xmlMiddleWare from './helper/xml.koa-middleware';
import RedisLocker from './helper/utils/redisLocker';

// interface WX_C_Config {
//   componentAppId: string;
//   componentAppSecret: string;
//   token: string;
//   encodingAESKey: string;
// }

export interface wxc extends ComponentService { }

// export default function wxComponentService(app: any,
//     wxConfig: WX_C_Config,
//     storeConfig?: ClientOpts,
// ) {
//   let store: any = new tokenStore.MemoryStore();

//   if (storeConfig) {
//     store = new tokenStore.RedisStore(storeConfig);
//   }

//   const wxcCtx = new ComponentService(wxConfig, store);
//   const wxcMiddleware = async (ctx, next) => {
//     ctx.wxc = wxcCtx;
//     await next();
//   };
//   app.use(xmlMiddleWare);
//   app.use(wxcMiddleware);
// }

const wxComponentService =(strapi) => {
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
        typeof settings.wxConfig === 'undefined' || 
        typeof settings.storeConfig === 'undefined'
      ) {
        strapi.log.error(settingErrorLog)
      } else {
        // Initialise WxOpen SDK
        // init({ ...settings, environment })
        // let store: any = new tokenStore.MemoryStore();

        let store = new tokenStore.RedisStore(settings.storeConfig);
        let locker = new RedisLocker(store.client, debug, strapi.log)

        const wxcCtx = new ComponentService(settings.wxConfig, store, locker);
        strapi.wxc = wxcCtx;
        // const wxcMiddleware = async (ctx, next) => {
        //   ctx.wxc = wxcCtx;
        //   await next();
        // };
        strapi.app.use(xmlMiddleWare);
        // strapi.app.use(wxcMiddleware);

        // IF debug mode is on, let the user know if middleware was initialised
        if (debug) {
          strapi.log.info(middlewareInitialisedLog)
        }
      }
    },
  }
}

module.exports = wxComponentService