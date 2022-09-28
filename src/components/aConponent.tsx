import { useState, } from 'react'
import styles from 'styles/app.module.scss'
import { Link } from 'react-router-dom'

const App: React.FC = () => {
  const [count, setCount] = useState(0)
  const checkUpdate = async (e:React.MouseEvent<HTMLElement>) => {
    postMessage({ payload: 'checkUpdate' })
  }

  return (
    <div className={styles.app}>
      <header className={styles.appHeader}>
       <button onClick={checkUpdate}>检查更新</button>
        <Link to={'/'}>返回</Link>
      </header>
    </div>
  )
}

export default App
