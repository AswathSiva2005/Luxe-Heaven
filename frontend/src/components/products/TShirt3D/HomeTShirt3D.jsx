import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Center, AccumulativeShadows, RandomizedLight } from '@react-three/drei';
import { easing } from 'maath';
import * as THREE from 'three';

// 5 colors for the T-shirt (matching screenshot style)
const colors = ['#FF6B35', '#F7931E', '#FFD93D', '#6BCB77', '#4D96FF'];

export default function HomeTShirt3D() {
  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const [backgroundColor, setBackgroundColor] = useState(colors[0]);

  const handleColorChange = (color) => {
    setSelectedColor(color);
    setBackgroundColor(color);
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '500px',
        borderRadius: '12px',
        overflow: 'hidden',
        transition: 'background-color 0.5s ease',
        backgroundColor: backgroundColor,
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
      }}
    >
      {/* 3D T-shirt Canvas */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
        <Canvas
          shadows
          camera={{ position: [0, 0, 2.5], fov: 25 }}
          gl={{ preserveDrawingBuffer: true }}
          style={{ background: 'transparent' }}
        >
          <ambientLight intensity={0.5 * Math.PI} />
          <Environment files="https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/potsdamer_platz_1k.hdr" />
          <CameraRig>
            <Backdrop />
            <Center>
              <Shirt color={selectedColor} />
            </Center>
          </CameraRig>
        </Canvas>
      </div>

      {/* Color Swatches at Bottom */}
      <div
        style={{
          position: 'absolute',
          bottom: '30px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '15px',
          zIndex: 10,
        }}
      >
        {colors.map((color, index) => (
          <button
            key={index}
            onClick={() => handleColorChange(color)}
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              border: selectedColor === color ? '4px solid white' : '2px solid rgba(255,255,255,0.5)',
              backgroundColor: color,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: selectedColor === color 
                ? '0 4px 12px rgba(0,0,0,0.3)' 
                : '0 2px 6px rgba(0,0,0,0.2)',
              transform: selectedColor === color ? 'scale(1.1)' : 'scale(1)',
            }}
            aria-label={`Select color ${index + 1}`}
          />
        ))}
      </div>

      {/* Logo/Title at Top Left */}
      <div
        style={{
          position: 'absolute',
          top: '30px',
          left: '30px',
          zIndex: 10,
        }}
      >
        <div
          style={{
            width: '50px',
            height: '50px',
            backgroundColor: 'rgba(0,0,0,0.7)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '24px',
          }}
        >
          L
        </div>
      </div>
    </div>
  );
}

function CameraRig({ children }) {
  const group = useRef();
  useFrame((state, delta) => {
    easing.damp3(state.camera.position, [0, 0, 2.5], 0.25, delta);
    easing.dampE(group.current.rotation, [state.pointer.y / 10, -state.pointer.x / 5, 0], 0.25, delta);
  });
  return <group ref={group}>{children}</group>;
}

function Backdrop() {
  const shadows = useRef();
  useFrame((state, delta) => {
    easing.dampC(shadows.current.getMesh().material.color, '#ffffff', 0.25, delta);
  });
  return (
    <AccumulativeShadows
      ref={shadows}
      temporal
      frames={60}
      alphaTest={0.85}
      scale={5}
      resolution={2048}
      rotation={[Math.PI / 2, 0, 0]}
      position={[0, 0, -0.14]}
    >
      <RandomizedLight amount={4} radius={9} intensity={0.55 * Math.PI} ambient={0.25} position={[5, 5, -10]} />
      <RandomizedLight amount={4} radius={5} intensity={0.25 * Math.PI} ambient={0.55} position={[-5, 5, -9]} />
    </AccumulativeShadows>
  );
}

function Shirt({ color }) {
  const groupRef = useRef();
  const colorObj = useRef(new THREE.Color(color));

  useFrame((state, delta) => {
    const targetColor = new THREE.Color(color);
    easing.dampC(colorObj.current, targetColor, 0.25, delta);
    
    // Update all materials in the group
    if (groupRef.current) {
      groupRef.current.traverse((child) => {
        if (child.isMesh && child.material && child.material.color) {
          if (child.material.color.getHex() !== 0xf0f0f0) { // Don't change neck color
            child.material.color = colorObj.current;
          }
        }
      });
    }
  });

  return (
    <group ref={groupRef}>
      {/* Main T-shirt body */}
      <mesh castShadow position={[0, -0.1, 0]}>
        <boxGeometry args={[0.75, 1.0, 0.12]} />
        <meshStandardMaterial
          color={color}
          roughness={0.8}
          metalness={0.05}
        />
      </mesh>
      
      {/* Top rounded part for shoulders */}
      <mesh castShadow position={[0, 0.4, 0]}>
        <sphereGeometry args={[0.4, 16, 16, 0, Math.PI, 0, Math.PI / 2]} />
        <meshStandardMaterial
          color={color}
          roughness={0.8}
          metalness={0.05}
        />
      </mesh>
      
      {/* Left sleeve */}
      <mesh castShadow position={[-0.48, 0.2, 0]} rotation={[0, 0, -0.3]}>
        <cylinderGeometry args={[0.13, 0.16, 0.55, 16]} />
        <meshStandardMaterial
          color={color}
          roughness={0.8}
          metalness={0.05}
        />
      </mesh>
      
      {/* Right sleeve */}
      <mesh castShadow position={[0.48, 0.2, 0]} rotation={[0, 0, 0.3]}>
        <cylinderGeometry args={[0.13, 0.16, 0.55, 16]} />
        <meshStandardMaterial
          color={color}
          roughness={0.8}
          metalness={0.05}
        />
      </mesh>
      
      {/* Neck opening */}
      <mesh castShadow position={[0, 0.45, 0.07]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.12, 0.04, 16, 32]} />
        <meshStandardMaterial
          color="#f0f0f0"
          roughness={0.6}
        />
      </mesh>
    </group>
  );
}
