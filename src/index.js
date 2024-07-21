// index.js

let isCloseButtonEnabled = false;

function init() {
  // Key Down Event
  window.addEventListener("keydown", (event) => {
    if (event.key === "s") {
      window.electronAPI.showSettingsWindow();
    } else if (event.key === "F12") {
      window.electronAPI.openDevTools("index.js");
    } else if (event.key === "Escape") {
      window.electronAPI.quitApplication();
    }
  });

  // Close button event
  const closeButton = document.getElementById("close-button");
  closeButton.addEventListener("click", () => {
    window.electronAPI.quitApplication();
  });
  resizeCloseButton();
}

function setGif(size, file) {
  const gif = document.getElementById("gif");
  window.electronAPI.getPath("resources/images", file).then((imageUrl) => {
    gif.src = imageUrl;
  });
  const ratio = gif.naturalWidth / gif.naturalHeight;
  gif.width = size;
  gif.height = size / ratio;
  window.resizeTo(size, size / ratio);
  gif.addEventListener("load", () => {
    gif.style.display = "";
    resizeGif(size);
  });
}

function resetGif() {
  const gif = document.getElementById("gif");
  gif.src = gif.getAttribute("src");
}

function resizeGif(size) {
  const gif = document.getElementById("gif");
  const ratio = gif.naturalWidth / gif.naturalHeight;
  gif.width = size;
  gif.height = size / ratio;
  window.resizeTo(size, size / ratio);
}

function resizeCloseButton() {
  const closeButton = document.getElementById("close-button");
  closeButton.style.height = closeButton.offsetWidth;
}

function enableCloseButton(enable) {
  if (enable && isCloseButtonEnabled) {
    const closeButton = document.getElementById("close-button");
    closeButton.style.visibility = "";
    const container = document.getElementById("container");
    container.style.backgroundColor = "rgba(0, 255, 0, 0.1)";
  } else {
    const closeButton = document.getElementById("close-button");
    closeButton.style.visibility = "hidden";
    const container = document.getElementById("container");
    container.style.backgroundColor = "";
  }
}

window.electronAPI.onUpdateContent((data) => {
  const command = data.message.command;
  switch (command) {
    case "start":
      setGif(data.message.size, data.message.file);
      enableCloseButton(false);
      break;
    case "resize":
      resizeGif(data.message.size);
      resizeCloseButton();
      break;
    case "focus":
      enableCloseButton(true);
      break;
    case "blur":
      enableCloseButton(false);
      break;
    case "enable-close-button":
      isCloseButtonEnabled = data.message.checked;
      enableCloseButton(data.message.checked);
      break;
    default:
      // window.alert("Unknown command:", command);
      console.log("Unknown command:", command);
      break;
  }
});

init();
