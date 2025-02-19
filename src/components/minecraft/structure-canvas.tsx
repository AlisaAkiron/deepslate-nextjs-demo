'use client'

import { FC, useEffect, useRef, useState } from 'react'
import { Resources, Structure, StructureRenderer } from 'deepslate'
import { mat4, ReadonlyVec3 } from 'gl-matrix'

interface StructureCanvasProps {
  structure: Structure
  resources: Resources
  width?: number
  height?: number
}

export const StructureCanvas: FC<StructureCanvasProps> = ({
  structure,
  resources,
  width = 800,
  height = 600,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rendererRef = useRef<StructureRenderer | null>(null)
  const [dragPos, setDragPos] = useState<[number, number] | null>(null)
  const [viewDistance, setViewDistance] = useState(4)
  const [xRotation, setXRotation] = useState(0.8)
  const [yRotation, setYRotation] = useState(0.8)

  const size = structure.getSize()
  const center: ReadonlyVec3 = [size[0] / 2, size[1] / 2, size[2] / 2]

  const render = (view: mat4) => {
    const renderer = rendererRef.current
    if (!renderer) return

    renderer.drawStructure(view)
  }

  const redraw = () => {
    requestAnimationFrame(() => {
      setYRotation(yRotation % (Math.PI * 2))
      setXRotation(Math.max(-Math.PI / 2, Math.min(Math.PI / 2, xRotation)))
      setViewDistance(Math.max(1, viewDistance))

      const view = mat4.create()
      mat4.translate(view, view, [0, 0, -viewDistance])
      mat4.rotate(view, view, xRotation, [1, 0, 0])
      mat4.rotate(view, view, yRotation, [0, 1, 0])
      mat4.translate(view, view, [-center[0], -center[1], -center[2]])

      render(view)
    })
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext('webgl')
    if (!gl) return

    rendererRef.current = new StructureRenderer(gl, structure, resources)
    redraw()

    return () => {}
  }, [structure, resources])

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      onMouseDown={(e) => {
        if (e.button === 0) {
          setDragPos([e.clientX, e.clientY])
        }
      }}
      onMouseMove={(e) => {
        if (dragPos) {
          setXRotation(xRotation + (e.clientY - dragPos[1]) / 100)
          setYRotation(yRotation + (e.clientX - dragPos[0]) / 100)
          setDragPos([e.clientX, e.clientY])
          redraw()
        }
      }}
      onMouseUp={() => {
        setDragPos(null)
      }}
      onWheel={(e) => {
        setViewDistance(viewDistance + e.deltaY / 100)
        redraw()
      }}
    />
  )
}
