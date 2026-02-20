import * as THREE from 'three'

export function useRoom() {
  let scene, camera, renderer, animationId
  let isDragging = false
  let isOrbiting = false
  let selectedObject = null
  let mouse = new THREE.Vector2()
  let raycaster = new THREE.Raycaster()
  let placedFurniture = []
  let wallMeshes = []
  let floorMesh = null
  let canvasEl = null

  let lastMouseX = 0, lastMouseY = 0
  let cameraAngleX = 0.55
  let cameraAngleY = 0.8
  let cameraRadius = 14

  let cameraMode = 'fixed'

  function init(canvas) {
    canvasEl = canvas

    scene = new THREE.Scene()
    scene.background = new THREE.Color(0xe8edf2)
    scene.fog = new THREE.Fog(0xe8edf2, 20, 40)

    camera = new THREE.PerspectiveCamera(55, canvas.clientWidth / canvas.clientHeight, 0.1, 100)
    updateCameraPosition()

    renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
    renderer.setSize(canvas.clientWidth, canvas.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.1

    const ambient = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambient)

    const sun = new THREE.DirectionalLight(0xfff5e0, 1.2)
    sun.position.set(6, 12, 6)
    sun.castShadow = true
    sun.shadow.mapSize.width = 2048
    sun.shadow.mapSize.height = 2048
    sun.shadow.camera.near = 0.5
    sun.shadow.camera.far = 30
    sun.shadow.camera.left = -8
    sun.shadow.camera.right = 8
    sun.shadow.camera.top = 8
    sun.shadow.camera.bottom = -8
    sun.shadow.bias = -0.001
    scene.add(sun)

    const fill = new THREE.DirectionalLight(0xadd8f7, 0.4)
    fill.position.set(-5, 5, -5)
    scene.add(fill)

    buildRoom()
    setupEvents()
    animate()
  }

  function buildRoom() {
    const size = 10
    const h = 4

    const floorGeo = new THREE.PlaneGeometry(size, size, 10, 10)
    const floorMat = new THREE.MeshLambertMaterial({ color: 0xc8a46e })
    floorMesh = new THREE.Mesh(floorGeo, floorMat)
    floorMesh.rotation.x = -Math.PI / 2
    floorMesh.receiveShadow = true
    floorMesh.name = 'floor'
    scene.add(floorMesh)

    const grid = new THREE.GridHelper(size, 10, 0x00000022, 0x00000015)
    grid.position.y = 0.01
    scene.add(grid)

    const wallMat = new THREE.MeshLambertMaterial({ color: 0xcccccc, side: THREE.BackSide })
    const box = new THREE.Mesh(new THREE.BoxGeometry(size, h, size), wallMat)
    box.position.y = h / 2
    box.name = 'walls'
    wallMeshes = [box]
    scene.add(box)

    const skirtingMat = new THREE.MeshLambertMaterial({ color: 0xaaaaaa })
    const skirtingGeo = new THREE.BoxGeometry(size - 0.1, 0.1, 0.05)
    const positions = [
      { x: 0, z: -size / 2 + 0.025, ry: 0 },
      { x: 0, z: size / 2 - 0.025, ry: Math.PI },
      { x: -size / 2 + 0.025, z: 0, ry: Math.PI / 2 },
      { x: size / 2 - 0.025, z: 0, ry: -Math.PI / 2 },
    ]
    positions.forEach(p => {
      const s = new THREE.Mesh(skirtingGeo, skirtingMat)
      s.position.set(p.x, 0.05, p.z)
      s.rotation.y = p.ry
      scene.add(s)
    })
  }

  function createFurnitureMesh(type, color) {
    const group = new THREE.Group()
    const mat = (c) => new THREE.MeshLambertMaterial({ color: c || color })

    switch (type) {
      case 'sofa': {
        const base = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.35, 0.9), mat())
        base.position.y = 0.175
        group.add(base)

        const back = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.55, 0.15), mat())
        back.position.set(0, 0.55, -0.37)
        group.add(back)

        const cushMat = new THREE.MeshLambertMaterial({ color: lightenColor(color, 0.3) })
        for (let i = -1; i <= 1; i++) {
          const cush = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.18, 0.7), cushMat)
          cush.position.set(i * 0.63, 0.44, 0.05)
          group.add(cush)
        }

        const legGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.18)
        const legMat = mat(0x4a3728)
        const legPositions = [[-0.88, -0.37], [0.88, -0.37], [-0.88, 0.37], [0.88, 0.37]]
        legPositions.forEach(([lx, lz]) => {
          const leg = new THREE.Mesh(legGeo, legMat)
          leg.position.set(lx, 0.09, lz)
          group.add(leg)
        })
        break
      }

      case 'mesa': {
        const top = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.07, 0.8), mat())
        top.position.y = 0.7
        group.add(top)

        const legGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.66, 8)
        const legMat = mat(darkenColor(color, 0.2))
        const corners = [[-0.52, -0.32], [0.52, -0.32], [-0.52, 0.32], [0.52, 0.32]]
        corners.forEach(([lx, lz]) => {
          const leg = new THREE.Mesh(legGeo, legMat)
          leg.position.set(lx, 0.33, lz)
          group.add(leg)
        })
        break
      }

      case 'silla': {
        const seat = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.06, 0.55), mat())
        seat.position.y = 0.45
        group.add(seat)

        const back = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.5, 0.05), mat())
        back.position.set(0, 0.73, -0.25)
        group.add(back)

        const legGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.45)
        const legMat = mat(darkenColor(color, 0.2))
        const corners = [[-0.22, -0.22], [0.22, -0.22], [-0.22, 0.22], [0.22, 0.22]]
        corners.forEach(([lx, lz]) => {
          const leg = new THREE.Mesh(legGeo, legMat)
          leg.position.set(lx, 0.225, lz)
          group.add(leg)
        })
        break
      }

      case 'cama': {
        const base = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.25, 2.0), mat(0x8b7355))
        base.position.y = 0.15
        group.add(base)

        const mattress = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.2, 1.85), mat(lightenColor(color, 0.5)))
        mattress.position.y = 0.37
        group.add(mattress)

        const pillowMat = new THREE.MeshLambertMaterial({ color: 0xffffff })
        for (let i of [-0.34, 0.34]) {
          const pillow = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.12, 0.35), pillowMat)
          pillow.position.set(i, 0.54, -0.72)
          group.add(pillow)
        }

        const head = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.6, 0.1), mat(0x5c4033))
        head.position.set(0, 0.55, -0.98)
        group.add(head)

        const foot = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.3, 0.1), mat(0x5c4033))
        foot.position.set(0, 0.35, 0.98)
        group.add(foot)
        break
      }

      case 'lampara': {
        const base = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.18, 0.06), mat(0x888888))
        base.position.y = 0.03
        group.add(base)

        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.5), mat(0x888888))
        pole.position.y = 0.78
        group.add(pole)

        const shade = new THREE.Mesh(
          new THREE.CylinderGeometry(0.28, 0.12, 0.32, 12, 1, true),
          new THREE.MeshLambertMaterial({ color, side: THREE.DoubleSide })
        )
        shade.position.y = 1.58
        group.add(shade)

        const shadeCap = new THREE.Mesh(new THREE.CircleGeometry(0.28, 12), new THREE.MeshLambertMaterial({ color }))
        shadeCap.rotation.x = -Math.PI / 2
        shadeCap.position.y = 1.74
        group.add(shadeCap)
        // Luz puntual
        const bulbLight = new THREE.PointLight(0xffe4a0, 0.8, 5)
        bulbLight.position.y = 1.55
        group.add(bulbLight)
        break
      }

      case 'estanteria': {
        const sideMat = mat()
        const sideGeo = new THREE.BoxGeometry(0.04, 1.8, 0.4)
        for (let x of [-0.68, 0.68]) {
          const side = new THREE.Mesh(sideGeo, sideMat)
          side.position.set(x, 0.9, 0)
          group.add(side)
        }

        const shelfGeo = new THREE.BoxGeometry(1.36, 0.04, 0.4)
        for (let y of [0.02, 0.5, 1.0, 1.5, 1.78]) {
          const shelf = new THREE.Mesh(shelfGeo, sideMat)
          shelf.position.y = y
          group.add(shelf)
        }

        const bookColors = [0xe74c3c, 0x3498db, 0x2ecc71, 0xf39c12, 0x9b59b6]
        let bx = -0.55
        for (let y of [0.28, 0.78, 1.28]) {
          bx = -0.55
          bookColors.forEach(bc => {
            if (bx > 0.55) return
            const book = new THREE.Mesh(
              new THREE.BoxGeometry(0.07 + Math.random() * 0.04, 0.28 + Math.random() * 0.1, 0.3),
              new THREE.MeshLambertMaterial({ color: bc })
            )
            book.position.set(bx, y, 0.02)
            group.add(book)
            bx += 0.1 + Math.random() * 0.03
          })
        }
        break
      }

      default: {
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), mat())
        mesh.position.y = 0.5
        group.add(mesh)
      }
    }

    group.traverse(child => {
      if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })

    return group
  }

  function lightenColor(hex, amount) {
    const r = Math.min(255, ((hex >> 16) & 0xff) + Math.round(255 * amount))
    const g = Math.min(255, ((hex >> 8) & 0xff) + Math.round(255 * amount))
    const b = Math.min(255, (hex & 0xff) + Math.round(255 * amount))
    return (r << 16) | (g << 8) | b
  }

  function darkenColor(hex, amount) {
    const r = Math.max(0, ((hex >> 16) & 0xff) - Math.round(255 * amount))
    const g = Math.max(0, ((hex >> 8) & 0xff) - Math.round(255 * amount))
    const b = Math.max(0, (hex & 0xff) - Math.round(255 * amount))
    return (r << 16) | (g << 8) | b
  }

  function addFurniture(item, dropX, dropY) {
    const rect = canvasEl.getBoundingClientRect()
    mouse.x = ((dropX - rect.left) / rect.width) * 2 - 1
    mouse.y = -((dropY - rect.top) / rect.height) * 2 + 1

    raycaster.setFromCamera(mouse, camera)
    const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
    const target = new THREE.Vector3()
    raycaster.ray.intersectPlane(floorPlane, target)

    const group = createFurnitureMesh(item.id, item.color)
    group.position.set(
      Math.max(-4.2, Math.min(4.2, target.x)),
      0,
      Math.max(-4.2, Math.min(4.2, target.z))
    )
    group.userData = { type: item.id, label: item.label, rotY: 0 }

    scene.add(group)
    placedFurniture.push(group)
    return placedFurniture.length
  }

  let highlightedObject = null
  function highlightObject(obj) {
    if (highlightedObject === obj) return

    if (highlightedObject) {
      highlightedObject.traverse(child => {
        if (child.isMesh && child.userData._origEmissive !== undefined) {
          child.material.emissive.setHex(child.userData._origEmissive)
        }
      })
    }
    highlightedObject = obj
    if (obj) {
      obj.traverse(child => {
        if (child.isMesh) {
          child.userData._origEmissive = child.material.emissive.getHex()
          child.material.emissive.setHex(0x2244aa)
          child.material.emissiveIntensity = 0.25
        }
      })
    }
  }

  function setupEvents() {
    canvasEl.addEventListener('wheel', onScroll, { passive: true })
    canvasEl.addEventListener('mousedown', onMouseDown)
    canvasEl.addEventListener('mousemove', onMouseMove)
    canvasEl.addEventListener('mouseup', onMouseUp)
    canvasEl.addEventListener('dblclick', onDoubleClick)
    canvasEl.addEventListener('contextmenu', e => e.preventDefault())
    canvasEl.addEventListener('dragover', e => e.preventDefault())
    canvasEl.addEventListener('drop', onDrop)
  }

  function getHitFurniture(event) {
    const rect = canvasEl.getBoundingClientRect()
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
    raycaster.setFromCamera(mouse, camera)

    const allMeshes = []
    placedFurniture.forEach(group => {
      group.traverse(child => {
        if (child.isMesh) allMeshes.push(child)
      })
    })

    const hits = raycaster.intersectObjects(allMeshes)
    if (hits.length === 0) return null

    let obj = hits[0].object
    while (obj.parent && !placedFurniture.includes(obj)) {
      obj = obj.parent
    }
    return placedFurniture.includes(obj) ? obj : null
  }

  function onMouseDown(event) {
    if (event.button === 2) {
      const hit = getHitFurniture(event)
      if (hit) {
        hit.userData.rotY = (hit.userData.rotY || 0) + Math.PI / 2
        hit.rotation.y = hit.userData.rotY
      } else if (cameraMode === 'explore') {
        isOrbiting = true
        lastMouseX = event.clientX
        lastMouseY = event.clientY
      }
      return
    }

    if (event.button === 0) {
      const hit = getHitFurniture(event)
      if (hit) {
        selectedObject = hit
        isDragging = true
        highlightObject(hit)
        canvasEl.style.cursor = 'grabbing'
      } else {
        highlightObject(null)
        if (cameraMode === 'explore') {
          isOrbiting = true
          lastMouseX = event.clientX
          lastMouseY = event.clientY
        }
      }
    }
  }

  function onMouseMove(event) {
    if (isOrbiting) {
      const dx = event.clientX - lastMouseX
      const dy = event.clientY - lastMouseY
      cameraAngleY -= dx * 0.008
      cameraAngleX = Math.max(0.15, Math.min(1.3, cameraAngleX + dy * 0.008))
      lastMouseX = event.clientX
      lastMouseY = event.clientY
      updateCameraPosition()
      return
    }

    if (isDragging && selectedObject) {
      const rect = canvasEl.getBoundingClientRect()
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

      raycaster.setFromCamera(mouse, camera)
      const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
      const target = new THREE.Vector3()
      raycaster.ray.intersectPlane(floorPlane, target)

      selectedObject.position.x = Math.max(-4.2, Math.min(4.2, target.x))
      selectedObject.position.z = Math.max(-4.2, Math.min(4.2, target.z))
    }
  }

  function onMouseUp(event) {
    if (event.button === 2) { isOrbiting = false; canvasEl.style.cursor = 'default'; return }
    if (event.button === 0) {
      isDragging = false
      selectedObject = null
      canvasEl.style.cursor = 'default'
    }
  }

  function onDoubleClick(event) {
    const hit = getHitFurniture(event)
    if (hit) {
      highlightObject(null)
      scene.remove(hit)
      placedFurniture = placedFurniture.filter(f => f !== hit)

      canvasEl.dispatchEvent(new CustomEvent('furniture-removed', {
        detail: { count: placedFurniture.length }
      }))
    }
  }

  function onScroll(event) {
    cameraRadius = Math.max(5, Math.min(22, cameraRadius + event.deltaY * 0.02))
    updateCameraPosition()
  }

  function onDrop(event) {
    event.preventDefault()
    const data = event.dataTransfer.getData('furniture')
    if (!data) return
    const item = JSON.parse(data)
    return addFurniture(item, event.clientX, event.clientY)
  }

  function updateCameraPosition() {
    camera.position.x = cameraRadius * Math.sin(cameraAngleY) * Math.cos(cameraAngleX)
    camera.position.y = cameraRadius * Math.sin(cameraAngleX)
    camera.position.z = cameraRadius * Math.cos(cameraAngleY) * Math.cos(cameraAngleX)
    camera.lookAt(0, 1, 0)
  }

  function clearAll() {
    placedFurniture.forEach(f => scene.remove(f))
    placedFurniture = []
    highlightedObject = null
    return 0
  }

  function restart() {
    clearAll()
    cameraAngleX = 0.55
    cameraAngleY = 0.8
    cameraRadius = 14
    updateCameraPosition()
    return 0
  }

  function animate() {
    animationId = requestAnimationFrame(animate)
    renderer.render(scene, camera)
  }

  function onResize() {
    if (!canvasEl) return
    const w = canvasEl.clientWidth
    const h = canvasEl.clientHeight
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer.setSize(w, h)
  }

  function destroy() {
    cancelAnimationFrame(animationId)
    renderer.dispose()
  }

  function setCameraMode(mode) {
    cameraMode = mode
    isOrbiting = false
  }

  return {
    init,
    clearAll,
    restart,
    onResize,
    destroy,
    setCameraMode,
  }
}
