import { app, BrowserWindow } from 'electron';
import path, { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function createWindow() {
  const win = new BrowserWindow({
    width: 1024,
    height: 768,
    frame: true,
    autoHideMenuBar: true,
    icon: join(__dirname, '../public/assets/VWLogo.ico'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
      // A linha do preload foi removida para parar de procurar um arquivo inexistente
    }
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    // CORREÇÃO: Usar '../dist/index.html' para voltar um diretório 
    // e acessar a pasta 'dist' gerada pelo Vite na raiz
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('ready', () => {
});