<template>
  <aside class="sidebar">
    <section class="sidebar-section">
      <h2 class="section-title">
        <IconHome />
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

    <section class="sidebar-section controls-section">
      <h2 class="section-title">
        <IconControl />
        Controles
      </h2>
      <ul class="controls-list">
        <li><kbd>Drag</kbd> Añadir mueble al canvas</li>
        <li><kbd>Click + Drag</kbd> Mover muebles</li>
        <li><kbd>Click der.</kbd> Rotar 90° (sobre mueble)</li>
        <li><kbd>Doble click</kbd> Eliminar mueble</li>
        <li><kbd>Scroll</kbd> Zoom</li>
      </ul>
    </section>
  </aside>
</template>

<script setup>
import IconControl from '@/icons/IconControl.vue';
import IconHome from '@/icons/IconHome.vue';

const props = defineProps({
  furnitureList: { type: Array, required: true }
})

const emit = defineEmits(['wall-color-change', 'floor-change'])

function onDragStart(event, item) {
  event.dataTransfer.setData('furniture', JSON.stringify(item))
  event.dataTransfer.effectAllowed = 'copy'

  const emptyImg = new Image()
  emptyImg.src = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciLz4="

  event.dataTransfer.setDragImage(emptyImg, 0, 0)
}
</script>

<style scoped>
.sidebar {
  width: 280px;
  min-width: 280px;
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
  padding: 14px 14px 20px 14px;
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

.furniture-info strong { 
  display: block; 
  font-size: 0.82rem; 
  color: #1e293b; 
}

.furniture-info small { 
  font-size: 0.68rem; 
  color: #94a3b8; 
}

.drag-hint {
  margin-left: auto;
  color: #cbd5e1;
  font-size: 1rem;
  letter-spacing: -1px;
}

.controls-section { 
  margin-top: 10px;
  border-bottom: none;
}

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
