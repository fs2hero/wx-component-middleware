import {
  fetchComponentAccessToken,
  fetchPreAuthCode,
  fetchAppAccessToken,
  fetchAppAccessTokenByRT,
  fetchAuthorizerList,
} from './componentAPI';
import {Store} from '../tokenStore/types';
import WxMsgCrypt from './utils/wxMsgCrypt';
import RedisLocker from './utils/redisLocker';

export default class ComponetService {
  componentAppId: string;
  componentAppSecret: string;
  token: string;
  encodingAESKey: string;
  public wxMsgCrypt:WxMsgCrypt;

  constructor(componetConfig: any, public store: Store, private locker: RedisLocker) {
    this.store = store;
    this.locker = locker;
    Object.assign(this, componetConfig);

    this.wxMsgCrypt = new WxMsgCrypt({
      appid: this.componentAppId,
      token: this.token,
      encodingAESKey: this.encodingAESKey,
    });
  }

  async decodeTicket(body) {
    const wxMsgCrypt = this.wxMsgCrypt
    const encryptData = (wxMsgCrypt.xml2object(body) as any).
        xml.Encrypt._cdata;
    const decodedXml = wxMsgCrypt.decrypt(encryptData);
    const decodedJson:any = wxMsgCrypt.xml2object(decodedXml);
    return decodedJson;
  }

  async decryptMsg(msgSignature, timestamp, nonce, body) {
    const wxMsgCrypt = this.wxMsgCrypt
    const encryptData = (wxMsgCrypt.xml2object(body) as any).
        xml.Encrypt._cdata;
    return wxMsgCrypt.decryptMsg(msgSignature, timestamp, nonce, {Encrypt: encryptData});
  }

  async encryptMsg(replyMsg, opts) {
    const wxMsgCrypt = this.wxMsgCrypt
    
    return wxMsgCrypt.encryptMsg(replyMsg, opts);
  }

  async setValue(key, value, expire = undefined) {
    return this.store.set(key, value, expire)
  }

  async getValue(key) {
    return this.store.get(key)
  }

  async setComponentVerifyTicket(data: any) {
    await this.setValue('component_verify_ticket', data);
  }
  async getComponentVerifyTicket() {
    return this.getValue('component_verify_ticket');
  }

  async getComponentAccessToken() {
    const key = `component_access_token`;
    let componentAccessToken = await this.getValue(key);

    if (componentAccessToken) {
      return componentAccessToken;
    }

    const unLocker:any = await this.locker.acquireLocker()
    if(!unLocker) {
      return null
    }
    componentAccessToken = await this.getValue(key);

    if (componentAccessToken) {
      unLocker();
      return componentAccessToken;
    }

    const component_verify_ticket = await this.getComponentVerifyTicket();

    // eslint-disable-next-line max-len
    const {component_access_token: newComponentAccessToken, expires_in} = await fetchComponentAccessToken({
      component_appid: this.componentAppId,
      component_appsecret: this.componentAppSecret,
      component_verify_ticket,
    });
    await this.setValue(key, newComponentAccessToken, expires_in);
    unLocker();

    return newComponentAccessToken;
  }

  async getPreAuthCode() {
    const component_access_token = await this.getComponentAccessToken();
    const {pre_auth_code: newAuthCode} = await fetchPreAuthCode({
      component_appid: this.componentAppId,
      component_access_token,
    });

    return newAuthCode;
  }

  async getAuthorizationUrl(redirectUri: string, isPC?:boolean, auth_type?: number, biz_appid?:string) {
    const preAuthCode = await this.getPreAuthCode();
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

  async queryAppAccessToken(authorization_code: string) {
    const component_access_token = await this.getComponentAccessToken();
    const {
      authorizer_access_token,
      authorizer_appid,
      authorizer_refresh_token,
      expires_in,
    }: any = await fetchAppAccessToken({
      component_appid: this.componentAppId,
      component_access_token,
      authorization_code,
    });
    const RTkey = `RT:${authorizer_appid}`;
    const ATkey = `AT:${authorizer_appid}`;
    this.setValue(RTkey, authorizer_refresh_token);
    this.setValue(ATkey, authorizer_access_token, expires_in);

    return authorizer_access_token;
  }

  async getAppAcccessToken(authorizer_appid: string) {
    const ATkey = `AT:${authorizer_appid}`;
    const RTkey = `RT:${authorizer_appid}`;
    let appAcccessToken = await this.getValue(ATkey);
    if (appAcccessToken) {
      return appAcccessToken;
    }

    const unlocker:any = await this.locker.acquireLocker();
    if(!unlocker) {
      return null;
    }

    appAcccessToken = await this.getValue(ATkey);
    if (appAcccessToken) {
      unlocker();
      return appAcccessToken;
    }

    const authorizer_refresh_token = await this.getValue(RTkey);
    const component_access_token = await this.getComponentAccessToken();
    const {authorizer_access_token: newAT, expires_in} = await fetchAppAccessTokenByRT({
      component_appid: this.componentAppId,
      component_access_token,
      authorizer_appid,
      authorizer_refresh_token,

    });
    await this.setValue(ATkey, newAT, expires_in);
    unlocker();
    return newAT;
  }

  async getAuthorizerList(offset=0, count=500) {
    const component_access_token = await this.getComponentAccessToken();
    return fetchAuthorizerList({
      component_appid: this.componentAppId,
      component_access_token,
      offset,
      count,
    });
  }
}
