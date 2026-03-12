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
          margin: 1,
          color: {
            dark: '#000000',
            light: '#ffffff'
          },
          // 为二维码的小方块添加圆角效果
          errorCorrectionLevel: 'M'
        })
        setQrDataUrl(dataUrl)
      } catch (error) {
        console.error('生成二维码失败:', error)
      }
    }

    generateQR()
  }, [url, size])

  return (
    <div style={{
      width: size,
      height: size,
      border: '4px solid white',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      overflow: 'hidden',
      position: 'relative',
      background: 'white'
    }}>
      <div style={{
        width: '100%',
        height: '100%',
        borderRadius: '4px',
        overflow: 'hidden',
        position: 'relative'
      }}>
        <img 
          src={qrDataUrl} 
          alt="QR Code"
          style={{
            width: '100%',
            height: '100%',
            display: 'block',
            // 为二维码小方块添加圆角效果
            borderRadius: '3px',
            filter: 'contrast(1.05)'
          }}
        />
      </div>
    </div>
  )
}
