import { BrowserWindow, app } from "electron";
import { join } from "node:path";
//#region electron/main.js
function createWindow() {
	const win = new BrowserWindow({
		width: 1024,
		height: 768,
		frame: true,
		icon: join(app.getAppPath(), "public/assets/VWLogo.ico"),
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false,
			preload: join(app.getAppPath(), "preload.js")
		}
	});
	if (process.env.VITE_DEV_SERVER_URL) win.loadURL(process.env.VITE_DEV_SERVER_URL);
	else win.loadFile(join(app.getAppPath(), "dist/index.html"));
}
app.whenReady().then(createWindow);
app.on("window-all-closed", () => {
	if (process.platform !== "darwin") app.quit();
});
//#endregion
