export type Locale = 'zh' | 'en' | 'ja'

export const locales: Locale[] = ['zh', 'en', 'ja']
export const defaultLocale: Locale = 'zh'

// 语言名称
export const localeNames: Record<Locale, string> = {
  zh: '中文',
  en: 'English',
  ja: '日本語',
}

// 根据浏览器语言获取最佳匹配
export function getBrowserLocale(): Locale {
  if (typeof window === 'undefined') return defaultLocale
  
  const browserLang = navigator.language.toLowerCase()
  
  if (browserLang.startsWith('zh')) return 'zh'
  if (browserLang.startsWith('ja')) return 'ja'
  if (browserLang.startsWith('en')) return 'en'
  
  return defaultLocale
}

// 翻译文本
const translations: Record<Locale, Record<string, string>> = {
  zh: {
    // 通用
    'app.name': 'Kigurumi Map',
    'app.tagline': '全球 Kigurumi 爱好者社区',
    'common.loading': '加载中...',
    'common.save': '保存',
    'common.cancel': '取消',
    'common.delete': '删除',
    'common.confirm': '确认',
    'common.back': '返回',
    'common.error': '错误',
    'common.success': '成功',
    
    // 导航
    'nav.home': '首页',
    'nav.login': '登录',
    'nav.register': '注册',
    'nav.profile': '个人资料',
    'nav.editProfile': '编辑资料',
    'nav.logout': '退出登录',
    
    // 登录页
    'login.title': '登录你的账户',
    'login.register.title': '创建账户加入社区',
    'login.email': '邮箱',
    'login.email.placeholder': 'your@email.com',
    'login.password': '密码',
    'login.password.placeholder': '至少6位',
    'login.confirmPassword': '确认密码',
    'login.confirmPassword.placeholder': '再次输入密码',
    'login.verificationCode': '邮箱验证码',
    'login.verificationCode.placeholder': '6位验证码',
    'login.verificationCode.expires': '有效期',
    'login.sendCode': '发送验证码',
    'login.sending': '发送中...',
    'login.submit': '登录',
    'login.submitting': '处理中...',
    'login.register.submit': '注册',
    'login.switchToRegister': '没有账户？点击注册',
    'login.switchToLogin': '已有账户？点击登录',
    'login.orUseEmail': '或使用邮箱',
    'login.backHome': '← 返回首页',
    'login.qqLogin': 'QQ登录',
    'login.wechatLogin': '微信登录',
    
    // 登录错误
    'login.error.emailRequired': '请输入邮箱',
    'login.error.emailInvalid': '邮箱格式不正确',
    'login.error.passwordMismatch': '两次密码不一致',
    'login.error.oauthLinked': '该账户已使用其他方式登录',
    'login.error.oauthFailed': '第三方登录失败，请重试',
    'login.error.failed': '登录失败，请重试',
    'login.error.sendFailed': '发送失败，请重试',
    
    // 编辑资料
    'profile.create.title': '创建你的 Kigurumi 资料',
    'profile.edit.title': '编辑资料',
    'profile.cnName': 'CN名称',
    'profile.cnName.placeholder': '你的CN名称',
    'profile.introduction': '自我介绍',
    'profile.introduction.placeholder': '介绍一下你自己和你的角色...',
    'profile.photos': '照片',
    'profile.photos.max': '（最多3张）',
    'profile.photos.add': '添加照片',
    'profile.location': '位置',
    'profile.uploading': '上传中...',
    'profile.saving': '保存中...',
    'profile.save': '保存资料',
    'profile.delete': '删除资料',
    'profile.delete.confirm': '确认删除？',
    'profile.delete.warning': '删除后你的资料将从地图上移除，此操作不可恢复。',
    'profile.delete.deleting': '删除中...',
    'profile.success': '保存成功！',
    
    // 资料错误
    'profile.error.cnNameRequired': '请输入CN名称',
    'profile.error.introRequired': '请输入自我介绍',
    'profile.error.photosRequired': '请至少上传一张照片',
    'profile.error.photosMax': '最多只能上传3张照片',
    'profile.error.locationRequired': '请获取位置信息',
    'profile.error.imageInvalid': '图片格式不支持',
    'profile.error.imageFailed': '图片处理失败',
    
    // 地图
    'map.users': '位 Kigurumi',
    'map.filter.all': '全部',
    'map.filter.country': '国家/地区',
    'map.noUsers': '该区域暂无用户',
    
    // 用户卡片
    'user.viewProfile': '查看资料',
    'user.share': '分享',
    
    // 位置选择
    'location.detect': '获取当前位置',
    'location.detecting': '定位中...',
    'location.manual': '或在地图上点击选择',
    'location.selected': '已选择位置',
    
    // 邮件
    'email.subject': 'Kigurumi Map - 邮箱验证码',
    'email.greeting': '您好！',
    'email.content': '您正在进行邮箱验证，请使用以下验证码完成操作：',
    'email.expires': '验证码有效期为',
    'email.minutes': '分钟',
    'email.ignore': '如果这不是您的操作，请忽略此邮件。',
    'email.footer': '全球 Kigurumi 爱好者社区',
    
    // 聚会页面
    'events.title': 'Kigurumi Events',
    'events.label': 'Gatherings',
    'events.subtitle': '探索精选聚会活动，与志同道合的创作者相遇',
    'events.loadMore': '查看更多活动',
    'events.collapse': '收起',
    'events.status.upcoming': '即将开始',
    'events.status.ongoing': '进行中',
    'events.status.ended': '已结束',
    'events.nav.events': 'Events',
    'events.nav.map': 'Map',
    'events.backToEvents': '返回活动列表',
    'events.section.info': '活动信息',
    'events.section.tickets': '门票信息',
    'events.section.hotel': '官方合作酒店',
    'events.section.concept': '活动理念',
    'events.section.faq': '常见问题',
    'events.info.time': '活动时间',
    'events.info.location': '活动地点',
    'events.info.area': '场地面积',
    'events.info.audience': '面向人群',
    'events.info.audienceDesc': 'Kigurumi 爱好者、Doller、摄影师、创作者',
    'events.ticket.select': '选择',
    'events.hotel.perNight': '/ 晚',
    'events.hotel.book': '预订房间',
    'events.copyright': '© 2026 Kigurumi Map. All rights reserved.',
  },
  
  en: {
    // Common
    'app.name': 'Kigurumi Map',
    'app.tagline': 'Global Kigurumi Community',
    'common.loading': 'Loading...',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.confirm': 'Confirm',
    'common.back': 'Back',
    'common.error': 'Error',
    'common.success': 'Success',
    
    // Navigation
    'nav.home': 'Home',
    'nav.login': 'Login',
    'nav.register': 'Register',
    'nav.profile': 'Profile',
    'nav.editProfile': 'Edit Profile',
    'nav.logout': 'Logout',
    
    // Login page
    'login.title': 'Login to your account',
    'login.register.title': 'Create an account',
    'login.email': 'Email',
    'login.email.placeholder': 'your@email.com',
    'login.password': 'Password',
    'login.password.placeholder': 'At least 6 characters',
    'login.confirmPassword': 'Confirm Password',
    'login.confirmPassword.placeholder': 'Enter password again',
    'login.verificationCode': 'Verification Code',
    'login.verificationCode.placeholder': '6-digit code',
    'login.verificationCode.expires': 'Expires in',
    'login.sendCode': 'Send Code',
    'login.sending': 'Sending...',
    'login.submit': 'Login',
    'login.submitting': 'Processing...',
    'login.register.submit': 'Register',
    'login.switchToRegister': "Don't have an account? Register",
    'login.switchToLogin': 'Already have an account? Login',
    'login.orUseEmail': 'or use email',
    'login.backHome': '← Back to Home',
    'login.qqLogin': 'QQ Login',
    'login.wechatLogin': 'WeChat Login',
    
    // Login errors
    'login.error.emailRequired': 'Please enter email',
    'login.error.emailInvalid': 'Invalid email format',
    'login.error.passwordMismatch': 'Passwords do not match',
    'login.error.oauthLinked': 'Account linked with another method',
    'login.error.oauthFailed': 'OAuth login failed, please retry',
    'login.error.failed': 'Login failed, please retry',
    'login.error.sendFailed': 'Failed to send, please retry',
    
    // Edit profile
    'profile.create.title': 'Create your Kigurumi Profile',
    'profile.edit.title': 'Edit Profile',
    'profile.cnName': 'Display Name',
    'profile.cnName.placeholder': 'Your display name',
    'profile.introduction': 'Introduction',
    'profile.introduction.placeholder': 'Tell us about yourself and your characters...',
    'profile.photos': 'Photos',
    'profile.photos.max': '(Max 3)',
    'profile.photos.add': 'Add Photo',
    'profile.location': 'Location',
    'profile.uploading': 'Uploading...',
    'profile.saving': 'Saving...',
    'profile.save': 'Save Profile',
    'profile.delete': 'Delete Profile',
    'profile.delete.confirm': 'Confirm Delete?',
    'profile.delete.warning': 'Your profile will be removed from the map. This cannot be undone.',
    'profile.delete.deleting': 'Deleting...',
    'profile.success': 'Saved successfully!',
    
    // Profile errors
    'profile.error.cnNameRequired': 'Please enter display name',
    'profile.error.introRequired': 'Please enter introduction',
    'profile.error.photosRequired': 'Please upload at least one photo',
    'profile.error.photosMax': 'Maximum 3 photos allowed',
    'profile.error.locationRequired': 'Please select location',
    'profile.error.imageInvalid': 'Invalid image format',
    'profile.error.imageFailed': 'Image processing failed',
    
    // Map
    'map.users': 'Kigurumi',
    'map.filter.all': 'All',
    'map.filter.country': 'Country/Region',
    'map.noUsers': 'No users in this area',
    
    // User card
    'user.viewProfile': 'View Profile',
    'user.share': 'Share',
    
    // Location picker
    'location.detect': 'Detect Location',
    'location.detecting': 'Detecting...',
    'location.manual': 'Or click on map to select',
    'location.selected': 'Location selected',
    
    // Email
    'email.subject': 'Kigurumi Map - Verification Code',
    'email.greeting': 'Hello!',
    'email.content': 'You are verifying your email. Please use the following code:',
    'email.expires': 'Code expires in',
    'email.minutes': 'minutes',
    'email.ignore': 'If this was not you, please ignore this email.',
    'email.footer': 'Global Kigurumi Community',
    
    // Events page
    'events.title': 'Kigurumi Events',
    'events.label': 'Gatherings',
    'events.subtitle': 'Discover curated gatherings and meet like-minded creators',
    'events.loadMore': 'View More Events',
    'events.collapse': 'Collapse',
    'events.status.upcoming': 'Upcoming',
    'events.status.ongoing': 'Ongoing',
    'events.status.ended': 'Ended',
    'events.nav.events': 'Events',
    'events.nav.map': 'Map',
    'events.backToEvents': 'Back to Events',
    'events.section.info': 'Event Information',
    'events.section.tickets': 'Tickets',
    'events.section.hotel': 'Official Partner Hotel',
    'events.section.concept': 'About This Event',
    'events.section.faq': 'FAQ',
    'events.info.time': 'Date & Time',
    'events.info.location': 'Venue',
    'events.info.area': 'Venue Size',
    'events.info.audience': 'For',
    'events.info.audienceDesc': 'Kigurumi enthusiasts, Dollers, photographers, creators',
    'events.ticket.select': 'Select',
    'events.hotel.perNight': '/ night',
    'events.hotel.book': 'Book Room',
    'events.copyright': '© 2026 Kigurumi Map. All rights reserved.',
  },
  
  ja: {
    // 共通
    'app.name': 'Kigurumi Map',
    'app.tagline': 'グローバル着ぐるみコミュニティ',
    'common.loading': '読み込み中...',
    'common.save': '保存',
    'common.cancel': 'キャンセル',
    'common.delete': '削除',
    'common.confirm': '確認',
    'common.back': '戻る',
    'common.error': 'エラー',
    'common.success': '成功',
    
    // ナビゲーション
    'nav.home': 'ホーム',
    'nav.login': 'ログイン',
    'nav.register': '登録',
    'nav.profile': 'プロフィール',
    'nav.editProfile': 'プロフィール編集',
    'nav.logout': 'ログアウト',
    
    // ログインページ
    'login.title': 'アカウントにログイン',
    'login.register.title': 'アカウントを作成',
    'login.email': 'メールアドレス',
    'login.email.placeholder': 'your@email.com',
    'login.password': 'パスワード',
    'login.password.placeholder': '6文字以上',
    'login.confirmPassword': 'パスワード確認',
    'login.confirmPassword.placeholder': 'パスワードを再入力',
    'login.verificationCode': '認証コード',
    'login.verificationCode.placeholder': '6桁のコード',
    'login.verificationCode.expires': '有効期限',
    'login.sendCode': 'コードを送信',
    'login.sending': '送信中...',
    'login.submit': 'ログイン',
    'login.submitting': '処理中...',
    'login.register.submit': '登録',
    'login.switchToRegister': 'アカウントをお持ちでない方は登録',
    'login.switchToLogin': 'アカウントをお持ちの方はログイン',
    'login.orUseEmail': 'またはメールで',
    'login.backHome': '← ホームに戻る',
    'login.qqLogin': 'QQログイン',
    'login.wechatLogin': 'WeChatログイン',
    
    // ログインエラー
    'login.error.emailRequired': 'メールアドレスを入力してください',
    'login.error.emailInvalid': 'メールアドレスの形式が正しくありません',
    'login.error.passwordMismatch': 'パスワードが一致しません',
    'login.error.oauthLinked': 'このアカウントは別の方法でリンクされています',
    'login.error.oauthFailed': 'ログインに失敗しました。再試行してください',
    'login.error.failed': 'ログインに失敗しました。再試行してください',
    'login.error.sendFailed': '送信に失敗しました。再試行してください',
    
    // プロフィール編集
    'profile.create.title': '着ぐるみプロフィールを作成',
    'profile.edit.title': 'プロフィール編集',
    'profile.cnName': '表示名',
    'profile.cnName.placeholder': 'あなたの表示名',
    'profile.introduction': '自己紹介',
    'profile.introduction.placeholder': 'あなた自身とキャラクターについて教えてください...',
    'profile.photos': '写真',
    'profile.photos.max': '（最大3枚）',
    'profile.photos.add': '写真を追加',
    'profile.location': '場所',
    'profile.uploading': 'アップロード中...',
    'profile.saving': '保存中...',
    'profile.save': 'プロフィールを保存',
    'profile.delete': 'プロフィールを削除',
    'profile.delete.confirm': '削除しますか？',
    'profile.delete.warning': 'プロフィールはマップから削除されます。この操作は取り消せません。',
    'profile.delete.deleting': '削除中...',
    'profile.success': '保存しました！',
    
    // プロフィールエラー
    'profile.error.cnNameRequired': '表示名を入力してください',
    'profile.error.introRequired': '自己紹介を入力してください',
    'profile.error.photosRequired': '少なくとも1枚の写真をアップロードしてください',
    'profile.error.photosMax': '写真は最大3枚までです',
    'profile.error.locationRequired': '場所を選択してください',
    'profile.error.imageInvalid': '画像形式がサポートされていません',
    'profile.error.imageFailed': '画像処理に失敗しました',
    
    // マップ
    'map.users': '人の着ぐるみ',
    'map.filter.all': 'すべて',
    'map.filter.country': '国/地域',
    'map.noUsers': 'このエリアにはユーザーがいません',
    
    // ユーザーカード
    'user.viewProfile': 'プロフィールを見る',
    'user.share': 'シェア',
    
    // 位置選択
    'location.detect': '現在地を取得',
    'location.detecting': '取得中...',
    'location.manual': 'または地図をクリックして選択',
    'location.selected': '場所を選択しました',
    
    // メール
    'email.subject': 'Kigurumi Map - 認証コード',
    'email.greeting': 'こんにちは！',
    'email.content': 'メールアドレスの認証を行っています。以下のコードをご使用ください：',
    'email.expires': 'コードの有効期限は',
    'email.minutes': '分です',
    'email.ignore': 'これがあなたの操作でない場合は、このメールを無視してください。',
    'email.footer': 'グローバル着ぐるみコミュニティ',
    
    // イベントページ
    'events.title': 'Kigurumi Events',
    'events.label': 'Gatherings',
    'events.subtitle': '厳選されたイベントを探索し、志を同じくするクリエイターと出会う',
    'events.loadMore': 'もっと見る',
    'events.collapse': '閉じる',
    'events.status.upcoming': '開催予定',
    'events.status.ongoing': '開催中',
    'events.status.ended': '終了',
    'events.nav.events': 'Events',
    'events.nav.map': 'Map',
    'events.backToEvents': 'イベント一覧に戻る',
    'events.section.info': 'イベント情報',
    'events.section.tickets': 'チケット',
    'events.section.hotel': '公式パートナーホテル',
    'events.section.concept': 'イベントについて',
    'events.section.faq': 'よくある質問',
    'events.info.time': '日時',
    'events.info.location': '会場',
    'events.info.area': '会場面積',
    'events.info.audience': '対象',
    'events.info.audienceDesc': '着ぐるみ愛好家、ドーラー、フォトグラファー、クリエイター',
    'events.ticket.select': '選択',
    'events.hotel.perNight': '/ 泊',
    'events.hotel.book': '予約する',
    'events.copyright': '© 2026 Kigurumi Map. All rights reserved.',
  },
}

export function t(key: string, locale: Locale = defaultLocale): string {
  return translations[locale][key] || translations[defaultLocale][key] || key
}

export function getTranslations(locale: Locale) {
  return translations[locale] || translations[defaultLocale]
}
