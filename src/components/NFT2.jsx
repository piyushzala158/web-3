import React, { useEffect, useRef } from 'react'
import { useFrame, useGraph } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { SkeletonUtils } from 'three-stdlib'

export default function Model(props) {
  const { scene } = useGLTF('/NFT2.glb')
  const clone = React.useMemo(() => SkeletonUtils.clone(scene), [scene])
  const { nodes, materials } = useGraph(clone)
  const characterRef = useRef()
  const speed = 0.05 // Adjust the speed of the character

  const keys = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false
  })

  useEffect(() => {
    const handleKeyDown = (event) => {
      switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
          keys.current.forward = true
          break
        case 'ArrowDown':
        case 'KeyS':
          keys.current.backward = true
          break
        case 'ArrowLeft':
        case 'KeyA':
          keys.current.left = true
          break
        case 'ArrowRight':
        case 'KeyD':
          keys.current.right = true
          break
        default:
          break
      }
    }

    const handleKeyUp = (event) => {
      switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
          keys.current.forward = false
          break
        case 'ArrowDown':
        case 'KeyS':
          keys.current.backward = false
          break
        case 'ArrowLeft':
        case 'KeyA':
          keys.current.left = false
          break
        case 'ArrowRight':
        case 'KeyD':
          keys.current.right = false
          break
        default:
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  useFrame((state) => {
    if (characterRef.current) {
      const { forward, backward, left, right } = keys.current

      if (forward) characterRef.current.position.z -= speed
      if (backward) characterRef.current.position.z += speed
      if (left) characterRef.current.position.x -= speed
      if (right) characterRef.current.position.x += speed

      // Rotate the character to face the direction of movement
      if (forward || backward || left || right) {
        const angle = Math.atan2(characterRef.current.position.x - state.camera.position.x, characterRef.current.position.z - state.camera.position.z)
        characterRef.current.rotation.y = angle
      }
    }
  })

  return (
    <group ref={characterRef} {...props} dispose={null}>
      <primitive object={clone} />
      {/* The rest of the scene elements... */}
    </group>
  )
}

useGLTF.preload('/NFT2.glb')