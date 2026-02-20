<template>
  <header class="app-header">
    <div class="header-left">
      <div class="logo-icon">
        <IconLogo />
      </div>
      <div class="header-title">
        <h1>Diseñador de Habitaciones 3D</h1>
        <span>Crea y personaliza tu espacio ideal</span>
      </div>
    </div>

    <div class="header-actions">
      <button class="btn-action btn-restart" @click="$emit('restart')">
        <IconRefresh />
        Reiniciar
      </button>
      <button class="btn-action btn-clear" @click="$emit('clear-all')">
        <IconTrash />
        Limpiar Todo
      </button>
    </div>
  </header>
</template>

<script setup>
import IconLogo from '@/icons/IconLogo.vue';
import IconRefresh from '@/icons/IconRefresh.vue';
import IconTrash from '@/icons/IconTrash.vue';

defineEmits(['clear-all', 'restart'])
</script>

<style scoped>
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  height: 60px;
  background: #2c3e50;
  border-bottom: 1px solid rgba(147, 197, 253, 0.2);
  box-shadow: 0 2px 12px rgba(0,0,0,0.3);
  flex-shrink: 0;
  z-index: 10;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  background: rgba(255,255,255,0.08);
  border-radius: 10px;
  border: 1px solid rgba(147, 197, 253, 0.2);
}

.header-title h1 {
  font-size: 1.05rem;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 0.01em;
}

.header-title span {
  font-size: 0.72rem;
  color: #93c5fd;
  opacity: 0.85;
}

.header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.btn-action {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
  transition: all 0.2s ease;
  letter-spacing: 0.01em;
}

.btn-restart {
  background: rgba(255,255,255,0.1);
  color: #e0f2fe;
  border: 1px solid rgba(147, 197, 253, 0.3);
}
.btn-restart:hover {
  background: rgba(255,255,255,0.18);
  border-color: rgba(147, 197, 253, 0.6);
  transform: translateY(-1px);
}

.btn-clear {
  background: rgba(239, 68, 68, 0.15);
  color: #fca5a5;
  border: 1px solid rgba(239, 68, 68, 0.35);
}
.btn-clear:hover {
  background: rgba(239, 68, 68, 0.28);
  border-color: rgba(239, 68, 68, 0.6);
  color: #fecaca;
  transform: translateY(-1px);
}

.btn-action:active { transform: translateY(0); }
</style>
