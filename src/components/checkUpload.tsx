import { useEffect } from 'react'
import styles from 'styles/app.module.scss'
import { Link } from 'react-router-dom'
import { ipcRenderer, IpcRendererEvent } from 'electron'
import { Modal } from 'antd'

const App: React.FC = () => {
    const handleUpdateMessage = (_event: IpcRendererEvent, type: string, info: string) => {
        switch (type) {
            case '检测到新版本':
                Modal.confirm({
                    title: '更新版本',
                    onOk: () => {
                        ipcRenderer.send('confirmUpdate')
                    },
                })
                break
            case '下载完成': {
                Modal.confirm({
                    title: '立即更新',
                    onOk: () => {
                        ipcRenderer.send('updateNow')
                    },
                })
            }
            default:
                break
        }
    }
    useEffect(() => {
        ipcRenderer.on('printUpdaterMessage', handleUpdateMessage)
        return () => {
            ipcRenderer.removeListener('printUpdaterMessage', handleUpdateMessage)
        }
    }, [])

    const checkUpdate = async (e: React.MouseEvent<HTMLElement>) => {
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
