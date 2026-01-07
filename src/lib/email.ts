import * as tencentcloud from 'tencentcloud-sdk-nodejs-ses'
import { Locale } from './i18n'

const SesClient = tencentcloud.ses.v20201002.Client

// 腾讯云邮件推送客户端
const client = new SesClient({
  credential: {
    secretId: process.env.TENCENT_SECRET_ID!,
    secretKey: process.env.TENCENT_SECRET_KEY!,
  },
  region: process.env.TENCENT_SES_REGION || 'ap-guangzhou',
  profile: {
    httpProfile: {
      endpoint: 'ses.tencentcloudapi.com',
    },
  },
})

// 验证码有效期（分钟）
export const CODE_EXPIRY_MINUTES = 10

// 发送频率限制（秒）
export const SEND_INTERVAL_SECONDS = 60

// 各语言的邮件模板 ID
const TEMPLATE_IDS: Record<Locale, number> = {
  zh: 41173,  // 中文模板
  en: 41174,  // 英文模板
  ja: 41175,  // 日文模板
}

// 各语言的邮件主题
const EMAIL_SUBJECTS: Record<Locale, string> = {
  zh: 'Kigurumi Map - 邮箱验证码',
  en: 'Kigurumi Map - Verification Code',
  ja: 'Kigurumi Map - 認証コード',
}

// 生成6位数字验证码
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// 发送验证码邮件
export async function sendVerificationEmail(
  toEmail: string,
  code: string,
  locale: Locale = 'zh'
): Promise<{ success: boolean; error?: string }> {
  try {
    const params = {
      FromEmailAddress: process.env.TENCENT_SES_FROM_EMAIL!,
      Destination: [toEmail],
      Template: {
        TemplateID: TEMPLATE_IDS[locale] || TEMPLATE_IDS.zh,
        TemplateData: JSON.stringify({ code }),
      },
      Subject: EMAIL_SUBJECTS[locale] || EMAIL_SUBJECTS.zh,
    }

    await client.SendEmail(params)
    return { success: true }
  } catch (error: any) {
    console.error('发送邮件失败:', error)
    return { 
      success: false, 
      error: error.message || '邮件发送失败' 
    }
  }
}
