// The built directory structure
//
// ├─┬ dist
// │ ├─┬ electron
// │ │ ├─┬ main
// │ │ │ └── index.js
// │ │ └─┬ preload
// │ │   └── index.js
// │ ├── index.html
// │ ├── ...other-static-files-from-public
// │
process.env.DIST = join(__dirname, '../..')
process.env.PUBLIC = app.isPackaged ? process.env.DIST : join(process.env.DIST, '../public')
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

import { app, BrowserWindow, shell, ipcMain, dialog } from 'electron'
import { release } from 'os'
import { join } from 'path'
import fs from 'fs'
import md5 from 'md5'
import FormData from 'form-data'
import { autoUpdater } from 'electron-updater'

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

  if (app.isPackaged) {
    win.loadFile(indexHtml)
  } else {
    win.loadURL(url)
    // win.webContents.openDevTools()
  }

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
    filters:[],
    properties: [ 'openFile', 'openDirectory', 'multiSelections', 'showHiddenFiles' ],
    message: '同步'
  })
  for (let i = 0; i < filePaths.length; i++) {
    const filePath = filePaths[i]
    const stats = fs.statSync(filePath)
    const chunkSize = 3*1024*1024
    const size = stats.size
    const pieces = Math.ceil(size / chunkSize)
    const uploadPiece = (startIndex) => {
      const enddata = Math.min(size, (startIndex + 1) * chunkSize)
      const arr = []
      const readStream = fs.createReadStream(filePath, { start: startIndex * chunkSize, end: enddata - 1})
      readStream.on('data', data => {
        arr.push(data)
      })
      readStream.on('end', () => {
        const formdata = new FormData()
        const md5Val = md5(Buffer.from(arr))
        formdata.append('file', Buffer.from(arr))
        formdata.append("md5", md5Val);
        formdata.append("size", size + '')
        formdata.append("chunk", startIndex + '')
        formdata.append("chunks", pieces + '')
        formdata.append("name", filePath)
        /* 
          告诉渲染进程那个任务开始上传了，上传信息传递
         */

        // win.webContents.send('uploadPiece', JSON.stringify(formdata))
        // console.log('pieces', pieces, formdata.getHeaders())
        if(startIndex < pieces - 1) {
          uploadPiece(startIndex + 1)
        }
      })
      readStream.on('error', err => {
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
 */