import { useEffect, useRef } from 'react'

interface TwitterTimelineProps {
  twitterHandle: string
}

export const TwitterTimeline: React.FC<TwitterTimelineProps> = ({ twitterHandle }) => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    console.log('TwitterTimeline: Initializing for', twitterHandle)

    // 检查脚本是否已经加载
    const existingScript = document.querySelector('script[src="https://platform.twitter.com/widgets.js"]')
    
    if (!existingScript) {
      console.log('TwitterTimeline: Loading Twitter widgets script')
      // 动态加载 Twitter widgets 脚本
      const script = document.createElement('script')
      script.src = 'https://platform.twitter.com/widgets.js'
      script.charset = 'utf-8'
      script.async = true
      script.onload = () => {
        console.log('TwitterTimeline: Script loaded, initializing widgets')
        // 脚本加载完成后，手动初始化 widgets
        if (window.twttr && window.twttr.widgets) {
          window.twttr.widgets.load()
        }
      }
      script.onerror = () => {
        console.error('TwitterTimeline: Failed to load Twitter widgets script')
      }
      document.body.appendChild(script)
    } else {
      console.log('TwitterTimeline: Script already exists, loading widgets')
      // 脚本已存在，直接加载 widgets
      if (window.twttr && window.twttr.widgets) {
        window.twttr.widgets.load()
      }
    }

    return () => {
      // 不清理脚本，因为其他组件可能也在使用
    }
  }, [twitterHandle])

  return (
    <div ref={containerRef}>
      <a 
        className="twitter-timeline" 
        data-theme="dark"
        data-width="300"
        data-height="400"
        data-chrome="noheader, nofooter, noscrollbar, transparent"
        href={`https://twitter.com/${twitterHandle}?ref_src=twsrc%5Etfw`}
        target="_blank"
        rel="noopener noreferrer"
      >
        Tweets by @{twitterHandle}
      </a>
    </div>
  )
}

// 添加全局类型声明
declare global {
  interface Window {
    twttr?: {
      widgets: {
        load: () => void
      }
    }
  }
}
