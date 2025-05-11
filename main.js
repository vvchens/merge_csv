const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs-extra');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'renderer.js'),
      contextIsolation: false,
      nodeIntegration: true,
    },
  });

  win.loadFile('index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.handle('select-files', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile', 'multiSelections'],
    filters: [{ name: 'CSV Files', extensions: ['csv'] }],
  });
  return result.filePaths;
});

ipcMain.handle('merge-csv', async (event, filePaths) => {
  const outputFilePath = path.join(__dirname, 'merged.csv');
  const writeStream = fs.createWriteStream(outputFilePath);
  let isFirstFile = true;

  for (const filePath of filePaths) {
    const readStream = fs.createReadStream(filePath);
    let buffer = '';
    let isFirstLine = true;

    await new Promise((resolve, reject) => {
      readStream
        .on('data', (chunk) => {
          buffer += chunk.toString();
          let lines = buffer.split('\n');
          buffer = lines.pop(); // Keep the last partial line in the buffer

          lines.forEach((line, index) => {
            if (isFirstFile || (!isFirstLine && index > 0)) {
              if (line.trim()) { // Check if the line is not empty
                writeStream.write(line + '\n');
              }
            }
            isFirstLine = false;
          });
        })
        .on('end', () => {
          if (buffer.trim()) { // Write the last line if it's not empty
            writeStream.write(buffer + '\n');
          }
          isFirstFile = false;
          resolve();
        })
        .on('error', reject);
    });
  }

  writeStream.end(async () => {
    const data = await fs.readFile(outputFilePath, 'utf8');
    await fs.writeFile(outputFilePath, data.trimEnd());
  });

  return outputFilePath;
});