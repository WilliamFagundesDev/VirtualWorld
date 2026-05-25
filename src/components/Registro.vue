<script setup>
import { ref, onMounted, onUpdated, nextTick } from 'vue';

const emit = defineEmits(['login-success']);

const authMode = ref('login'); // 'login' ou 'register'
const authForm = ref({ username: '', password: '' });

const login = () => {
  if (!authForm.value.username || !authForm.value.password) return alert("Preencha todos os campos!");
  
  const users = JSON.parse(localStorage.getItem('vw_users') || '{}');
  const user = users[authForm.value.username];
  
  if (user && user.password === authForm.value.password) {
    localStorage.setItem('vw_active_user', authForm.value.username);
    emit('login-success', authForm.value.username);
    authForm.value = { username: '', password: '' };
  } else {
    alert("Usuário ou senha incorretos!");
  }
};

const register = () => {
  if (!authForm.value.username || !authForm.value.password) return alert("Preencha todos os campos!");
  
  const users = JSON.parse(localStorage.getItem('vw_users') || '{}');
  
  if (users[authForm.value.username]) {
    return alert("Este usuário já existe!");
  }
  
  users[authForm.value.username] = {
    password: authForm.value.password,
    customGames: [],
    favorites: []
  };
  
  localStorage.setItem('vw_users', JSON.stringify(users));
  alert("Conta criada com sucesso! Você já foi logado.");
  login();
};

const updateIcons = () => {
  nextTick(() => { if (window.lucide) { window.lucide.createIcons(); } });
};

onMounted(updateIcons);
onUpdated(updateIcons);
</script>

<template>
  <main class="auth-wrapper">
    <div class="auth-card">
      <i data-lucide="user-circle" class="icon-lg text-accent" style="color: #6366f1; width: 64px; height: 64px; margin-bottom: 1rem;"></i>
      <h2 class="auth-title">{{ authMode === 'login' ? 'Entrar no Hub' : 'Criar Conta' }}</h2>
      
      <div class="auth-form" @submit.prevent>
        <div class="form-group">
          <label class="form-label">Usuário</label>
          <input v-model="authForm.username" type="text" class="form-input" placeholder="Seu apelido">
        </div>
        
        <div class="form-group">
          <label class="form-label">Senha</label>
          <input v-model="authForm.password" type="password" class="form-input" placeholder="Sua senha">
        </div>
        
        <button v-if="authMode === 'login'" @click="login" class="btn-primary">Acessar Plataforma</button>
        <button v-else @click="register" class="btn-primary">Finalizar Cadastro</button>
      </div>
      
      <p class="auth-toggle">
        <template v-if="authMode === 'login'">
          Não tem uma conta? <span @click="authMode = 'register'">Cadastre-se</span>
        </template>
        <template v-else>
          Já possui conta? <span @click="authMode = 'login'">Faça Login</span>
        </template>
      </p>
    </div>
  </main>
</template>