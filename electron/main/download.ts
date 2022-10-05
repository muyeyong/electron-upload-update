import log from 'electron-log'
import { ipcMain, dialog, BrowserWindow, app } from 'electron'
import path from 'path'


export default (win: BrowserWindow) => {
    ipcMain.on('download', (_event, args) => {
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
        const url = JSON.parse(args)
        win.webContents.downloadURL(url.downloadUrl)
        win.webContents.session.on('will-download', (_event, item) => {
            // item.pause()
            // item.cancel()
            item.setSavePath(path.join(savePath, item.getFilename()))
            item.on('updated', (evt, state) => {
                let value = 0
                if ('progressing' === state) {
                  //此处  用接收到的字节数和总字节数求一个比例  就是进度百分比
                  if (item.getReceivedBytes() && item.getTotalBytes()) 
                     value = Math.ceil(item.getReceivedBytes() / item.getTotalBytes() * 100) 
                       // 把百分比发给渲染进程进行展示
                  win.webContents.send('updateProgressing', value);
                  // mac 程序坞、windows 任务栏显示进度
                  win.setProgressBar(value);
                }
            })
            item.on('done', (_event, state) => {
                if (state === 'interrupted') {
                    dialog.showErrorBox('下载失败', `${item.getFilename()} 下载失败`)
                }
                if (state === 'cancelled') {
                    dialog.showErrorBox('下载取消', `${item.getFilename()} 下载取消`)
                }
                if (state === 'completed') {
                    log.info('下载完成:', item.getFilename())
                }
            })
    })
 })
}
/* TODO 2020-10-05 可中断下载 断点续传 都需要日志文件记录 使用electron-store 
    每一个文件都有一个下载实例 new Download({ url, win }) 提供下载 删除 暂停 
    进入读取文件，恢复
**/
