<template>
  <div class="app-layout">
    <AppHeader
      @clear-all="roomCanvas?.clearAll()"
      @restart="roomCanvas?.restart()"
    />

    <div class="main-content">
      <FurnitureSidebar
        :furniture-list="furnitureList"
        @wall-color-change="roomCanvas?.changeWallColor($event)"
        @floor-change="roomCanvas?.changeFloorColor($event)"
      />
      <RoomCanvas ref="roomCanvas" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import AppHeader from './components/AppHeader.vue'
import FurnitureSidebar from './components/FurnitureSidebar.vue'
import RoomCanvas from './components/RoomCanvas.vue'

const roomCanvas = ref(null)

const ICONS = {
  sofa: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
    <path d="M3 14V9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5"/>
    <rect x="1" y="14" width="4" height="5" rx="1"/>
    <rect x="19" y="14" width="4" height="5" rx="1"/>
    <rect x="5" y="14" width="14" height="5" rx="1"/>
    <path d="M5 19v1M19 19v1"/>
  </svg>`,

  mesa: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
    <rect x="2" y="9" width="20" height="3" rx="1"/>
    <path d="M5 12v7M19 12v7M7 19h2M15 19h2"/>
  </svg>`,

  silla: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
    <path d="M6 3v11M18 3v11"/>
    <path d="M6 14h12"/>
    <path d="M6 9h12"/>
    <path d="M8 14v7M16 14v7"/>
  </svg>`,

  cama: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
    <path d="M2 4v16M22 4v16"/>
    <path d="M2 16h20"/>
    <path d="M2 11h20"/>
    <path d="M6 11V7a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4"/>
  </svg>`,

  lampara: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
    <path d="M12 2L8 10h8L12 2z"/>
    <path d="M9 10h6v2H9z"/>
    <path d="M12 12v10"/>
    <path d="M9 22h6"/>
  </svg>`,

  estanteria: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
    <rect x="2" y="2" width="20" height="20" rx="1"/>
    <path d="M2 8h20M2 14h20"/>
    <path d="M6 8v6M10 8v6M16 14v6"/>
  </svg>`,
}

const furnitureList = [
  { id: 'sofa',       label: 'Sofá',       color: 0x9b59b6, iconBg: '#f3e8ff', icon: ICONS.sofa },
  { id: 'mesa',       label: 'Mesa',       color: 0x8B4513, iconBg: '#fef3c7', icon: ICONS.mesa },
  { id: 'silla',      label: 'Silla',      color: 0x2c3e50, iconBg: '#e0f2fe', icon: ICONS.silla },
  { id: 'cama',       label: 'Cama',       color: 0x3498db, iconBg: '#dbeafe', icon: ICONS.cama },
  { id: 'lampara',    label: 'Lámpara',    color: 0xf1c40f, iconBg: '#fef9c3', icon: ICONS.lampara },
  { id: 'estanteria', label: 'Estantería', color: 0x27ae60, iconBg: '#dcfce7', icon: ICONS.estanteria },
]
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body, #app { height: 100%; overflow: hidden; }
body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; }

.app-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.main-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}
</style>