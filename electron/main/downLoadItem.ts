import {dialog, BrowserWindow, app, DownloadItem } from 'electron'
import path from 'path'

export default class Item {
    downloadUrl: string
    win: BrowserWindow
    downloadItem: DownloadItem
    onProgressing: (...args: any) => void
    onCancelled: (...args: any) => void
    onInterrupted: (...args: any) => void
    onCompleted: (...args: any) => void
    constructor(args: { url: string, win: BrowserWindow, onProgressing: () => void, onCancelled: () => void, onInterrupted: () => void, onCompleted: () => void }) {
        this.downloadUrl = args.url
        this.win = args.win 
        this.onProgressing = args.onProgressing
        this.onCancelled = args.onCancelled
        this.onCompleted = args.onCompleted
        this.onInterrupted = args.onInterrupted
        this.start()
    }
    pause() {
        try {
            if (!this.downloadItem) return false
            this.downloadItem.pause()
            return true
        } catch (error) {
            return false
        }
    }
    cancel() {
        try {
            if (!this.downloadItem) return false
            this.downloadItem.cancel()
            return true
        } catch (error) {
            
        }
    }
    resume() {
        try {
            if (!this.downloadItem || !this.downloadItem.canResume()) {
                return false
            } else {
                this.downloadItem.resume()
                return true
            }
        } catch (error) {
            return false
        }
    }
    start() {
        const filePaths = dialog.showOpenDialogSync({
            title: '选择文件存储位置',
            defaultPath: app.getPath('downloads'),
            buttonLabel: '下载',
            filters: [],
            properties: ['openFile', 'openDirectory'],
            message: '下载',
        })
        if (!filePaths) return
        const savePath = filePaths[0]
        this.win.webContents.downloadURL(this.downloadUrl)
        this.win.webContents.session.on('will-download',() => {
            this.downloadItem.setSavePath(path.join(savePath, this.downloadItem.getFilename()))
            this.downloadItem.on('updated', (evt, state) => {
                let value = 0
                if ('progressing' === state) {
                  if (this.downloadItem.getReceivedBytes() && this.downloadItem.getTotalBytes()) 
                     value = Math.ceil(this.downloadItem.getReceivedBytes() / this.downloadItem.getTotalBytes() * 100) 
                     this.onProgressing(this.downloadUrl, value)
                    //  this.win.webContents.send('updateProgressing', value);
                    //  this.win.setProgressBar(value);
                }
            })
            this.downloadItem.on('done', (_event, state) => {
                if (state === 'interrupted') {
                    this.onInterrupted(this.downloadUrl)
                    // dialog.showErrorBox('下载失败', `${this.downloadItem.getFilename()} 下载失败`)
                }
                if (state === 'cancelled') {
                    this.onCancelled(this.downloadUrl)
                    // dialog.showErrorBox('下载取消', `${this.downloadItem.getFilename()} 下载取消`)
                }
                if (state === 'completed') {
                    this.onCompleted(this.downloadUrl)
                    // log.info('下载完成:', this.downloadItem.getFilename())
                }
            })
        })
    }
}

/* TODO 2020-10-05 可中断下载 断点续传 都需要日志文件记录 使用electron-store 
    每一个文件都有一个下载实例 new Download({ url, win }) 提供下载 删除 暂停 
    进入读取文件，恢复
**/
