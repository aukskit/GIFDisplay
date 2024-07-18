// preload.js
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  readJSON: (filePath, keys) => ipcRenderer.invoke("read-json", filePath, keys),
  writeJSON: (filePath, key, value) =>
    ipcRenderer.invoke("write-json", filePath, key, value),
  sendToIndex: (data) => ipcRenderer.send("update-index", data),
  onUpdateContent: (callback) =>
    ipcRenderer.on("update-content", (event, data) => callback(data)),
  readDirectory: (directory) => ipcRenderer.invoke("read-directory", directory),
  getPath: (directory, filename) =>
    ipcRenderer.invoke("get-path", directory, filename),
  setVisibility: (visible) => ipcRenderer.invoke("set-visibility", visible),
  openFolder: (path) => ipcRenderer.invoke("open-folder", path),
});
