// preload.js
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  readJSON: (filePath, keys) => ipcRenderer.invoke("read-json", filePath, keys),
  writeJSON: (filePath, key, value) =>
    ipcRenderer.invoke("write-json", filePath, key, value),
  sendToIndex: (data) => ipcRenderer.send("update-index", data),
  onUpdateContent: (callback) =>
    ipcRenderer.on("update-content", (event, data) => callback(data)),
  readDirectory: (directoryPath) =>
    ipcRenderer.invoke("read-directory", directoryPath),
  getPath: (directory, filename) =>
    ipcRenderer.invoke("get-path", directory, filename),
  setVisibility: (visible) => ipcRenderer.invoke("set-visibility", visible),
  openFolder: (path) => ipcRenderer.invoke("open-folder", path),
  showSettingsWindow: () => ipcRenderer.invoke("show-settings-window"),
  quitApplication: () => ipcRenderer.invoke("quit-application"),
  openDevTools: (window) => ipcRenderer.invoke("open-dev-tools", window),
});
