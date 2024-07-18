// index.js
function setGif(size, file) {
  let gif = document.getElementById("gif");
  window.electronAPI.getPath("resources/images", file).then((imageUrl) => {
    gif.src = imageUrl;
  });
  const ratio = gif.naturalWidth / gif.naturalHeight;
  gif.width = size;
  gif.height = size / ratio;
  window.resizeTo(size, size / ratio);
  gif.addEventListener("load", () => {
    gif.style.display = "";
  });
}

function resetGif() {
  let gif = document.getElementById("gif");
  gif.src = gif.getAttribute("src");
}

window.electronAPI.onUpdateContent((data) => {
  const command = data.message.command;
  switch (command) {
    case "start":
      window.electronAPI.setVisibility(true);
      setGif(data.message.size, data.message.file);
      break;
    case "clear":
      window.electronAPI.setVisibility(false);
      break;
    default:
      window.alert("Unknown command:", command);
      break;
  }
});
