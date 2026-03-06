<template>
  <div class="canvas-wrapper">
    <canvas ref="canvasEl" class="room-canvas" @contextmenu.prevent></canvas>

    <!-- Toggle modo cámara -->
    <div class="camera-toggle">
      <button class="cam-btn" :class="{ active: camMode === 'fixed' }" @click="setCamMode('fixed')"
        title="Modo fijo: solo zoom">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M2 12h3M19 12h3M12 2v3M12 19v3" />
          <path d="M5.64 5.64l2.12 2.12M16.24 16.24l2.12 2.12M5.64 18.36l2.12-2.12M16.24 7.76l2.12-2.12" />
        </svg>
        Vista Fija
      </button>
      <button class="cam-btn" :class="{ active: camMode === 'explore' }" @click="setCamMode('explore')"
        title="Modo explorar: orbitar con el ratón">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10z" />
          <path
            d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
        Explorar
      </button>
    </div>

    <!-- Hint modo explorar -->
    <div class="explore-hint" v-if="camMode === 'explore'">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4M12 16h.01" />
      </svg>
      Arrastra para orbitar · Scroll para zoom · Click derecho en mueble para rotar
    </div>

    <!-- HUD inferior -->
    <div class="hud-bar">
      <div class="furniture-count">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        </svg>
        {{ furnitureCount }} mueble{{ furnitureCount !== 1 ? 's' : '' }} en la habitación
      </div>
      <div class="hud-hint" v-if="furnitureCount === 0">
        ← Arrastra un mueble desde el panel lateral para empezar
      </div>
    </div>

    <!-- Toast -->
    <div class="toast" v-if="showToast">
      <span>{{ toastMsg }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoom } from '../composables/useRoom'

const canvasEl = ref(null)
const furnitureCount = ref(0)
const showToast = ref(false)
const toastMsg = ref('')
const camMode = ref('fixed')

const { init, clearAll, restart, onResize, destroy, changeWallColor, changeFloorColor, setCameraMode } = useRoom()

function showMessage(msg) {
  toastMsg.value = msg
  showToast.value = true
  setTimeout(() => { showToast.value = false }, 2000)
}

function setCamMode(mode) {
  camMode.value = mode
  setCameraMode(mode)
  showMessage(mode === 'explore' ? 'Modo Explorar activado' : 'Modo Vista Fija activado')
}

defineExpose({
  clearAll: () => {
    furnitureCount.value = clearAll()
    showMessage('Habitación vaciada')
  },
  restart: () => {
    furnitureCount.value = restart()
    camMode.value = 'fixed'
    setCameraMode('fixed')
    showMessage('Vista y configuración reiniciadas')
  },
  changeWallColor,
  changeFloorColor,
})

onMounted(() => {
  init(canvasEl.value)
  setCameraMode('fixed')

  // Drop → subir contador
  canvasEl.value.addEventListener('drop', () => {
    setTimeout(() => { furnitureCount.value++ }, 50)
  })

  // Doble click eliminó un mueble → actualizar contador con el valor real
  canvasEl.value.addEventListener('furniture-removed', (e) => {
    furnitureCount.value = e.detail.count
  })

  const resizeObs = new ResizeObserver(() => onResize())
  resizeObs.observe(canvasEl.value.parentElement)

  onUnmounted(() => {
    resizeObs.disconnect()
    destroy()
  })
})
</script>

<style scoped>
.canvas-wrapper {
  flex: 1;
  position: relative;
  overflow: hidden;
  background: #e8edf2;
}

.room-canvas {
  width: 100%;
  height: 100%;
  display: block;
  outline: none;
}

/* ── Toggle modo cámara ── */
.camera-toggle {
  position: absolute;
  top: 14px;
  right: 14px;
  display: flex;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(10px);
  border-radius: 10px;
  padding: 4px;
  gap: 4px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.cam-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 13px;
  border: none;
  border-radius: 7px;
  cursor: pointer;
  font-size: 0.78rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.55);
  background: transparent;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.cam-btn:hover {
  color: rgba(255, 255, 255, 0.85);
  background: rgba(255, 255, 255, 0.08);
}

.cam-btn.active {
  background: #1d4ed8;
  color: white;
  box-shadow: 0 2px 8px rgba(29, 78, 216, 0.5);
}

/* ── Hint modo explorar ── */
.explore-hint {
  position: absolute;
  top: 62px;
  right: 14px;
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(8px);
  color: #93c5fd;
  font-size: 0.72rem;
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid rgba(147, 197, 253, 0.2);
  display: flex;
  align-items: center;
  gap: 6px;
  animation: slideDown 0.2s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-6px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ── HUD inferior ── */
.hud-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 36px;
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.78rem;
}

.furniture-count {
  display: flex;
  align-items: center;
  gap: 7px;
  font-weight: 600;
}

.hud-hint {
  color: rgba(147, 197, 253, 0.8);
  font-size: 0.72rem;
  animation: pulse 2s infinite;
}

@keyframes pulse {

  0%,
  100% {
    opacity: 0.8;
  }

  50% {
    opacity: 0.4;
  }
}

/* ── Toast ── */
.toast {
  position: absolute;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(30, 64, 175, 0.9);
  color: white;
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 0.82rem;
  font-weight: 500;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(147, 197, 253, 0.3);
  animation: fadeInOut 2s ease forwards;
  pointer-events: none;
  white-space: nowrap;
}

@keyframes fadeInOut {
  0% {
    opacity: 0;
    transform: translateX(-50%) translateY(-8px);
  }

  15% {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }

  75% {
    opacity: 1;
  }

  100% {
    opacity: 0;
  }
}
</style>
