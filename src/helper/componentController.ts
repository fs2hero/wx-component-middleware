import API = require('open-weixin-api');
import { ClientOpts, createClient, RedisClient } from 'redis';
import { Store } from '../tokenStore/types';
import ApiInstancePool from './utils/apiServicePool';
import tokenStore from '../tokenStore/index';
import RedisLocker from './utils/redisLocker';

interface WX_C_Config {
  componentAppId: string;
  componentAppSecret: string;
  token: string;
  encodingAESKey: string;
}

const COMPONENT_TOKEN_ID = 'WX_OPEND_COMPONENT_TOKEN_ID'
const COMPONENT_VERIFY_TICKET_ID = 'WX_OPEND_COMPONENT_VERIFY_TICKET_ID'
const COMPONENT_AUTHORIZER_TOKEN_ID = 'WX_OPEND_AUTHORIZER_TOKEN_ID'
const COMPONENT_AUTHORIZER_REFRESH_TOKEN_ID = 'WX_OPEND_AUTHORIZER_REFRESH_TOKEN_ID'

export default class ComponentController {
  componentAppId: string;
  componentAppSecret: string;
  token: string;
  encodingAESKey: string;
  apiServicePool: ApiInstancePool;
  store: Store
  client: RedisClient;
  debug: boolean;
  strapi: any;
  wxMsgCrypt: any;
  fetchAuthorizerRefreshToken: (authorizerAppid) => Promise<string>;
  requestSpeedHook:(authorizerAppid, time, url, options, error) => void;

  constructor(componetConfig: WX_C_Config, storeConfig: ClientOpts, strapi: any, debug: boolean) {
    Object.assign(this, componetConfig);

    let store: any = new tokenStore.MemoryStore();

    if (storeConfig) {
      this.client = createClient(storeConfig)
      store = new tokenStore.RedisStore(this.client);
      // locker = new RedisLocker(store.client, debug, strapi.log)
    }
    this.store = store;
    this.apiServicePool = new ApiInstancePool()
    this.debug = debug
    this.strapi = strapi
    this.wxMsgCrypt = new API.WXBizMsgCrypt(this.componentAppId, this.token, this.encodingAESKey)
  }

  async setValue(key, value, expire?:number) {
    let expire_in;
    if(!!expire && expire > Date.now()) {
      expire_in = expire - Date.now()
    }
    return this.store.set(key, value, expire_in)
  }

  async getValue(key) {
    return this.store.get(key)
  }

  async delValue(key) {
    return this.store.delete(key)
  }

  getCrypto() {
    return this.wxMsgCrypt
  }

  setFetchAuthorizerRefreshTokenCb( cb: (authorizerAppid) => Promise<string>) {
    this.fetchAuthorizerRefreshToken = cb
  }

  setRequestSpeedHook( hook: (authorizerAppid, time, url, options, error) => void) {
    this.requestSpeedHook = hook
  }

  async setAuthorizerToken( authAppId: string, authToken?:string, expireTime?:number ) {
    const key = `${COMPONENT_AUTHORIZER_TOKEN_ID}:${authAppId}`

    if(!authToken) {
      await this.delValue(key)
    }
    else {
      await this.setValue(key, JSON.stringify({ accessToken: authToken, expireTime }), expireTime)
    }
  }

  async setAuthorizerRefreshToken( authAppId: string, authRefreshToken?:string) {
    const key = `${COMPONENT_AUTHORIZER_REFRESH_TOKEN_ID}:${authAppId}`

    if(!authRefreshToken) {
      this.delValue(key)
    }
    else {
      await this.setValue(key, authRefreshToken)
    }
  }

  async setComponentVerifyTicket(body) {
    const wxMsgCrypt = this.wxMsgCrypt
    const bodyObj = await wxMsgCrypt.xml2obj(body)
    const encryptData = bodyObj.xml.Encrypt;
    const decodedXml = wxMsgCrypt.decrypt(encryptData);
    const decodedJson:any = await wxMsgCrypt.xml2obj(decodedXml);
    const ticket = decodedJson.xml.ComponentVerifyTicket;

    if(decodedJson.xml.InfoType === 'component_verify_ticket') {
      await this.setValue(COMPONENT_VERIFY_TICKET_ID, ticket);
    }

    return decodedJson;
  }

