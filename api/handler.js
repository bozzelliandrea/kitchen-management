const {ipcMain} = require('electron');
const io = require("./lib/io");
const window = require("./lib/window");

function init() {
  ipcMain.handle('fs::on-plate-add', io.addPlate);
  ipcMain.handle('fs::on-plate-get-all', io.readPlates);
  ipcMain.handle('fs::on-plate-get-by-id', io.readPlateById);
  ipcMain.handle('fs::on-plate-delete-by-id', io.deletePlateById);
  ipcMain.handle('fs::on-plate-update', io.updatePlate);

  ipcMain.handle('window::new-tab', window.routeOnNewTab);
}

module.exports = {init}
