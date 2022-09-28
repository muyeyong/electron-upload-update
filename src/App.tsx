import { useState } from 'react'
import styles from 'styles/app.module.scss'
import { Link } from "react-router-dom";

const App: React.FC = () => {
  const [count, setCount] = useState(0)
  const uploadFile = () => {
    postMessage({ payload: 'uploadFile' }, '*')
  }

// 使用路由
  return (
    <div className={styles.app}>
      <header className={styles.appHeader}>
        {/* 触发选择文件 */}
       <button onClick={uploadFile}>上传文件</button>
       <Link to={'/a'}>跳转到检查更新</Link>
      </header>
    </div>
  )
}

export default App
