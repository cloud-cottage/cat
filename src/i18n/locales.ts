export interface Translations {
  // 按钮相关
  viewOnMobile: string
  share: string
  edit: string
  report: string
  explore: string
  privacy: string
  createOwnPage: string
  
  // 模态框相关
  shareTitle: string
  shareDescription: string
  copyLink: string
  close: string
  exploreTitle: string
  privacyTitle: string
  privacyContent: string
  createOwnPageTitle: string
  createOwnPageContent: string
  
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
    explore: '随便逛逛',
    privacy: '隐私条款',
    createOwnPage: '想拥有自己的页面？',
    shareTitle: '📤 分享个人页面',
    shareDescription: '复制下方链接，分享给朋友吧！',
    copyLink: '📋 复制链接',
    close: '关闭',
    exploreTitle: '🔍 随便逛逛',
    privacyTitle: '🔒 隐私条款',
    privacyContent: '我们重视您的隐私。本应用收集的信息仅用于提供更好的服务体验。我们不会将您的个人信息出售、交易或转让给第三方。您有权随时访问、更正或删除您的个人信息。如果您对我们的隐私政策有任何疑问，请通过客服渠道联系我们。',
    createOwnPageTitle: '🚀 创建你的专属页面',
    createOwnPageContent: '加入唯一被7000万+链上玩家信赖的链接站',
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
    createOwnPage: '想擁有自己的頁面？',
    shareTitle: '📤 分享個人頁面',
    shareDescription: '複製下方連結，分享給朋友吧！',
    copyLink: '📋 複製連結',
    close: '關閉',
    exploreTitle: '🔍 隨便逛逛',
    privacyTitle: '🔒 隱私條款',
    privacyContent: '我們重視您的隱私。本應用收集的資訊僅用於提供更好的服務體驗。我們不會將您的個人資訊出售、交易或轉讓給第三方。您有權隨時存取、更正或刪除您的個人資訊。如果您對我們的隱私政策有任何疑問，請透過客服渠道聯繫我們。',
    createOwnPageTitle: '🚀 創建你的專屬頁面',
    createOwnPageContent: '加入唯一被7000萬+鏈上玩家信賴的連結站',
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
    createOwnPage: 'Muốn có trang của riêng mình?',
    shareTitle: '📤 Chia sẻ trang cá nhân',
    shareDescription: 'Sao chép liên kết dưới đây và chia sẻ với bạn bè!',
    copyLink: '📋 Sao chép liên kết',
    close: 'Đóng',
    exploreTitle: '🔍 Khám phá',
    privacyTitle: '🔒 Điều khoản bảo mật',
    privacyContent: 'Chúng tôi tôn trọng quyền riêng tư của bạn. Thông tin được thu thập bởi ứng dụng này chỉ được sử dụng để cung cấp trải nghiệm dịch vụ tốt hơn. Chúng tôi sẽ không bán, trao đổi hoặc chuyển giao thông tin cá nhân của bạn cho bên thứ ba. Bạn có quyền truy cập, chỉnh sửa hoặc xóa thông tin cá nhân của mình bất cứ lúc nào. Nếu bạn có câu hỏi nào về chính sách bảo mật của chúng tôi, vui lòng liên hệ qua kênh dịch vụ khách hàng.',
    createOwnPageTitle: '🚀 Tạo trang riêng của bạn',
    createOwnPageContent: 'Tham gia trang liên kết được tin cậy bởi hơn 7 triệu người chơi trên-chain',
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
    createOwnPage: 'Want your own page?',
    shareTitle: '📤 Share Profile',
    shareDescription: 'Copy link below and share with friends!',
    copyLink: '📋 Copy Link',
    close: 'Close',
    exploreTitle: '🔍 Explore',
    privacyTitle: '🔒 Privacy Policy',
    privacyContent: 'We value your privacy. The information collected by this application is only used to provide a better service experience. We will not sell, trade, or transfer your personal information to third parties. You have the right to access, correct, or delete your personal information at any time. If you have any questions about our privacy policy, please contact us through customer service channels.',
    createOwnPageTitle: '🚀 Create Your Exclusive Page',
    createOwnPageContent: 'Join the link site trusted by over 7 million on-chain players',
    clickToViewMore: 'Click to view more',
    editMode: 'Edit Mode'
  } as Translations
}

export type Locale = keyof typeof locales
