import { app, BrowserWindow } from 'electron';
import path, { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function createWindow() {
  const win = new BrowserWindow({
    width: 1024,
    height: 768,
    // O frame foi reativado para manter a barra superior nativa
    frame: true,
    // Caminho para o ícone
    icon: join(__dirname, '../public/assets/VWLogo.ico'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js') 
    }
  });

  // Carregamento baseado no ambiente
  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    // Para o binário final (produção), busca o arquivo na raiz da instalação
    // Garantimos que ele procure na pasta 'dist' dentro do diretório do executável
    win.loadFile(path.join(__dirname, 'dist/index.html'));
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Garante que o Electron não falhe ao carregar assets em produção
app.on('ready', () => {
  // Protocolo adicional opcional se necessário para carregar assets locais
});