// ==========================================
// BASE DE DADOS DE JOGOS (HUB)
// ==========================================

const modulosGlob = import.meta.glob('../../public/jogos/*/config.js', { eager: true });

export const gamesDB = Object.entries(modulosGlob).map(([caminhoArquivo, modulo]) => {
  const config = { ...modulo.default };
  
  // CORREÇÃO: Substituir '../../public' por '.' para forçar a criação de um caminho relativo
  // Ex: '../../public/jogos/BlueAndGreen/config.js' transforma-se em './jogos/BlueAndGreen/'
  const pastaBase = caminhoArquivo.replace('../../public', '.').replace('config.js', '');

  if (config.image && config.image.startsWith('./')) {
    config.image = config.image.replace('./', pastaBase);
  }
  
  if (config.url && config.url.startsWith('./')) {
    config.url = config.url.replace('./', pastaBase);
  }

  return config;
});