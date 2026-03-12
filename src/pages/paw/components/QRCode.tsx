import React, { useEffect, useState } from 'react'
import QRCode from 'qrcode'

interface QRCodeProps {
  url: string
  size?: number
}

export const QRCodeComponent: React.FC<QRCodeProps> = ({ url, size = 160 }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('')

  useEffect(() => {
    const generateQR = async () => {
      try {
        const dataUrl = await QRCode.toDataURL(url, {
          width: size,
          margin: 1,
          color: {
            dark: '#000000',
            light: '#ffffff'
          }
        })
        setQrDataUrl(dataUrl)
      } catch (error) {
        console.error('生成二维码失败:', error)
      }
    }

    generateQR()
  }, [url, size])

  return (
    <img 
      src={qrDataUrl} 
      alt="QR Code"
      style={{
        width: size,
        height: size,
        border: '4px solid white',
        borderRadius: '16px',     // 增加圆角半径，更圆润
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        objectFit: 'cover'          // 确保图片适应容器
      }}
    />
  )
}
