<script setup>
import { ref } from 'vue';

const emit = defineEmits(['close', 'save']);

const folderPath = ref('');

const handleSelectFolder = async () => {
  try {
    // Usa a API do Sistema de Ficheiros do Navegador para pedir ao utilizador para selecionar um diretório
    const dirHandle = await window.showDirectoryPicker({
      mode: 'read' // Apenas precisamos de ler o diretório
    });
    
    // Como os navegadores por segurança não dão o caminho absoluto (ex: C:\...), 
    // teríamos de processar os ficheiros aqui. No entanto, para simplificar na web
    // ou se isto for convertido para Electron, podemos assumir que o utilizador 
    // digita ou copia/cola o caminho local.
    // 
    // Para um ambiente web puro (como este preview), mostrar a janela nativa do Windows 
    // que retorna a path absoluta C:\ não é possível por segurança.
    // O que se faz no Electron é usar o "dialog.showOpenDialog" através do processo main.
    
    alert('Na versão web, a seleção de diretórios nativos é limitada. Por favor, cole o caminho da pasta.');
    
  } catch (err) {
    console.error('Seleção de pasta cancelada ou falhou', err);
  }
};

const handleSave = () => {
  if (!folderPath.value) {
    return alert("O Caminho da Pasta é obrigatório!");
  }

  const folderParts = folderPath.value.split(/[/\\]/);
  const rawFolderName = folderParts[folderParts.length - 1] || folderParts[folderParts.length - 2] || "Novo Jogo";
  const titleGuesstimate = rawFolderName.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  let finalUrl = folderPath.value;
  if (!finalUrl.startsWith('http') && !finalUrl.startsWith('file:///')) {
    if (/^[A-Za-z]:[/\\]/.test(finalUrl)) {
      finalUrl = 'file:///' + finalUrl.replace(/\\/g, '/');
    }
  }
  
  if (!finalUrl.endsWith('index.html')) {
    finalUrl = finalUrl.replace(/\/$/, '') + '/index.html';
  }

  const folderBaseUrl = finalUrl.replace('/index.html', '');
  const coverUrl = `${folderBaseUrl}/capa.png`;

  const novoJogo = {
    id: 'custom_' + Date.now(),
    title: titleGuesstimate,
    category: 'Jogo Local',
    image: coverUrl,
    description: `Jogo carregado da pasta: ${folderPath.value}`,
    url: finalUrl
  };

  emit('save', novoJogo);
};
</script>

<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Adicionar Jogo da Pasta</h2>
        <button class="btn-close" @click="emit('close')">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
      <div class="modal-body auth-form">
        <p style="color: #94a3b8; margin-bottom: 1.5rem; font-size: 0.875rem;">
          Indique o caminho para a pasta do jogo. O sistema irá procurar o ficheiro <strong>index.html</strong> e a imagem <strong>capa.png</strong> automaticamente.
        </p>

        <div class="form-group" style="display: flex; gap: 0.5rem; flex-direction: column;">
          <label class="form-label">Caminho da Pasta do Jogo</label>
          <div style="display: flex; gap: 0.5rem;">
            <input v-model="folderPath" type="text" class="form-input" placeholder="Ex: C:\MeusJogos\SuperAventura" style="flex: 1;">
            <button @click="handleSelectFolder" class="btn-outline" style="white-space: nowrap;" title="Selecionar Pasta">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg>
            </button>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-outline" @click="emit('close')">Cancelar</button>
        <button class="btn-primary" style="width: auto; margin-top: 0;" @click="handleSave">Adicionar Jogo</button>
      </div>
    </div>
  </div>
</template>