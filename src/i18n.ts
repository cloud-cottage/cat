import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      nav: {
        apply: 'Apply to be CA',
        governance: 'Governance Whitepaper',
      },
      hero: {
        title: 'CAT Crypto Ambassador Team',
        slogan: 'Paws for Web3',
        description: 'The best balance between youthful vitality and commercial trust. Connecting students with brands.',
        cta: 'Join Us',
      },
      stats: {
        totalComp: 'Total Compensation',
        monthlyComp: '1Mo Compensation',
        members: 'Member Count',
        partners: 'Brand Partners',
      },
    },
  },
  zh: {
    translation: {
      nav: {
        apply: '申请成为 CA',
        governance: '治理白皮书',
      },
      hero: {
        title: 'CAT 加密货币大使团队',
        slogan: 'Paws for Web3',
        description: '在年轻活力与商业信赖间取得最佳平衡，最符合“连接学生与品牌”的定位。',
        cta: '加入我们',
      },
      stats: {
        totalComp: '总薪酬',
        monthlyComp: '1月薪酬',
        members: '成员数',
        partners: '合作品牌方',
      },
    },
  },
  'zh-TW': {
    translation: {
      nav: {
        apply: '申請成為 CA',
        governance: '治理白皮書',
      },
      hero: {
        title: 'CAT 加密貨幣大使團隊',
        slogan: 'Paws for Web3',
        description: '在年輕活力與商業信賴間取得最佳平衡，最符合“連接學生與品牌”的定位。',
        cta: '加入我們',
      },
      stats: {
        totalComp: '總薪酬',
        monthlyComp: '1月薪酬',
        members: '成員數',
        partners: '合作品牌方',
      },
    },
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
