<script setup>
import { ref, computed, onMounted } from 'vue';
import { gamesDB as importedGames } from './games/game.js';

import Registro from './components/Registro.vue';
import TelaJogo from './components/TelaJogo.vue';
import AdicionarJogo from './components/AdicionarJogo.vue';

// ==========================================
// ESTADO DE AUTENTICAÇÃO E DADOS LOCAIS
// ==========================================
const currentUser = ref(null);

const userCustomGames = ref([]);
const userFavorites = ref([]); 

const fileInput = ref(null);

// ==========================================
// ESTADO DO HUB E JOGO
// ==========================================
const isPlaying = ref(false);
const currentGame = ref(null);
const showAddGameModal = ref(false);

const defaultGames = ref(importedGames);

// ==========================================
// PROPRIEDADES COMPUTADAS
// ==========================================
const allGames = computed(() => [...defaultGames.value, ...userCustomGames.value]);
const featuredGame = computed(() => allGames.value[0]);
const popularGames = computed(() => allGames.value.slice(1));

// Compara pelo ID definido pelo desenvolvedor no config.js
const favoriteGames = computed(() => allGames.value.filter(game => userFavorites.value.includes(game.id)));

const relatedGames = computed(() => {
  if (!currentGame.value) return [];
  return allGames.value
    .filter(g => g.id !== currentGame.value.id)
    .sort(() => 0.5 - Math.random())
    .slice(0, 4);
});

// ==========================================
// SISTEMA DE UTILIZADORES E PERFIL
// ==========================================
const carregarDadosUsuario = () => {
  const users = JSON.parse(localStorage.getItem('vw_users') || '{}');
  const userData = users[currentUser.value.username];
  
  if (userData) {
    userCustomGames.value = userData.customGames || [];
    userFavorites.value = userData.favorites || [];
    currentUser.value.avatar = userData.avatar || ''; 
  }
};

const salvarDadosUsuario = () => {
  if (!currentUser.value) return;
  const users = JSON.parse(localStorage.getItem('vw_users') || '{}');
  users[currentUser.value.username] = {
    password: currentUser.value.password,
    customGames: userCustomGames.value,
    favorites: userFavorites.value,
    avatar: currentUser.value.avatar || '' 
  };
  localStorage.setItem('vw_users', JSON.stringify(users));
};

const handleLoginSuccess = (username) => {
  const users = JSON.parse(localStorage.getItem('vw_users') || '{}');
  currentUser.value = { username, password: users[username].password };
  carregarDadosUsuario();
};

const logout = () => {
  currentUser.value = null;
  userCustomGames.value = [];
  userFavorites.value = [];
  localStorage.removeItem('vw_active_user');
  backToHub();
};

const verificarSessao = () => {
  const activeUser = localStorage.getItem('vw_active_user');
  if (activeUser) {
    handleLoginSuccess(activeUser);
  }
};

const triggerFileInput = () => {
  if (fileInput.value) fileInput.value.click();
};

const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
    alert('Por favor, selecione uma imagem no formato PNG ou JPEG.');
    return;
  }

  if (file.size > 2 * 1024 * 1024) {
    alert('A imagem é muito grande. Escolha um arquivo com menos de 2MB.');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    currentUser.value.avatar = e.target.result;
    salvarDadosUsuario();
  };
  reader.readAsDataURL(file);
};

