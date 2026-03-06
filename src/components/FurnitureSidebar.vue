<template>
  <aside class="sidebar">
    <!-- MUEBLES -->
    <section class="sidebar-section">
      <h2 class="section-title">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
        Muebles
      </h2>
      <p class="sidebar-hint">Arrastra a la habitación</p>

      <div class="furniture-list">
        <div
          v-for="item in furnitureList"
          :key="item.id"
          class="furniture-item"
          draggable="true"
          @dragstart="onDragStart($event, item)"
        >
          <div class="furniture-icon" :style="{ background: item.iconBg }">
            <span v-html="item.icon"></span>
          </div>
          <div class="furniture-info">
            <strong>{{ item.label }}</strong>
            <small>Arrastra para añadir</small>
          </div>
          <div class="drag-hint">⠿</div>
        </div>
      </div>
    </section>

    <!-- PAREDES -->
    <section class="sidebar-section">
      <h2 class="section-title">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/></svg>
        Color de Paredes
      </h2>
      <div class="color-grid">
        <button
          v-for="c in wallColors"
          :key="c.value"
          class="color-btn"
          :class="{ active: selectedWallColor === c.value }"
          :style="{ background: c.hex }"
          :title="c.label"
          @click="selectWallColor(c)"
        ></button>
      </div>
    </section>

    <!-- SUELO -->
    <section class="sidebar-section">
      <h2 class="section-title">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M2 20h20M2 14h20M2 8h20M2 2h20"/></svg>
        Diseño del Suelo
      </h2>
      <div class="floor-options">
        <button
          v-for="f in floorStyles"
          :key="f.id"
          class="floor-btn"
          :class="{ active: selectedFloor === f.id }"
          @click="selectFloor(f)"
        >
          <div class="floor-preview" :style="{ background: f.preview }"></div>
          <span>{{ f.label }}</span>
        </button>
      </div>
    </section>

    <!-- CONTROLES -->
    <section class="sidebar-section controls-section">
      <h2 class="section-title">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>
        Controles
      </h2>
      <ul class="controls-list">
        <li><kbd>Drag</kbd> Añadir mueble al canvas</li>
        <li><kbd>Click + Drag</kbd> Mover muebles</li>
        <li><kbd>Click der.</kbd> Rotar 90° (sobre mueble)</li>
        <li><kbd>Doble click</kbd> Eliminar mueble</li>
        <li><kbd>Scroll</kbd> Zoom</li>
        <li><kbd>Explorar</kbd> Orbitar vista libremente</li>
      </ul>
    </section>
  </aside>
</template>

<script setup>
const props = defineProps({
  furnitureList: { type: Array, required: true }
})

const emit = defineEmits(['wall-color-change', 'floor-change'])

import { ref } from 'vue'

const selectedWallColor = ref('#cccccc')
const selectedFloor = ref('wood')

const wallColors = [
  { value: '#cccccc', hex: '#cccccc', label: 'Gris clásico', threeHex: 0xcccccc },
  { value: '#f5e6c8', hex: '#f5e6c8', label: 'Crema cálido', threeHex: 0xf5e6c8 },
  { value: '#c8dff5', hex: '#c8dff5', label: 'Azul cielo', threeHex: 0xc8dff5 },
  { value: '#d4f5c8', hex: '#d4f5c8', label: 'Verde menta', threeHex: 0xd4f5c8 },
  { value: '#f5c8c8', hex: '#f5c8c8', label: 'Rosa suave', threeHex: 0xf5c8c8 },
  { value: '#e8c8f5', hex: '#e8c8f5', label: 'Lavanda', threeHex: 0xe8c8f5 },
  { value: '#ffffff', hex: '#ffffff', label: 'Blanco puro', threeHex: 0xffffff },
  { value: '#2c3e50', hex: '#2c3e50', label: 'Antracita', threeHex: 0x2c3e50 },
]

