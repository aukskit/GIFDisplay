const {
  app,
  BrowserWindow,
  ipcMain,
  Tray,
  Menu,
  screen,
  shell,
} = require("electron");
const path = require("path");
const fs = require("fs");

const __appPath = app.getAppPath();
let mainWindow;
let settingsWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
  });

  mainWindow.loadFile(path.join(__dirname, "index.html"));

  // ウィンドウが閉じられたときにアプリケーションを終了
  mainWindow.on("closed", () => {
    mainWindow = null;
    if (process.platform !== "darwin") {
      app.quit();
    }
  });

  // ウィンドウがフォーカスを失ったときに close ボタンを非表示にする
  mainWindow.on("blur", () => {
    if (!settingsWindow.isFocused()) {
      settingsWindow.hide();
    }
    mainWindow.webContents.send("update-content", {
      message: { command: "blur" },
    });
  });

  // ウィンドウがフォーカスされたときに close ボタンを表示する
  mainWindow.on("focus", () => {
    mainWindow.webContents.send("update-content", {
      message: { command: "focus" },
    });
    mainWindow.setAlwaysOnTop(true, "normal");
  });
}

function createSettingsWindow() {
  settingsWindow = new BrowserWindow({
    width: 450,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
    display: "flex",
    frame: false,
    show: false,
    skipTaskbar: true,
  });
  settingsWindow.loadFile(path.join(__dirname, "settings.html"));

  // ウィンドウがフォーカスを失ったときに非表示にする
  settingsWindow.on("blur", () => {
    if (!mainWindow.isFocused()) {
      settingsWindow.hide();
    }
  });

  // ウィンドウが閉じられたときにアプリケーションを終了
  settingsWindow.on("closed", () => {
    settingsWindow = null;
    if (process.platform !== "darwin") {
      app.quit();
    }
  });

  showSettingsWindow();
}

function showSettingsWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  settingsWindow.setPosition(
    width - settingsWindow.getBounds().width,
    height - settingsWindow.getBounds().height
  );
  settingsWindow.show();
}

function setTray() {
  tray = new Tray(path.join(__appPath, "resources/icon/favicon.ico"));
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Open Setting",
      click: function () {
        showSettingsWindow();
      },
    },
    {
      label: "Quit",
      click: function () {
        app.isQuiting = true;
        app.quit();
      },
    },
  ]);

  tray.setToolTip("GIFDisplay");
  tray.setContextMenu(contextMenu);

  tray.on("click", () => {
    settingsWindow.isVisible() ? settingsWindow.hide() : showSettingsWindow();
  });
}

app.whenReady().then(() => {
  createWindow();
  createSettingsWindow();
  setTray();

  ipcMain.handle("read-json", async (event, filePath, keys) => {
    try {
      const data = fs.readFileSync(filePath, "utf8");
      const jsonData = JSON.parse(data);
      if (Array.isArray(keys)) {
        let result = {};
        keys.forEach((key) => {
          result[key] = jsonData[key];
        });
        return result;
      } else {
        return jsonData[keys];
      }
    } catch (err) {
      console.error("Error reading JSON file:", err);
      throw err;
    }
  });

  ipcMain.handle("write-json", async (event, filePath, key, value) => {
    try {
      let jsonData = {};
      if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, "utf8");
        jsonData = JSON.parse(data);
      }
      jsonData[key] = value;
      fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2), "utf8");
      return "JSON file written successfully";
    } catch (err) {
      console.error("Error writing JSON file:", err);
      throw err;
    }
  });

  ipcMain.handle("read-directory", async (event, directoryPath) => {
    try {
      const files = fs.readdirSync(directoryPath);
      return files;
    } catch (err) {
      console.error("Error reading directory:", err);
      throw err;
    }
  });

  ipcMain.handle("get-path", async (event, directory, filename = null) => {
    try {
      let appPath = __appPath;
      if (__appPath.includes("app.asar")) {
        appPath = path.join(__appPath, "../..");
      }
      if (filename != null) {
        return path.join(appPath, directory, filename);
      } else {
        return path.join(appPath, directory);
      }
    } catch (err) {
      console.error("Error getting file path:", err);
      throw err;
    }
  });

  ipcMain.handle("show-settings-window", async (event) => {
    showSettingsWindow();
  });

  ipcMain.handle("open-folder", async (event, path) => {
    shell.openPath(path);
  });

  ipcMain.handle("quit-application", async (event) => {
    app.quit();
  });

  ipcMain.handle("open-dev-tools", async (event, window) => {
    switch (window) {
      case "index.js":
        mainWindow.webContents.openDevTools();
        break;
      case "settings.js":
        settingsWindow.webContents.openDevTools();
        break;
      default:
        break;
    }
  });

  ipcMain.on("update-index", (event, data) => {
    if (mainWindow) {
      mainWindow.webContents.send("update-content", data);
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