// ==========================================
// MÉTODOS DE JOGO E FAVORITOS
// ==========================================
const playGame = (game) => {
  currentGame.value = game;
  isPlaying.value = true;
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const backToHub = () => {
  isPlaying.value = false;
  currentGame.value = null;
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const toggleFavorite = (game, event) => {
  if (event) event.stopPropagation(); 
  const index = userFavorites.value.indexOf(game.id);
  if (index === -1) { userFavorites.value.push(game.id); } 
  else { userFavorites.value.splice(index, 1); }
  salvarDadosUsuario();
};

// Verifica pelo ID
const isFavorite = (gameId) => userFavorites.value.includes(gameId);

// Lida com o jogo enviado pelo componente AdicionarJogo.vue
const salvarNovoJogo = (novoJogo) => {
  // === FILTRO INTELIGENTE DE CAMINHOS LOCAIS ===
  // Substitui barras invertidas do Windows por barras normais
  let urlCorrigida = novoJogo.url.replace(/\\/g, '/');
  let imgCorrigida = novoJogo.image ? novoJogo.image.replace(/\\/g, '/') : '';

  // Intercepta se o utilizador colou o caminho inteiro "C:\...\public\jogos\..."
  // e converte para o formato web relativo "/jogos/..."
  if (urlCorrigida.includes('/public/jogos/')) {
    urlCorrigida = '/jogos/' + urlCorrigida.split('/public/jogos/')[1];
  }
  if (imgCorrigida.includes('/public/jogos/')) {
    imgCorrigida = '/jogos/' + imgCorrigida.split('/public/jogos/')[1];
  }

  // Se o caminho continuar a ser um file:/// externo (fora do projeto), emite um aviso.
  if (urlCorrigida.startsWith('file:///')) {
    alert("Aviso de Segurança:\nO sistema bloqueia o carregamento direto de ficheiros do computador (file:///).\n\nSe o jogo não carregar, certifique-se de que a pasta dele está dentro de 'public/jogos/' no seu projeto.");
  }

  novoJogo.url = urlCorrigida;
  novoJogo.image = imgCorrigida;
  // =============================================

  userCustomGames.value.push(novoJogo);
  salvarDadosUsuario();
  showAddGameModal.value = false;
};

// Remove um jogo local
const removerJogoLocal = (gameId, event) => {
  if (event) event.stopPropagation(); // Evita abrir o jogo
  
  if (confirm('Tem a certeza que deseja remover este jogo local da lista? O jogo não será apagado do seu disco.')) {
    // Remove dos jogos locais
    userCustomGames.value = userCustomGames.value.filter(game => game.id !== gameId);
    
    // Remove dos favoritos se estiver lá
    const favIndex = userFavorites.value.indexOf(gameId);
    if (favIndex !== -1) {
      userFavorites.value.splice(favIndex, 1);
    }
    
    salvarDadosUsuario();
  }
};

// ==========================================
// CICLO DE VIDA
// ==========================================
onMounted(() => {
  verificarSessao();
});
</script>

<template>
  <div class="app-container">
    
    <header class="header">
      <div class="header-container">
        <div class="logo" @click="currentUser ? backToHub() : null">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="logo-icon icon-lg"><line x1="6" y1="12" x2="10" y2="12"></line><line x1="8" y1="10" x2="8" y2="14"></line><line x1="15" y1="13" x2="15.01" y2="13"></line><line x1="18" y1="11" x2="18.01" y2="11"></line><rect x="2" y="6" width="20" height="12" rx="2"></rect></svg>
          <span class="logo-text">Virtual World</span>
        </div>

        <template v-if="currentUser">
          <div class="header-actions" style="display: flex; align-items: center; gap: 1rem;">
            
            <div @click="triggerFileInput" style="display: flex; align-items: center; gap: 0.5rem; margin-right: 1rem; color: #e2e8f0; cursor: pointer;" title="Clique para alterar a foto de perfil">
              <img v-if="currentUser.avatar" :src="currentUser.avatar" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover; border: 2px solid #818cf8;" alt="Perfil" />
              <div v-else style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(to right, #818cf8, #22d3ee); display: flex; align-items: center; justify-content: center;">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: white; opacity: 0.8;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
              </div>
              <span style="font-size: 0.875rem;">Bem-vindo(a), <strong style="color: #818cf8;">{{ currentUser.username }}</strong></span>
            </div>

            <input type="file" ref="fileInput" accept="image/png, image/jpeg, image/jpg" style="display: none" @change="handleFileUpload" />

            <button @click="showAddGameModal = true" class="btn-outline">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-sm"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              <span>Adicionar Jogo</span>
            </button>
            <button @click="logout" class="btn-outline btn-danger">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-sm"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
              <span>Sair</span>
            </button>
          </div>
        </template>
      </div>
    </header>

    <div class="main-content">
      
      <Registro v-if="!currentUser" @login-success="handleLoginSuccess" />

      <main v-else-if="!isPlaying">
        <section v-if="featuredGame" class="hero-section">
          <img :src="featuredGame.image" :alt="featuredGame.title" class="hero-bg">
          <div class="hero-overlay"></div>
          
          <div class="hero-content">
            <span class="tag-destaque">Destaque</span>
            <h1 class="hero-title">{{ featuredGame.title }}</h1>
            <p class="hero-desc">{{ featuredGame.description }}</p>
            <button @click="playGame(featuredGame)" class="btn-play">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-sm"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
              <span>Jogar Agora</span>
            </button>
          </div>
        </section>

        <section>
          <h2 class="section-title text-pink" style="display: flex; align-items: center; gap: 0.5rem;">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #ec4899;"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
            Os Meus Favoritos
          </h2>

          <div v-if="favoriteGames.length > 0" class="games-grid">
            <div v-for="game in favoriteGames" :key="game.id" @click="playGame(game)" class="game-card">
              <div class="game-card-img-wrapper">
                <img :src="game.image" :alt="game.title" class="game-card-img">
                <div class="play-overlay">
                  <div class="play-icon-circle">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                  </div>
                </div>
              </div>
              <div class="game-card-info" style="padding: 1rem; display: flex; justify-content: space-between; align-items: flex-start;">
                <div style="overflow: hidden;">
                  <h3 class="game-card-title">{{ game.title }}</h3>
                  <p class="game-card-category">{{ game.category }}</p>
                </div>
                <div style="display: flex; gap: 0.5rem; align-items: center;">
                    <button @click="(e) => toggleFavorite(game, e)" :style="{ color: isFavorite(game.id) ? '#ec4899' : '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }" title="Remover dos Favoritos">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" :fill="isFavorite(game.id) ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                    </button>
                    <button v-if="game.id.startsWith('custom_')" @click="(e) => removerJogoLocal(game.id, e)" style="color: #ef4444; background: none; border: none; cursor: pointer;" title="Remover Jogo Local">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    </button>
                </div>
              </div>
            </div>
          </div>
          <div v-else style="padding: 2rem; text-align: center; background-color: #1e293b; border-radius: 0.75rem; border: 1px dashed #334155; margin-bottom: 2rem;">
            <p style="color: #94a3b8;">Ainda não adicionaste jogos aos favoritos. Clica no coração num jogo para o guardares aqui!</p>
          </div>
        </section>

        <section v-if="userCustomGames.length > 0">
          <h2 class="section-title text-green" style="display: flex; align-items: center; gap: 0.5rem;">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #10b981;"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg>
            Jogos Locais
          </h2>
          <div class="games-grid">
            <div v-for="game in userCustomGames" :key="game.id" @click="playGame(game)" class="game-card">
              <div class="game-card-img-wrapper">
                <img :src="game.image" :alt="game.title" class="game-card-img">
                <div class="play-overlay">
                  <div class="play-icon-circle">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                  </div>
                </div>
              </div>
              <div class="game-card-info" style="padding: 1rem; display: flex; justify-content: space-between; align-items: flex-start;">
                <div style="overflow: hidden;">
                  <h3 class="game-card-title">{{ game.title }}</h3>
                  <p class="game-card-category">{{ game.category }}</p>
                </div>
                <div style="display: flex; gap: 0.5rem; align-items: center;">
                    <button @click="(e) => toggleFavorite(game, e)" :style="{ color: isFavorite(game.id) ? '#ec4899' : '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }" title="Adicionar aos Favoritos">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" :fill="isFavorite(game.id) ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                    </button>
                    <button @click="(e) => removerJogoLocal(game.id, e)" style="color: #ef4444; background: none; border: none; cursor: pointer;" title="Remover Jogo Local">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section v-if="popularGames.length > 0">
          <h2 class="section-title text-orange" style="display: flex; align-items: center; gap: 0.5rem;">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #f97316;"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
            Jogos da Plataforma
          </h2>
          <div class="games-grid">
            <div v-for="game in popularGames" :key="game.id" @click="playGame(game)" class="game-card">
              <div class="game-card-img-wrapper">
                <img :src="game.image" :alt="game.title" class="game-card-img">
                <div class="play-overlay">
                  <div class="play-icon-circle">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                  </div>
                </div>
              </div>
              <div class="game-card-info" style="padding: 1rem; display: flex; justify-content: space-between; align-items: flex-start;">
                <div style="overflow: hidden;">
                  <h3 class="game-card-title">{{ game.title }}</h3>
                  <p class="game-card-category">{{ game.category }}</p>
                </div>
                <button @click="(e) => toggleFavorite(game, e)" :style="{ color: isFavorite(game.id) ? '#ec4899' : '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }" title="Adicionar aos Favoritos">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" :fill="isFavorite(game.id) ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <TelaJogo 
        v-else 
        :current-game="currentGame" 
        :related-games="relatedGames"
        :is-favorite="isFavorite(currentGame.id)"
        @back="backToHub" 
        @play="playGame" 
        @toggle-favorite="toggleFavorite(currentGame)"
      />
      
    </div>

    <footer class="footer" v-if="currentUser">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-lg"><line x1="6" y1="12" x2="10" y2="12"></line><line x1="8" y1="10" x2="8" y2="14"></line><line x1="15" y1="13" x2="15.01" y2="13"></line><line x1="18" y1="11" x2="18.01" y2="11"></line><rect x="2" y="6" width="20" height="12" rx="2"></rect></svg>
      <p>© 2026 Virtual World. Todos os direitos reservados.</p>
      <p class="sub-footer">Plataforma de jogos Indie em Vue.js.</p>
    </footer>

    <AdicionarJogo 
      v-if="showAddGameModal" 
      @close="showAddGameModal = false" 
      @save="salvarNovoJogo" 
    />

  </div>
</template>

<style src="./css/style.css"></style>