import Item from './downLoadItem'
import log from 'electron-log'
import { BrowserWindow } from 'electron'

//TODO  url 做key不是很妥当
const downloads = new Map<string, Item>()

const createDownload =  (args: { url: string, win: BrowserWindow}) => {
    const { url, win} = args
    const onCancelled = (...args) => {
        console.log('cancelled')
    }
    const onCompleted = (...args) => {
        console.log('onCompleteed')
    }
    const onInterrupted = (...args) => {
        console.log('onInterrupted')
    }
    const onProgressing = (...args) => {
        console.log('onPregressing')
    }
    const exist = downloads.get(url)
    if (exist) {
        return
    } else {
        downloads.set(url, new Item({
            url,
            win,
            onCompleted,
            onCancelled,
            onInterrupted,
            onProgressing
        }))
    }
}

const pauseDownload = (key: string) => {
    const downloadItem = downloads.get(key)
    if (!downloadItem) return false
    return downloadItem.pause()
}

const cancelDownload = (key: string) => {
    const downloadItem = downloads.get(key)
    if (!downloadItem) return false
    return downloadItem.cancel()
}

const resumeDownload = (key: string) => {
    const downloadItem = downloads.get(key)
    if (!downloadItem) return false
    return downloadItem.resume()
}

export {
    createDownload,
    pauseDownload,
    cancelDownload,
    resumeDownload
}
