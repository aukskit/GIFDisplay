// settings.js
var Context;

if (Context === undefined) {
  Context = function () {
    this.init = function () {
      // Size
      const size = document.getElementById("size-slider");
      this.load(["size"]).then((value) => {});
      size.addEventListener("input", (event) => {
        this.save("size", size.value);
        this.sendCommand("resize");
      });

      // File
      const file = document.getElementById("file");
      this.readImages().then((fileNames) => {
        if (fileNames == undefined) {
        } else {
          this.load(["file"]).then((value) => {
            fileNames.forEach((fileName, index) => {
              const option = document.createElement("option");
              option.value = fileName;
              option.textContent = fileName;
              file.appendChild(option);
              if (fileName == value.file) {
                file.selectedIndex = index;
              }
            });
          });
        }
      });
      file.addEventListener("change", (event) => {
        this.handleFileChanged(event).catch(console.error);
      });

      // Image
      this.setImage();
      this.sendCommand("start");

      // Start
      const start = document.getElementById("start");
      start.addEventListener("click", (event) => {
        this.sendCommand("start");
        this.setImage();
      });

      // Enable close button
      const enableCloseButton = document.getElementById("enable-close-button");
      this.load(["enableCloseButton"]).then((value) => {
        if (value.enableCloseButton == undefined) {
          this.save("enableCloseButton", false);
        } else {
          enableCloseButton.checked = value.enableCloseButton;
        }
        sendCloseButtonEnableCommand(enableCloseButton.checked);
      });
      enableCloseButton.addEventListener("input", (event) => {
        this.save("enableCloseButton", enableCloseButton.checked);
        sendCloseButtonEnableCommand(enableCloseButton.checked);
      });

      // Folder
      const folder = document.getElementById("folder");
      folder.addEventListener("click", (event) => {
        this.openFolder();
      });

      // Key Down Event
      window.addEventListener("keydown", (event) => {
        if (event.key === "F12") {
          window.electronAPI.openDevTools("settings.js");
        } else if (event.key === "Escape") {
          window.electronAPI.quitApplication();
        }
      });
    };

    this.handleSizeChanged = async function (event) {
      this.save("size", event.target.value);
    };

    this.handleFileChanged = async function (event) {
      var filename = event.target.value;
      this.save("file", filename);
      const imageUrl = await window.electronAPI.getPath(
        "resources/images",
        filename
      );
      var image = document.getElementById("image");
      image.src = imageUrl;
    };

    this.load = async function (keys) {
      const filePath = "resources/userData/storage.json"; // ここに読み込みたいファイルのパスを指定します
      try {
        const data = await window.electronAPI.readJSON(filePath, keys);
        return data;
      } catch (err) {
        console.error("Error reading JSON file:", err);
      }
    };

    this.save = async function (key, value) {
      const filePath = "resources/userData/storage.json"; // ここに書き込みたいJSONファイルのパスを指定します
      try {
        const result = await window.electronAPI.writeJSON(filePath, key, value);
      } catch (err) {
        console.error("Error writing JSON file:", err);
      }
    };

    this.readImages = async function () {
      try {
        const imageDirectory = await window.electronAPI.getPath(
          "resources/images"
        );
        const result = await window.electronAPI.readDirectory(imageDirectory);
        return result;
      } catch (err) {
        console.error("Error reading images folder:", err);
      }
    };

    this.setImage = async function () {
      this.load(["file"]).then(async (value) => {
        var image = document.getElementById("image");
        window.electronAPI
          .getPath("resources/images", value.file)
          .then((imageUrl) => {
            image.src = imageUrl;
          });
      });
    };

    this.sendCommand = async function (command) {
      this.load(["size", "file"]).then(async (value) => {
        window.electronAPI.sendToIndex({
          message: { command: command, size: value.size, file: value.file },
        });
      });
    };

    this.openFolder = async function () {
      const imagesFolderPath = await window.electronAPI.getPath(
        "resources/images"
      );
      window.electronAPI.openFolder(imagesFolderPath);
    };

    this.sendCloseButtonEnableCommand = async function (checked) {
      const data = {
        message: { command: "enable-close-button", checked: checked },
      };
      window.electronAPI.sendToIndex(data);
    };

    return this;
  };
}

var context = Context();
context.init();
