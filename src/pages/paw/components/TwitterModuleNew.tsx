import React, { useEffect } from 'react'
import type { User } from '../lib/api'

interface TwitterModuleProps {
  user: User
}

export const TwitterModuleNew: React.FC<TwitterModuleProps> = ({
  user
}) => {
  useEffect(() => {
    // 动态加载 Twitter Widget 脚本
    const script = document.createElement('script')
    script.src = 'https://platform.twitter.com/widgets.js'
    script.charset = 'utf-8'
    script.async = true
    document.body.appendChild(script)

    return () => {
      // 清理脚本
      const existingScript = document.querySelector('script[src="https://platform.twitter.com/widgets.js"]')
      if (existingScript) {
        existingScript.remove()
      }
    }
  }, [])

  return (
    <div style={{
      padding: '1rem 0'
    }}>
      <a 
        className="twitter-timeline" 
        data-theme="dark" 
        href={`https://twitter.com/${user?.username || '0xCatKing'}?ref_src=twsrc%5Etfw`}
      >
        Tweets by {user?.username || '0xCatKing'}
      </a>
    </div>
  )
}
