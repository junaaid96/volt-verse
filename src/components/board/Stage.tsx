import { useMemo } from 'react'
import { ContactShadows, Environment, Lightformer } from '@react-three/drei'
import { Bloom, EffectComposer, SMAA, ToneMapping } from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'
import { matTexture } from './textures'
import type { StageTheme } from './stageThemes'

const MAT_SIZE = 60

/**
 * Studio environment built from emissive Lightformers: a big overhead softbox
 * plus two strip lights give metal pins and glossy solder mask believable
 * reflections without downloading an HDR. Captured once (`frames={1}`).
 */
function StudioLightformers() {
  return (
    <Environment frames={1} resolution={256}>
      <Lightformer form="rect" intensity={1.5} position={[0, 8, 2]} rotation-x={Math.PI / 2} scale={[14, 8, 1]} />
      <Lightformer form="rect" intensity={1.4} position={[-9, 3, 2]} rotation-y={Math.PI / 2} scale={[10, 2, 1]} />
      <Lightformer form="rect" intensity={1.0} position={[9, 3, -2]} rotation-y={-Math.PI / 2} scale={[10, 2, 1]} />
      <Lightformer form="ring" color="#fff3dc" intensity={1.2} position={[4, 5, 9]} scale={3} />
    </Environment>
  )
}

function KeyLight() {
  return (
    <directionalLight
      position={[6, 11, 6]}
      intensity={2.8}
      castShadow
      shadow-mapSize={[2048, 2048]}
      shadow-camera-left={-11}
      shadow-camera-right={11}
      shadow-camera-top={9}
      shadow-camera-bottom={-9}
      shadow-camera-near={2}
      shadow-camera-far={28}
      shadow-bias={-0.0003}
      shadow-normalBias={0.02}
    />
  )
}

function CuttingMat({ theme }: { theme: StageTheme }) {
  const map = useMemo(() => matTexture(theme.mat, MAT_SIZE / 10), [theme])
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, -0.01, 0]} receiveShadow>
      <planeGeometry args={[MAT_SIZE, MAT_SIZE]} />
      <meshStandardMaterial map={map} roughness={0.92} />
    </mesh>
  )
}

export function Stage({
  theme,
  sceneKey,
  effects,
}: {
  theme: StageTheme
  /** Changes when the bench contents change, so the one-shot contact shadow re-bakes. */
  sceneKey: string
  effects: boolean
}) {
  return (
    <>
      <color attach="background" args={[theme.background]} />
      <fog attach="fog" args={[theme.background, 34, 70]} />
      <StudioLightformers />
      <hemisphereLight args={['#ffffff', '#5d6b60', 0.35]} />
      <KeyLight />
      <CuttingMat theme={theme} />
      <ContactShadows
        key={sceneKey}
        frames={1}
        position={[0, 0, 0]}
        scale={26}
        resolution={1024}
        blur={2.4}
        far={4}
        opacity={0.55}
      />
      {effects && (
        <EffectComposer multisampling={0}>
          <Bloom mipmapBlur luminanceThreshold={3} luminanceSmoothing={0.1} intensity={0.7} />
          <ToneMapping mode={ToneMappingMode.NEUTRAL} />
          <SMAA />
        </EffectComposer>
      )}
    </>
  )
}
