import React from 'react'

interface IconProps {
  name: 'paw' | 'share' | 'edit'
  size?: number
  className?: string
}

export const Icon: React.FC<IconProps> = ({ name, size = 24, className }) => {
  const getIconPath = () => {
    switch (name) {
      case 'paw':
        return './icons/paw.svg'
      case 'share':
        return './icons/share.svg'
      case 'edit':
        return './icons/edit.svg'
      default:
        return ''
    }
  }

  return (
    <img 
      src={getIconPath()} 
      alt={`${name} icon`}
      width={size}
      height={size}
      className={className}
      style={{ display: 'block' }}
    />
  )
}