const floorStyles = [
  { id: 'wood',    label: 'Madera',  preview: 'linear-gradient(45deg, #c8a46e 25%, #d4b07a 50%, #c8a46e 75%)', color: 0xc8a46e },
  { id: 'marble',  label: 'Mármol',  preview: 'linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 50%, #f5f5f5 100%)', color: 0xf0f0f0 },
  { id: 'cement',  label: 'Cemento', preview: '#9e9e9e', color: 0x9e9e9e },
  { id: 'dark',    label: 'Ébano',   preview: '#3d2b1f', color: 0x3d2b1f },
  { id: 'tile',    label: 'Azulejo', preview: 'repeating-linear-gradient(0deg, #b0c4de 0px, #b0c4de 1px, #d0e4f0 1px, #d0e4f0 20px), repeating-linear-gradient(90deg, #b0c4de 0px, #b0c4de 1px, #d0e4f0 1px, #d0e4f0 20px)', color: 0xd0e4f0 },
]

function onDragStart(event, item) {
  event.dataTransfer.setData('furniture', JSON.stringify(item))
  event.dataTransfer.effectAllowed = 'copy'
}

function selectWallColor(c) {
  selectedWallColor.value = c.value
  emit('wall-color-change', c.threeHex)
}

function selectFloor(f) {
  selectedFloor.value = f.id
  emit('floor-change', f.color)
}
</script>

<style scoped>
.sidebar {
  width: 230px;
  min-width: 230px;
  background: #f8fafc;
  border-right: 1px solid #e2e8f0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0;
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 transparent;
}

.sidebar-section {
  padding: 14px 14px 10px;
  border-bottom: 1px solid #e2e8f0;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  font-weight: 700;
  color: #1e40af;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 8px;
}

.sidebar-hint {
  font-size: 0.72rem;
  color: #94a3b8;
  margin-bottom: 10px;
}

/* ── Muebles ── */
.furniture-list { display: flex; flex-direction: column; gap: 6px; }

.furniture-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  background: white;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  cursor: grab;
  transition: all 0.18s ease;
  position: relative;
}
.furniture-item:hover {
  border-color: #93c5fd;
  box-shadow: 0 2px 10px rgba(59, 130, 246, 0.12);
  transform: translateX(2px);
}
.furniture-item:active { cursor: grabbing; transform: scale(0.97); }

.furniture-icon {
  width: 38px;
  height: 38px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 20px;
}

.furniture-info strong { display: block; font-size: 0.82rem; color: #1e293b; }
.furniture-info small { font-size: 0.68rem; color: #94a3b8; }

.drag-hint {
  margin-left: auto;
  color: #cbd5e1;
  font-size: 1rem;
  letter-spacing: -1px;
}

/* ── Colores paredes ── */
.color-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
}

.color-btn {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 8px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.15s;
  box-shadow: inset 0 0 0 1px rgba(0,0,0,0.1);
}
.color-btn:hover { transform: scale(1.1); }
.color-btn.active {
  border-color: #1d4ed8;
  box-shadow: 0 0 0 2px white, 0 0 0 4px #1d4ed8;
}

/* ── Suelo ── */
.floor-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}

.floor-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: 8px 6px;
  background: white;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s;
  font-size: 0.7rem;
  color: #475569;
  font-weight: 500;
}
.floor-btn:hover { border-color: #93c5fd; }
.floor-btn.active { border-color: #1d4ed8; background: #eff6ff; color: #1d4ed8; }

.floor-preview {
  width: 100%;
  height: 28px;
  border-radius: 5px;
  border: 1px solid rgba(0,0,0,0.08);
}

/* ── Controles ── */
.controls-section { margin-top: auto; }

.controls-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.controls-list li {
  font-size: 0.72rem;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

kbd {
  background: #e2e8f0;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  padding: 1px 5px;
  font-size: 0.65rem;
  font-family: monospace;
  color: #334155;
  white-space: nowrap;
}
</style>
