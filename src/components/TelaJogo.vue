<script setup>
import { ref } from 'vue';

const props = defineProps({
  currentGame: {
    type: Object,
    required: true
  },
  relatedGames: {
    type: Array,
    default: () => []
  },
  // Nova propriedade para saber se é favorito ou não
  isFavorite: {
    type: Boolean,
    default: false
  }
});

// Adicionamos o 'toggle-favorite' aos emits
const emit = defineEmits(['back', 'play', 'toggle-favorite']);

const gameIframe = ref(null);

const handleBack = () => {
  // Limpa o src para garantir que a música/processamento do jogo pare ao voltar
  if (gameIframe.value) {
    gameIframe.value.src = "about:blank";
  }
  emit('back');
};

const toggleFullscreen = () => {
  const iframe = gameIframe.value;
  if (!iframe) return;
  if (iframe.requestFullscreen) { iframe.requestFullscreen(); } 
  else if (iframe.webkitRequestFullscreen) { iframe.webkitRequestFullscreen(); } 
  else if (iframe.msRequestFullscreen) { iframe.msRequestFullscreen(); }
};
</script>

<template>
  <main class="game-view-apple">
    <!-- Área Principal -->
    <div class="game-main-area">
      <button @click="handleBack" class="btn-apple-back">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
        <span>Voltar ao Início</span>
      </button>

      <!-- IFRAME DO JOGO -->
      <div class="iframe-glass-container">
        <iframe 
          ref="gameIframe"
          :src="currentGame.url"
          class="game-iframe" 
          allow="fullscreen; autoplay; keyboard"
          frameborder="0">
        </iframe>
      </div>

      <!-- Barra Inferior (Toolbar Apple-style) -->
      <div class="game-toolbar-glass">
        
        <!-- Área de Título e Botão de Favorito -->
        <div class="game-info-titles">
          <div class="game-title-group">
            <h1>{{ currentGame.title }}</h1>
            <span class="game-badge-category">{{ currentGame.category }}</span>
          </div>

          <!-- Botão de Favorito -->
          <button @click="emit('toggle-favorite')" :class="['btn-apple-circle', isFavorite ? 'active-fav' : '']" title="Favoritar Jogo">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" :fill="isFavorite ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
          </button>
        </div>
        
        <div class="game-actions">
          <button @click="toggleFullscreen" class="btn-apple btn-apple-blue">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3"></path><path d="M21 8V5a2 2 0 0 0-2-2h-3"></path><path d="M3 16v3a2 2 0 0 0 2 2h3"></path><path d="M16 21h3a2 2 0 0 0 2-2v-3"></path></svg>
            <span>Tela Cheia</span>
          </button>
        </div>
      </div>

      <!-- Descrição -->
      <div class="game-description-glass">
        <h3 class="box-title-apple">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-apple-blue"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
          Sobre o Jogo
        </h3>
        <p class="box-text-apple">
          {{ currentGame.description }}
        </p>
      </div>
    </div>

    <!-- Sidebar: Jogos Relacionados -->
    <div class="sidebar-apple">
      <h3 class="sidebar-title">Descubra Mais</h3>
      <div class="related-list">
        <div v-for="relGame in relatedGames" :key="relGame.id" @click="emit('play', relGame)" class="related-card-apple">
          <img :src="relGame.image" class="related-img" :alt="relGame.title">
          <div class="related-info">
            <h4 class="related-title">{{ relGame.title }}</h4>
            <p class="related-category">{{ relGame.category }}</p>
          </div>
          <div class="related-chevron">
             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>