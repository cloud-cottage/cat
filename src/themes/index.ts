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
  darkColors?: {
    primary: string
    secondary: string
    bg: string
    surface: string
  }
}

export const THEMES: Theme[] = [
  {
    id: 1,
    name: '默认',
    className: 'theme-default',
    colors: {
      primary: '#FF6B35',
      secondary: '#00D9FF',
      bg: '#0A0E27',
      surface: '#1A1F3A'
    },
    darkColors: {
      primary: '#FF8C42',
      secondary: '#00BFFF',
      bg: '#050714',
      surface: '#0F1429'
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
    },
    darkColors: {
      primary: '#FFB366',
      secondary: '#4A90E2',
      bg: 'linear-gradient(135deg, #1A1A2E 0%, #16213E 50%, #1A1A2E 100%)',
      surface: 'linear-gradient(145deg, #0F3460 0%, #16213E 100%)'
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
    },
    darkColors: {
      primary: '#2980B9',
      secondary: '#FFA500',
      bg: '#1B2838',
      surface: '#2C3E50'
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
    },
    darkColors: {
      primary: '#FF8FAB',
      secondary: '#E91E63',
      bg: '#2D1B3D',
      surface: '#4A2C4A'
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
    },
    darkColors: {
      primary: '#73D13D',
      secondary: '#95DE64',
      bg: '#1A2F1A',
      surface: '#2F4F2F'
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
    },
    darkColors: {
      primary: '#A0522D',
      secondary: '#DEB887',
      bg: '#3E2723',
      surface: '#4E342E'
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
    },
    darkColors: {
      primary: '#9B59B6',
      secondary: '#BB8FCE',
      bg: '#2C2C54',
      surface: '#40407A'
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
    },
    darkColors: {
      primary: '#4CAF50',
      secondary: '#A5D6A7',
      bg: '#1B2F1B',
      surface: '#2E4B2E'
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
    },
    darkColors: {
      primary: '#00ACC1',
      secondary: '#FF80AB',
      bg: '#1A2332',
      surface: '#2C3E50'
    }
  }
]

export const getThemeById = (id: number): Theme | undefined => {
  return THEMES.find(theme => theme.id === id)
}

export const getThemeColors = (theme: Theme, isDarkMode: boolean = false) => {
  if (isDarkMode && theme.darkColors) {
    return theme.darkColors
  }
  return theme.colors
}

export const getThemeClassName = (id: number): string => {
  const theme = getThemeById(id)
  return theme?.className || 'theme-cyber-orange'
}
