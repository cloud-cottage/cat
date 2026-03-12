import React, { useEffect } from 'react'

interface TwitterModuleProps {
  twitterHandle?: string
}

export const TwitterModule: React.FC<TwitterModuleProps> = ({ twitterHandle }) => {
  useEffect(() => {
    if (!twitterHandle) return

    // 动态加载 Twitter widgets 脚本
    const script = document.createElement('script')
    script.src = 'https://platform.twitter.com/widgets.js'
    script.charset = 'utf-8'
    script.async = true
    document.body.appendChild(script)

    return () => {
      // 清理脚本
      const existingScript = document.querySelector('script[src="https://platform.twitter.com/widgets.js"]')
      if (existingScript && existingScript.parentNode) {
        existingScript.parentNode.removeChild(existingScript)
      }
    }
  }, [twitterHandle])

  if (!twitterHandle) {
    return null
  }

  return (
    <div style={{
      background: 'rgba(255,255,255,0.1)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255,255,255,0.2)',
      borderRadius: '16px',
      padding: '2rem',
      marginBottom: '2rem'
    }}>
      <h2 style={{
        color: 'white',
        margin: '0 0 1.5rem 0',
        fontSize: '1.5rem',
        fontWeight: '600',
        textAlign: 'center'
      }}>
        🐦 推特动态
      </h2>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        overflow: 'hidden',
        minHeight: '400px'
      }}>
        <blockquote 
          className="twitter-tweet" 
          data-width="500"
          data-theme="light"
        >
          <a 
            href={`https://twitter.com/${twitterHandle}?ref_src=twsrc%5Etfw`}
            target="_blank"
            rel="noopener noreferrer"
          >
            @{twitterHandle} 推文
          </a>
        </blockquote>
      </div>
    </div>
  )
}
