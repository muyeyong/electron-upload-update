import { autoUpdater } from 'electron-updater'
import { ipcMain, BrowserWindow } from 'electron'
import log from 'electron-log'
import { platform } from 'os'


export default (win: BrowserWindow) => {
  autoUpdater.logger = log
  autoUpdater.setFeedURL({
    provider: 'generic',
    channel: platform() === 'darwin' ? 'latest' : 'latest-win32',
    url: `http://127.0.0.1:8877`,
  });
  autoUpdater.autoDownload = false
  
  // autoUpdater.checkForUpdates()
  ipcMain.on("checkForUpdates", (e, arg) => {
    console.log('checkForUpdates')
    autoUpdater.checkForUpdates();
  });

  ipcMain.on('confirmUpdate', () => {
    autoUpdater.downloadUpdate()
  })
  
  autoUpdater.on("error", function (error) {
    log.info('download-progress-error', error)
    console.error("update error", error)
  });
  
  autoUpdater.on("update-available", function (info) {
    // 4. 告诉渲染进程有更新，info包含新版本信息
    log.info("update-available", info)
    win.webContents.send("updateAvailable", { info, other: '有可用的更新'});
  });
  autoUpdater.on("update-not-available", function (info) {
    printUpdaterMessage('updateNotAvailable');
    console.log('info', info)
  })
  
  autoUpdater.on("download-progress", function (progressObj) {
    // printUpdaterMessage('downloadProgress');
    log.info('download-progress')
    console.log('download-progress')
    win.webContents.send("downloadProgress", progressObj);
  });
  
  // 10. 下载完成，告诉渲染进程，是否立即执行更新安装操作
  autoUpdater.on("update-downloaded", function () {
    log.info('update-downloaded')
      // mainWindow.webContents.send("updateDownloaded");
      // 12. 立即更新安装
      // ipcMain.on("updateNow", (e, arg) => {
      //   autoUpdater.quitAndInstall();
      // });
    }
  );
  
  function printUpdaterMessage(arg) {
    let message = {
      error: "更新出错",
      checking: "正在检查更新",
      updateAvailable: "检测到新版本",
      downloadProgress: "下载中",
      updateNotAvailable: "无新版本",
    };
    win.webContents.send("printUpdaterMessage", message[arg]??arg);
   }
}
 