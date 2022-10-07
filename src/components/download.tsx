import { FC, useCallback } from 'react'
import { Button } from 'antd'
import { Link } from 'react-router-dom'
import styles from './download.sass'

// https://kuaimai-sheji-prod.oss-cn-zhangjiakou.aliyuncs.com/app/%E7%BB%AB%E4%BA%91%20PIM-1.1.0.dmg
const download: FC = () => {
    const startDownload = useCallback(() => {
        const url = 'https://kuaimai-sheji-prod.oss-cn-zhangjiakou.aliyuncs.com/app/%E7%BB%AB%E4%BA%91%20PIM-1.1.0.dmg'
        // 如果需要主进程的返回值用postMessage不行
        postMessage({ payload: 'download', url }, "*")
    }, [])
    const pauseDownload = useCallback(() => {
        const url = 'https://kuaimai-sheji-prod.oss-cn-zhangjiakou.aliyuncs.com/app/%E7%BB%AB%E4%BA%91%20PIM-1.1.0.dmg'
        // 如果需要主进程的返回值用postMessage不行
        postMessage({ payload: 'pauseDownload', url }, "*")
    }, [])
    const cancelDownload = useCallback(() => {
        const url = 'https://kuaimai-sheji-prod.oss-cn-zhangjiakou.aliyuncs.com/app/%E7%BB%AB%E4%BA%91%20PIM-1.1.0.dmg'
        // 如果需要主进程的返回值用postMessage不行
        postMessage({ payload: 'cancelDownload', url }, "*")
    }, [])
    const resumeDownload = useCallback(() => {
        const url = 'https://kuaimai-sheji-prod.oss-cn-zhangjiakou.aliyuncs.com/app/%E7%BB%AB%E4%BA%91%20PIM-1.1.0.dmg'
        // 如果需要主进程的返回值用postMessage不行
        postMessage({ payload: 'resumeDownload', url }, "*")
    }, [])
    return <div> 
       <Button onClick={ startDownload }>点击下载</Button> 
       <Button onClick={pauseDownload}>暂停下载</Button>
       <Button onClick={resumeDownload}>继续下载</Button>
       <Button onClick={cancelDownload}>取消下载</Button>
       <Link to={'/'}>返回</Link>
       <div className={styles.progress}>

       </div>
    </div>
}

export default download