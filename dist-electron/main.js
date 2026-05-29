import { BrowserWindow, app } from "electron";
import path, { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
//#region electron/main.js
var __dirname = dirname(fileURLToPath(import.meta.url));
function createWindow() {
	const win = new BrowserWindow({
		width: 1024,
		height: 768,
		frame: true,
		autoHideMenuBar: true,
		icon: join(__dirname, "../public/assets/VWLogo.ico"),
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false
		}
	});
	if (process.env.VITE_DEV_SERVER_URL) win.loadURL(process.env.VITE_DEV_SERVER_URL);
	else win.loadFile(path.join(__dirname, "../dist/index.html"));
}
app.whenReady().then(createWindow);
app.on("window-all-closed", () => {
	if (process.platform !== "darwin") app.quit();
});
app.on("ready", () => {});
//#endregion
