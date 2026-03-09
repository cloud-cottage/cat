export interface Theme {
  id: number
  name: string
  className: string
  colors: {
    primary: string
    secondary: string
    bg: string
    surface: string
  }
}

export const THEMES: Theme[] = [
  {
    id: 1,
    name: '赛博橙',
    className: 'theme-cyber-orange',
    colors: {
      primary: '#FF6B35',
      secondary: '#00D9FF',
      bg: '#0A0E27',
      surface: '#1A1F3A'
    }
  },
  {
    id: 2,
    name: '钻石手',
    className: 'theme-diamond',
    colors: {
      primary: '#FF8C42',
      secondary: '#1C6E9C',
      bg: 'linear-gradient(135deg, #F8F9FA 0%, #E8EAF6 50%, #F8F9FA 100%)',
      surface: 'linear-gradient(145deg, #FFFFFF 0%, #F5F5F5 100%)'
    }
  },
  {
    id: 3,
    name: 'HODL蓝',
    className: 'theme-hodl-blue',
    colors: {
      primary: '#1C6E9C',
      secondary: '#FF8C42',
      bg: '#EBF8FF',
      surface: '#FFFFFF'
    }
  },
  {
    id: 4,
    name: '草莓熊',
    className: 'theme-strawberry',
    colors: {
      primary: '#FF6B9D',
      secondary: '#C66FBC',
      bg: '#FFF0F5',
      surface: '#FFFFFF'
    }
  },
  {
    id: 5,
    name: '韭菜帝国',
    className: 'theme-matrix',
    colors: {
      primary: '#52C41A',
      secondary: '#52C41A',
      bg: '#F6FFED',
      surface: '#FFFFFF'
    }
  },
  {
    id: 6,
    name: '拿铁棕',
    className: 'theme-latte-brown',
    colors: {
      primary: '#8B4513',
      secondary: '#D2691E',
      bg: '#FFF8DC',
      surface: '#FFFFFF'
    }
  },
  {
    id: 7,
    name: '神秘紫',
    className: 'theme-mystery-purple',
    colors: {
      primary: '#6B46C1',
      secondary: '#9F7AEA',
      bg: '#F7FAFC',
      surface: '#FFFFFF'
    }
  },
  {
    id: 8,
    name: '卫兵',
    className: 'theme-guard',
    colors: {
      primary: '#2E7D32',
      secondary: '#81C784',
      bg: '#E8F5E8',
      surface: '#FFFFFF'
    }
  },
  {
    id: 9,
    name: '极光',
    className: 'theme-aurora',
    colors: {
      primary: '#00BCD4',
      secondary: '#FF4081',
      bg: '#E0F7FA',
      surface: '#FFFFFF'
    }
  }
]

export const getThemeById = (id: number): Theme | undefined => {
  return THEMES.find(theme => theme.id === id)
}

export const getThemeClassName = (id: number): string => {
  const theme = getThemeById(id)
  return theme?.className || 'theme-cyber-orange'
}
