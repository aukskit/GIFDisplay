# <img src="resources/icon/favicon.ico" width=48> GIFDisplay

## Overview

This application displays GIF on your desktop. It is built with Electron and supports cross-platform compatibility.

## Screenshot

![](images/screenshot.gif)

## How To Use

1. Download the latest release of the application from the [Releases](https://github.com/aukskit/GIFDisplay/releases/) page.
1. Locate the file named `GIFDisplay.1.x.x.exe` or `GIFDisplay.Setup.1.0.0.exe` in the downloaded folder.
1. Double-click the `GIFDisplay.1.x.x.exe` file to run the application directly, or double-click the `GIFDisplay.Setup.1.0.0.exe` file to install the application.
1. You can display your desired GIF by placing it in a specific folder, which you can open by clicking the folder icon (📁) in the settings window. A restart of the application is required after adding the GIF.

## Keyboard Shortcuts

| Description      | Keys  |
| ---------------- | ----- |
| Open setting     | `s`   |
| Quit application | `esc` |

# For Developers

## Prerequisites

- Node.js (version 20.11.1 or higher)
- npm (version 10.2.4 or higher)
- Git (for cloning the repository)

## Getting Started

1. Clone the repository:

   ```bash
   git clone https://github.com/aukskit/GIFDisplay.git
   ```

1. Navigate to the project directory:

   ```bash
   cd GIFDisplay
   ```

1. Install dependencies:

   ```bash
   npm install
   ```

1. Start the application:
   ```bash
   npm run start
   ```

## Building and installation

1. Run the build command:

   ```bash
   npm run build
   ```

   This command needs to be executed in a Command Prompt running as an administrator.

1. Run the `GIFDisplay Setup 1.0.0.exe` located in the dist folder.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
