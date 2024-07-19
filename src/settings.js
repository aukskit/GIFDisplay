// settings.js
var Context;

if (Context === undefined) {
  Context = function () {
    this.init = function () {
      // Size
      let size = document.getElementById("size");
      this.load(["size"]).then((value) => {
        if (value.size == undefined) {
          this.save("size", "240");
        } else {
          var options = Array.from(size.options);
          options.forEach((option, index) => {
            if (option.value == value.size) {
              size.selectedIndex = index;
            }
          });
        }
      });

      size.addEventListener("change", (event) => {
        this.handleSizeChanged(event).catch(console.error);
      });

      // File
      var file = document.getElementById("file");
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
      let start = document.getElementById("start");
      start.addEventListener("click", (event) => {
        this.sendCommand("start");
        this.setImage();
      });

      // Clear
      let clear = document.getElementById("clear");
      clear.addEventListener("click", (event) => {
        this.sendCommand("clear");
      });

      // Folder
      let folder = document.getElementById("folder");
      folder.addEventListener("click", (event) => {
        this.openFolder();
      });
    };

    this.handleSizeChanged = async function (event) {
      this.save("size", event.target.value);
    };

    this.handleFileChanged = async function (event) {
      var filename = event.target.value;
      this.save("file", filename);
      console.log("File saved as", filename);
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
        const result = await window.electronAPI.readDirectory(
          "resources/images"
        );
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
      // console.log(imagesFolderPath);
      window.electronAPI.openFolder(imagesFolderPath);
    };

    return this;
  };
}

var context = Context();
context.init();