  async genAuthorizationUrl(preAuthCode: string, redirectUri: string, isPC?:boolean, auth_type?: number, biz_appid?:string) {
    // const preAuthCode = await this.getPreAuthCode();
    // eslint-disable-next-line max-len
    let url = ''
    
    if(isPC) {
      url = `https://mp.weixin.qq.com/cgi-bin/componentloginpage?component_appid=${this.componentAppId}&pre_auth_code=${preAuthCode}&redirect_uri=${redirectUri}`;
      
      if(typeof auth_type !== 'undefined') {
        url += `&auth_type=${auth_type}`
      }

      if(typeof biz_appid !== 'undefined') {
        url += `&biz_appid=${biz_appid}`
      }
    }
    else {
      url = `https://mp.weixin.qq.com/safe/bindcomponent?action=bindcomponent&no_scan=1&component_appid=${this.componentAppId}&pre_auth_code=${preAuthCode}&redirect_uri=${redirectUri}`
      
      if(typeof auth_type !== 'undefined') {
        url += `&auth_type=${auth_type}`
      }

      if(typeof biz_appid !== 'undefined') {
        url += `&biz_appid=${biz_appid}`
      }

      url += '#wechat_redirect'
    }
    
    return url;
  }

  async getApiService(authAppid: string) {
    let apiService = this.apiServicePool.get(authAppid)

    if (!apiService) {
      apiService = this.apiServiceFactory(authAppid)
      this.apiServicePool.set(authAppid, apiService)
    }

    return apiService;
  }

  apiServiceFactory(authAppid: string) {

    const getComponentToken = async () => {
      let res = await this.getValue(COMPONENT_TOKEN_ID)
      if (!res) {
        return null
      }

      let obj = JSON.parse(res)
      return obj;
    };

    const saveComponentToken = async (componentToken) => {
      if(!componentToken) {
        await this.delValue(COMPONENT_TOKEN_ID)
      }
      else {
        const componentAccessToken = componentToken.componentAccessToken
        const expireTime = componentToken.expireTime
        await this.setValue(COMPONENT_TOKEN_ID, JSON.stringify({ componentAccessToken, expireTime }), expireTime)
      }
    };

    const getToken = async (authorizerAppid) => {
      const key = `${COMPONENT_AUTHORIZER_TOKEN_ID}:${authorizerAppid}`
      let res = await this.getValue(key)
      if (!res) {
        return null
      }

      let obj = JSON.parse(res)
      return obj;
    };

    const saveToken = async (authorizerAppid, token) => {

      if(!token) {
        await this.setAuthorizerToken(authorizerAppid)
      } else {
        const accessToken = token.accessToken
        const expireTime = token.expireTime

        // await this.setValue(key, JSON.stringify({ accessToken, expireTime }), expireTime)
        await this.setAuthorizerToken(authorizerAppid, accessToken, expireTime)
      }
    };

    const getAuthorizerRefreshToken = async (authorizerAppid) => {
      const key = `${COMPONENT_AUTHORIZER_REFRESH_TOKEN_ID}:${authorizerAppid}`

      let res = await this.getValue(key)

      if (!res) {
        let authorizer_refresh_token = ''
        if (this.fetchAuthorizerRefreshToken) {
          authorizer_refresh_token = await this.fetchAuthorizerRefreshToken(authorizerAppid)
        }

        if (authorizer_refresh_token) {
          await this.setValue(key, authorizer_refresh_token)
          res = authorizer_refresh_token
        }
        else {
          return null
        }
      }

      return res
    };

    const getComponentVerifyTicket = async () => {
      return this.getValue(COMPONENT_VERIFY_TICKET_ID)
    };

    const locker = new RedisLocker(this.client, authAppid, this.debug, this.strapi.log)
    const acquiredLocker = async () => {
      return locker.acquireLocker()
    }

    let apiService = new API(this.componentAppId, this.componentAppSecret, '',
      authAppid, '',
      getComponentToken,
      saveComponentToken,
      getToken,
      saveToken,
      getAuthorizerRefreshToken,
      getComponentVerifyTicket,
      acquiredLocker
    )
    apiService.setRequestSpeedHook(this.requestSpeedHook)

    return apiService;
  }
}
