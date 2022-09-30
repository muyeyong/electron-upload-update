process.env.DIST = join(__dirname, '../..')
process.env.PUBLIC = app.isPackaged ? process.env.DIST : join(process.env.DIST, '../public')
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

import { app, BrowserWindow, shell, ipcMain, dialog } from 'electron'
import { release, platform } from 'os'
import { join } from 'path'
import fs from 'fs'
import md5 from 'md5'
import FormData from 'form-data'
import { autoUpdater } from 'electron-updater'
import log from 'electron-log'
import { getElectronEnv } from '../utils/common'

// 测试用的
if (!app.isPackaged) {
    Object.defineProperty(app, 'isPackaged', {
        get() {
            return true
        },
    })
}

autoUpdater.logger = log
autoUpdater.setFeedURL({
    provider: 'generic',
    channel: platform() === 'darwin' ? 'latest' : 'latest-win32',
    url: `http://127.0.0.1:8877`,
})
autoUpdater.autoDownload = false

// autoUpdater.checkForUpdates();
ipcMain.on('checkForUpdates', (e, arg) => {
    log.info('checkForUpdates', '开始检查更新')
    autoUpdater.checkForUpdates()
})

autoUpdater.on('error', function (error) {
    log.error('autoUpdater error', error)
})

autoUpdater.on('update-available', function (info) {
    // 4. 告诉渲染进程有更新，info包含新版本信息
    log.info('update-available', info)
    printUpdaterMessage('updateAvailable', info)
})
autoUpdater.on('update-not-available', function (info) {
    log.info('update-not-available', info)
    printUpdaterMessage('updateNotAvailable', info)
})

ipcMain.on('confirmUpdate', () => {
    autoUpdater.downloadUpdate()
})

autoUpdater.on('download-progress', function (progressObj) {
    log.info('download-progress', progressObj)
    printUpdaterMessage('downloadProgress', progressObj.percent)
})

// 10. 下载完成，告诉渲染进程，是否立即执行更新安装操作
autoUpdater.on('update-downloaded', function () {
    // 12. 立即更新安装
    printUpdaterMessage('download')
    log.info('update-downloaded', '下载完成')
    ipcMain.once('updateNow', (e, arg) => {
        log.info('updateNow', '用户确定更新')
        autoUpdater.quitAndInstall()
    })
})

function printUpdaterMessage(type, info?) {
    let message = {
        error: '更新出错',
        checking: '正在检查更新',
        updateAvailable: '检测到新版本',
        downloadProgress: '下载中',
        updateNotAvailable: '无新版本',
        download: '下载完成',
    }
    // 通知是否更新
    win.webContents.send('printUpdaterMessage', message[type], info)
}

// Disable GPU Acceleration for Windows 7
if (release().startsWith('6.1')) app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
    app.quit()
    process.exit(0)
}

let win: BrowserWindow | null = null
// Here, you can also use other preload
const preload = join(__dirname, '../preload/index.js')
const url = process.env.VITE_DEV_SERVER_URL
const indexHtml = join(process.env.DIST, 'index.html')

async function createWindow() {
    win = new BrowserWindow({
        title: 'Main window',
        icon: join(process.env.PUBLIC, 'favicon.svg'),
        webPreferences: {
            preload,
            nodeIntegration: true,
            contextIsolation: false,
        },
    })

    // 测试使用
    win.loadURL(url)
    win.webContents.openDevTools()

    // 正式环境使用
    // if (app.isPackaged) {
    //     win.loadFile(indexHtml)
    // } else {
    //     win.loadURL(url)
    //     win.webContents.openDevTools()
    // }

    // Test actively push message to the Electron-Renderer
    win.webContents.on('did-finish-load', () => {
        win?.webContents.send('main-process-message', new Date().toLocaleString())
    })

    // Make all links open with the browser, not with the application
    win.webContents.setWindowOpenHandler(({ url }) => {
        if (url.startsWith('https:')) shell.openExternal(url)
        return { action: 'deny' }
    })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
    win = null
    if (process.platform !== 'darwin') app.quit()
})

app.on('second-instance', () => {
    if (win) {
        // Focus on the main window if the user tried to open another
        if (win.isMinimized()) win.restore()
        win.focus()
    }
})

app.on('activate', () => {
    const allWindows = BrowserWindow.getAllWindows()
    if (allWindows.length) {
        allWindows[0].focus()
    } else {
        createWindow()
    }
})

ipcMain.on('uploadFile', (event, args) => {
    const filePaths = dialog.showOpenDialogSync({
        title: '选择上传文件',
        defaultPath: app.getPath('downloads'),
        buttonLabel: '上传',
        filters: [],
        properties: ['openFile', 'openDirectory', 'multiSelections', 'showHiddenFiles'],
        message: '同步',
    })
    for (let i = 0; i < filePaths.length; i++) {
        const filePath = filePaths[i]
        const stats = fs.statSync(filePath)
        const chunkSize = 3 * 1024 * 1024
        const size = stats.size
        const pieces = Math.ceil(size / chunkSize)
        const uploadPiece = (startIndex) => {
            const enddata = Math.min(size, (startIndex + 1) * chunkSize)
            const arr = []
            const readStream = fs.createReadStream(filePath, { start: startIndex * chunkSize, end: enddata - 1 })
            readStream.on('data', (data) => {
                arr.push(data)
            })
            readStream.on('end', () => {
                const formdata = new FormData()
                const md5Val = md5(Buffer.from(arr))
                formdata.append('file', Buffer.from(arr))
                formdata.append('md5', md5Val)
                formdata.append('size', size + '')
                formdata.append('chunk', startIndex + '')
                formdata.append('chunks', pieces + '')
                formdata.append('name', filePath)
                /* 
          告诉渲染进程那个任务开始上传了，上传信息传递
         */

                win.webContents.send('uploadPiece', JSON.stringify(formdata))
                // console.log('pieces', pieces, formdata.getHeaders())
                if (startIndex < pieces - 1) {
                    uploadPiece(startIndex + 1)
                }
            })
            readStream.on('error', (err) => {
                console.log('error', err)
            })
        }
        uploadPiece(0)
    }
})

// new window example arg: new windows url
ipcMain.handle('open-win', (event, arg) => {
    const childWindow = new BrowserWindow({
        webPreferences: {
            preload,
        },
    })

    if (app.isPackaged) {
        childWindow.loadFile(indexHtml, { hash: arg })
    } else {
        childWindow.loadURL(`${url}/#${arg}`)
        // childWindow.webContents.openDevTools({ mode: "undocked", activate: true })
    }
})

/* 
  根据不同平台打包
  选择文件

  TODO 2022-09-29 不同平台打包  打包结果上传  
  TODO 2022-09-30 打包结果上传 打包目录清理
 */
