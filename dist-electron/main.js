import { BrowserWindow as e, app as t } from "electron";
import n, { dirname as r, join as i } from "node:path";
import { fileURLToPath as a } from "node:url";
//#region electron/main.js
var o = r(a(import.meta.url));
function s() {
	let t = new e({
		width: 1024,
		height: 768,
		frame: !0,
		autoHideMenuBar: !0,
		icon: i(o, "../public/assets/VWLogo.ico"),
		webPreferences: {
			nodeIntegration: !0,
			contextIsolation: !1
		}
	});
	process.env.VITE_DEV_SERVER_URL ? t.loadURL(process.env.VITE_DEV_SERVER_URL) : t.loadFile(n.join(o, "../dist/index.html"));
}
t.whenReady().then(s), t.on("window-all-closed", () => {
	process.platform !== "darwin" && t.quit();
}), t.on("ready", () => {});
//#endregion
