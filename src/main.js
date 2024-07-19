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

  // mainWindow.webContents.openDevTools(); // 開発者ツールを自動的に開く

  // ウィンドウがフォーカスを失ったときに非表示にする
  mainWindow.on("blur", () => {
    if (!settingsWindow.isFocused()) {
      settingsWindow.hide();
      mainWindow.show();
    }
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

  // settingsWindow.webContents.openDevTools(); // 開発者ツールを自動的に開く

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

  ipcMain.handle("read-directory", async (event, directory) => {
    try {
      const directoryPath = path.join(__appPath, directory);
      const files = fs.readdirSync(directoryPath);
      return files;
    } catch (err) {
      console.error("Error reading directory:", err);
      throw err;
    }
  });

  ipcMain.handle("get-path", async (event, directory, filename = null) => {
    try {
      if (filename != null) {
        return path.join(__appPath, directory, filename);
      } else {
        if (__appPath.includes("app.asar")) {
          return path.join(__appPath, "../..", directory);
        }
        return path.join(__appPath, directory);
      }
    } catch (err) {
      console.error("Error getting file path:", err);
      throw err;
    }
  });

  ipcMain.handle("set-visibility", async (event, visible) => {
    try {
      if (visible) {
        mainWindow.show();
      } else {
        mainWindow.hide();
      }
    } catch (err) {
      console.error("Error set visibility:", err);
      throw err;
    }
  });

  ipcMain.handle("open-folder", async (event, path) => {
    shell.openPath(path);
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
