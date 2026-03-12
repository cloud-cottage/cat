import React from 'react'

export const ButtonTest: React.FC = () => {
  return (
    <div style={{
      padding: '2rem',
      minHeight: '100vh',
      background: '#f0f0f0',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <h1 style={{ marginBottom: '2rem', color: '#333' }}>
        按钮尺寸测试页面
      </h1>
      
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem', color: '#666' }}>测试按钮 (100px × 80px)</h2>
        <button
          style={{
            width: '100px',
            height: '80px',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: 'pointer',
            margin: '0 1rem 1rem 0'
          }}
        >
          测试按钮
        </button>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem', color: '#666' }}>cat-btn 类按钮</h2>
        <button className="cat-btn" style={{ margin: '0 1rem 1rem 0' }}>
          cat-btn
        </button>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem', color: '#666' }}>cat-btn-fixed 类按钮</h2>
        <button className="cat-btn-fixed" style={{ margin: '0 1rem 1rem 0' }}>
          cat-btn-fixed
        </button>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem', color: '#666' }}>检查信息</h2>
        <p style={{ color: '#666', lineHeight: '1.6' }}>
          请检查上方按钮的实际尺寸是否为 100px × 80px。<br/>
          如果尺寸不正确，请查看开发者工具中的计算值。
        </p>
      </div>

      <div style={{ 
        position: 'fixed', 
        bottom: '20px', 
        right: '20px', 
        background: 'rgba(0,0,0,0.8)', 
        color: 'white', 
        padding: '1rem', 
        borderRadius: '8px',
        fontSize: '12px'
      }}>
        <div>屏幕信息:</div>
        <div>window.devicePixelRatio: {window.devicePixelRatio}</div>
        <div>window.innerWidth: {window.innerWidth}px</div>
        <div>计算字体大小: {getComputedStyle(document.documentElement).fontSize}</div>
      </div>
    </div>
  )
}
