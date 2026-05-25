// ==========================================
// BASE DE DADOS DE JOGOS (HUB)
// ==========================================

// Importa os ficheiros de configuração diretamente das pastas dos jogos.
// Utilizamos import.meta.glob para importar dinamicamente todos os ficheiros config.js
// dentro da pasta public/jogos/ (e subpastas). O Vite trata disto no momento do build.
const modulosGlob = import.meta.glob('../../public/jogos/*/config.js', { eager: true });

// Em vez de usar apenas Object.values, usamos Object.entries para obter o caminho do ficheiro juntamente com o módulo
export const gamesDB = Object.entries(modulosGlob).map(([caminhoArquivo, modulo]) => {
  // Fazemos uma cópia da configuração para podermos modificá-la
  const config = { ...modulo.default };
  
  // Extrai a pasta base do jogo a partir do caminho do config.js
  // Ex: '../../public/jogos/BlueAndGreen/config.js' transforma-se em '/jogos/BlueAndGreen/'
  const pastaBase = caminhoArquivo.replace('../../public', '').replace('config.js', '');

  // Corrige os caminhos relativos (./) transformando-os em caminhos absolutos baseados na diretoria public
  if (config.image && config.image.startsWith('./')) {
    config.image = config.image.replace('./', pastaBase);
  }
  
  if (config.url && config.url.startsWith('./')) {
    config.url = config.url.replace('./', pastaBase);
  }

  return config;
});