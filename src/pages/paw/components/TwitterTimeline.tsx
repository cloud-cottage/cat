import { useEffect } from 'react'

interface TwitterTimelineProps {
  twitterHandle: string
}

export const TwitterTimeline: React.FC<TwitterTimelineProps> = ({ twitterHandle }) => {
  useEffect(() => {
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
  }, [])

  return (
    <div>
      <a 
        className="twitter-timeline" 
        data-theme="dark"
        data-width="300"
        href={`https://twitter.com/${twitterHandle}?ref_src=twsrc%5Etfw`}
      >
        Tweets by @{twitterHandle}
      </a>
    </div>
  )
}
