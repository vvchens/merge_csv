const { ipcRenderer } = require('electron');

document.getElementById('select-files').addEventListener('click', async () => {
  const filePaths = await ipcRenderer.invoke('select-files');
  if (filePaths.length === 3) {
    document.getElementById('status').textContent = `Selected files: ${filePaths.join(', ')}`;
    window.selectedFiles = filePaths;
  } else {
    document.getElementById('status').textContent = 'Please select exactly 3 CSV files.';
  }
});

document.getElementById('merge-files').addEventListener('click', async () => {
  if (window.selectedFiles && window.selectedFiles.length === 3) {
    const outputFilePath = await ipcRenderer.invoke('merge-csv', window.selectedFiles);
    document.getElementById('status').textContent = `Files merged successfully: ${outputFilePath}`;
  } else {
    document.getElementById('status').textContent = 'Please select 3 CSV files first.';
  }
});