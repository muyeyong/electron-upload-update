import { useState } from 'react'
import styles from 'styles/app.module.scss'

const App: React.FC = () => {
  const [count, setCount] = useState(0)
  const uploadFile = () => {
    postMessage({ payload: 'uploadFile' }, '*')
  }

  return (
    <div className={styles.app}>
      <header className={styles.appHeader}>
        {/* 触发选择文件 */}
       <button onClick={uploadFile}>上传文件</button>
      </header>
    </div>
  )
}

export default App
