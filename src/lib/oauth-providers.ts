// 自定义 OAuth Provider - QQ 和微信登录

import type { OAuthConfig, OAuthUserConfig } from 'next-auth/providers/oauth'
import type { Profile } from 'next-auth'

export interface QQProfile extends Profile {
  openid: string
  nickname: string
  figureurl_qq_2: string
}

export interface WeChatProfile extends Profile {
  openid: string
  unionid?: string
  nickname: string
  headimgurl: string
  sex: number
  province: string
  city: string
  country: string
}

// QQ 登录 Provider
export function QQProvider(
  options: OAuthUserConfig<QQProfile>
): OAuthConfig<QQProfile> {
  return {
    id: 'qq',
    name: 'QQ',
    type: 'oauth',
    authorization: {
      url: 'https://graph.qq.com/oauth2.0/authorize',
      params: {
        response_type: 'code',
        scope: 'get_user_info',
      },
    },
    token: {
      url: 'https://graph.qq.com/oauth2.0/token',
      async request({ params, provider }) {
        const response = await fetch(
          `https://graph.qq.com/oauth2.0/token?grant_type=authorization_code&client_id=${provider.clientId}&client_secret=${provider.clientSecret}&code=${params.code}&redirect_uri=${params.redirect_uri}&fmt=json`
        )
        const tokens = await response.json()
        return { tokens }
      },
    },
    userinfo: {
      url: 'https://graph.qq.com/user/get_user_info',
      async request({ tokens, provider }) {
        // 先获取 OpenID
        const openIdRes = await fetch(
          `https://graph.qq.com/oauth2.0/me?access_token=${tokens.access_token}&fmt=json`
        )
        const openIdData = await openIdRes.json()
        
        // 再获取用户信息
        const userRes = await fetch(
          `https://graph.qq.com/user/get_user_info?access_token=${tokens.access_token}&oauth_consumer_key=${provider.clientId}&openid=${openIdData.openid}`
        )
        const userData = await userRes.json()
        
        return {
          openid: openIdData.openid,
          nickname: userData.nickname,
          figureurl_qq_2: userData.figureurl_qq_2 || userData.figureurl_qq_1,
        } as QQProfile
      },
    },
    profile(profile: QQProfile) {
      return {
        id: profile.openid,
        name: profile.nickname,
        image: profile.figureurl_qq_2,
      }
    },
    style: {
      logo: 'https://connect.qq.com/favicon.ico',
      bg: '#12B7F5',
      text: '#fff',
    },
    options,
  }
}

// 微信登录 Provider
export function WeChatProvider(
  options: OAuthUserConfig<WeChatProfile>
): OAuthConfig<WeChatProfile> {
  return {
    id: 'wechat',
    name: '微信',
    type: 'oauth',
    authorization: {
      url: 'https://open.weixin.qq.com/connect/qrconnect',
      params: {
        appid: options.clientId,
        response_type: 'code',
        scope: 'snsapi_login',
        state: 'STATE',
      },
    },
    token: {
      url: 'https://api.weixin.qq.com/sns/oauth2/access_token',
      async request({ params, provider }) {
        const response = await fetch(
          `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${provider.clientId}&secret=${provider.clientSecret}&code=${params.code}&grant_type=authorization_code`
        )
        const tokens = await response.json()
        return { 
          tokens: {
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            openid: tokens.openid,
            unionid: tokens.unionid,
          }
        }
      },
    },
    userinfo: {
      url: 'https://api.weixin.qq.com/sns/userinfo',
      async request({ tokens }) {
        const response = await fetch(
          `https://api.weixin.qq.com/sns/userinfo?access_token=${tokens.access_token}&openid=${(tokens as any).openid}`
        )
        return await response.json() as WeChatProfile
      },
    },
    profile(profile: WeChatProfile) {
      return {
        id: profile.unionid || profile.openid,
        name: profile.nickname,
        image: profile.headimgurl,
      }
    },
    style: {
      logo: 'https://res.wx.qq.com/a/wx_fed/assets/res/NTI4MWU5.ico',
      bg: '#07C160',
      text: '#fff',
    },
    options,
  }
}
