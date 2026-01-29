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
        title: 'Redefining "Reach": Closer, Truer, More Effective.',
        slogan: 'Paws for Web3',
        description: 'CAT Ambassador Team helps brands build an agile network that directly reaches new user ecosystems. We are not middlemen, but your most sensitive market nerve endings.',
        ctaPrimary: 'Explore Our Method',
        ctaSecondary: 'View Brand Cases',
      },
      valueProp: {
        title: 'Closer, Truer, More Effective',
        closer: {
          title: 'Closer | Circle Connection',
          text: 'Deeply rooted in diverse interest communities, allowing brand messages to flow naturally like conversations.',
        },
        truer: {
          title: 'Truer | Transparent Feedback',
          text: 'Full data visualization, unpolished feedback. Brands harvest authentic user voices and market pulses.',
        },
        effective: {
          title: 'More Effective | Driving Action',
          text: 'From brand building to growth conversion, every touchpoint points toward clear business goals.',
        }
      },
      stats: {
        totalComp: 'Total Compensation',
        monthlyComp: '1Mo Compensation',
        members: 'Member Count',
        partners: 'Brand Partners',
      },
      footer: {
        copyright: '© 2025-2026 CAT Crypto Ambassador Team. All rights reserved.',
      }
    },
  },
  zh: {
    translation: {
      nav: {
        apply: '申请成为 CA',
        governance: '治理白皮书',
      },
      hero: {
        title: '重新定义“触达”：更近，更真，更有效。',
        slogan: 'Paws for Web3',
        description: '猫猫大使团，助力品牌构建直达新用户生态的敏捷网络。我们不是中间商，而是您最敏锐的市场神经末梢。',
        ctaPrimary: '立即探索我们的方法',
        ctaSecondary: '了解品牌合作案例',
      },
      valueProp: {
        title: '更近、更真、更有效',
        closer: {
          title: '更近 | 圈层直连',
          text: '我们深植于多元兴趣社区，让品牌信息如自然对话般精准流入。',
        },
        truer: {
          title: '更真 | 透明反馈',
          text: '全程数据可视，反馈未经雕琢。品牌收获的是最本真的用户心声与市场脉搏。',
        },
        effective: {
          title: '更有效 | 驱动行动',
          text: '从口碑构建到增长转化，我们设计每一次触达都指向清晰的商业目标。',
        }
      },
      stats: {
        totalComp: '总薪酬',
        monthlyComp: '1月薪酬',
        members: '成员数',
        partners: '合作品牌方',
      },
      footer: {
        copyright: '© 2025-2026 CAT Crypto Ambassador Team. All rights reserved.',
      }
    },
  },
  'zh-TW': {
    translation: {
      nav: {
        apply: '申請成為 CA',
        governance: '治理白皮書',
      },
      hero: {
        title: '重新定義「觸達」：更近，更真，更有效。',
        slogan: 'Paws for Web3',
        description: '貓貓大使團，助力品牌構建直達新用戶生態的敏捷網絡。我們不是中間商，而是您最敏銳的市场神經末梢。',
        ctaPrimary: '立即探索我們的方法',
        ctaSecondary: '了解品牌合作案例',
      },
      valueProp: {
        title: '更近、更真、更有效',
        closer: {
          title: '更近 | 圈層直連',
          text: '我們深植於多元興趣社區，讓品牌信息如自然對話般精準流入。',
        },
        truer: {
          title: '更真 | 透明反饋',
          text: '全程數據可視，反饋未經雕琢。品牌收穫的是最本真的用戶心聲與市場脈搏。',
        },
        effective: {
          title: '更有效 | 驅動行動',
          text: '從口碑構建到增長轉化，我們設計每一次觸達都指向清晰的商業目標。',
        }
      },
      stats: {
        totalComp: '總薪酬',
        monthlyComp: '1月薪酬',
        members: '成員數',
        partners: '合作品牌方',
      },
      footer: {
        copyright: '© 2025-2026 CAT Crypto Ambassador Team. All rights reserved.',
      }
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
