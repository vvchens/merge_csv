const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs-extra');
const csv = require('csv-parser');

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
    let isFirstLine = true;

    await new Promise((resolve, reject) => {
      readStream
        .pipe(csv())
        .on('headers', (headers) => {
          if (isFirstFile) {
            writeStream.write(headers.join(',') + '\n');
          }
        })
        .on('data', (row) => {
          const rowData = Object.values(row).join(',');
          if (isFirstFile || !isFirstLine) {
            if (rowData.trim()) { // Check if the row is not empty
              writeStream.write(rowData + '\n');
            }
          }
          isFirstLine = false;
        })
        .on('end', () => {
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