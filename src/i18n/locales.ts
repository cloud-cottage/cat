export interface Translations {
  // 按钮相关
  viewOnMobile: string
  share: string
  edit: string
  report: string
  explore: string
  privacy: string
  
  // 模态框相关
  shareTitle: string
  shareDescription: string
  copyLink: string
  close: string
  exploreTitle: string
  
  // 其他
  clickToViewMore: string
  editMode: string
}

export const locales = {
  'zh-CN': {
    viewOnMobile: '用手机查看',
    share: '分享',
    edit: '编辑',
    report: '报错',
    explore: '随变逛逛',
    privacy: '隐私条款',
    shareTitle: '📤 分享个人页面',
    shareDescription: '复制下方链接，分享给朋友吧！',
    copyLink: '📋 复制链接',
    close: '关闭',
    exploreTitle: '🔍 随变逛逛',
    clickToViewMore: '点击查看更多',
    editMode: '编辑模式'
  } as Translations,
  
  'zh-TW': {
    viewOnMobile: '用手機查看',
    share: '分享',
    edit: '編輯',
    report: '報錯',
    explore: '隨便逛逛',
    privacy: '隱私條款',
    shareTitle: '📤 分享個人頁面',
    shareDescription: '複製下方連結，分享給朋友吧！',
    copyLink: '📋 複製連結',
    close: '關閉',
    exploreTitle: '🔍 隨便逛逛',
    clickToViewMore: '點擊查看更多',
    editMode: '編輯模式'
  } as Translations,
  
  'vi': {
    viewOnMobile: 'Xem trên điện thoại',
    share: 'Chia sẻ',
    edit: 'Chỉnh sửa',
    report: 'Báo lỗi',
    explore: 'Khám phá',
    privacy: 'Điều khoản bảo mật',
    shareTitle: '📤 Chia sẻ trang cá nhân',
    shareDescription: 'Sao chép liên kết dưới đây và chia sẻ với bạn bè!',
    copyLink: '📋 Sao chép liên kết',
    close: 'Đóng',
    exploreTitle: '🔍 Khám phá',
    clickToViewMore: 'Nhấn để xem thêm',
    editMode: 'Chế độ chỉnh sửa'
  } as Translations,
  
  'en': {
    viewOnMobile: 'View on mobile',
    share: 'Share',
    edit: 'Edit',
    report: 'Report',
    explore: 'Explore',
    privacy: 'Privacy',
    shareTitle: '📤 Share Profile',
    shareDescription: 'Copy the link below and share with friends!',
    copyLink: '📋 Copy Link',
    close: 'Close',
    exploreTitle: '🔍 Explore',
    clickToViewMore: 'Click to view more',
    editMode: 'Edit Mode'
  } as Translations
}

export type Locale = keyof typeof locales
