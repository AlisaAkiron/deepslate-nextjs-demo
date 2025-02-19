'use client'

import { FC, useEffect, useRef, useState } from 'react'
import {
  BlockDefinition,
  BlockModel,
  Identifier,
  Resources,
  Structure,
  TextureAtlas,
  upperPowerOfTwo,
  UV,
} from 'deepslate'

import { StructureCanvas } from './structure-canvas'

const MCMETA = 'https://raw.githubusercontent.com/misode/mcmeta/'

const StructureRender: FC = () => {
  const [blockDefinitionMap, setBlockDefinitionMap] =
    useState<Record<string, BlockDefinition>>()
  const [blockModelMap, setBlockModelMap] =
    useState<Record<string, BlockModel>>()
  const [textureAtlas, setTextureAtlas] = useState<TextureAtlas>()

  const [structure, setStructure] = useState<Structure>()
  const [resources, setResources] = useState<Resources>()

  useEffect(() => {
    const getResources = async () => {
      // Block Definition
      const blockStatesData = await fetch(
        `${MCMETA}summary/assets/block_definition/data.min.json`,
      )
      const blockStatesDataJson = await blockStatesData.json()
      const blockDefinitions: Record<string, BlockDefinition> = {}
      Object.keys(blockStatesDataJson).forEach((id) => {
        blockDefinitions[`minecraft:${id}`] = BlockDefinition.fromJson(
          blockStatesDataJson[id],
        )
      })
      setBlockDefinitionMap(blockDefinitions)

      // Block Model
      const modelData = await fetch(
        `${MCMETA}summary/assets/model/data.min.json`,
      )
      const modelDataJson = await modelData.json()
      const blockModels: Record<string, BlockModel> = {}
      Object.keys(modelDataJson).forEach((id) => {
        blockModels[`minecraft:${id}`] = BlockModel.fromJson(modelDataJson[id])
      })
      setBlockModelMap(blockModels)

      // UV Map & Atlas
      const uvMapData = await fetch(`${MCMETA}atlas/all/data.min.json`)
      const atlasImageData = await fetch(`${MCMETA}atlas/all/atlas.png`)

      const uvMapDataJson = await uvMapData.json()

      const atlasImage = new Image()
      atlasImage.src = URL.createObjectURL(await atlasImageData.blob())
      atlasImage.crossOrigin = 'Anonymous'
      await new Promise((res) => (atlasImage.onload = res))

      const atlasSize = upperPowerOfTwo(
        Math.max(atlasImage.width, atlasImage.height),
      )
      const atlasCanvas = document.createElement('canvas')
      atlasCanvas.width = atlasSize
      atlasCanvas.height = atlasSize
      const atlasCtx = atlasCanvas.getContext('2d')!
      atlasCtx.drawImage(atlasImage, 0, 0)
      const atlasData = atlasCtx.getImageData(0, 0, atlasSize, atlasSize)

      const idMap: Record<string, UV> = {}
      Object.keys(uvMapDataJson).forEach((id) => {
        const [u, v, du, dv] = uvMapDataJson[id]
        const dv2 = du !== dv && id.startsWith('block/') ? du : dv
        const identifier = Identifier.create(id).toString()
        idMap[identifier] = [
          u / atlasSize,
          v / atlasSize,
          (u + du) / atlasSize,
          (v + dv2) / atlasSize,
        ]
      })
      const texture = new TextureAtlas(atlasData, idMap)
      setTextureAtlas(texture)
    }

    getResources()
  }, [])

  useEffect(() => {
    if (
      blockDefinitionMap === undefined ||
      blockModelMap === undefined ||
      textureAtlas === undefined
    ) {
      return
    }

    const resources: Resources = {
      getBlockDefinition: (id) => blockDefinitionMap[id.toString()],
      getBlockModel: (id) => blockModelMap[id.toString()],
      getTextureUV: (id) => textureAtlas.getTextureUV(id),
      getTextureAtlas: () => textureAtlas.getTextureAtlas(),
      getBlockFlags: (_id) => {
        return { opaque: false }
      },
      getBlockProperties: (_id) => {
        return null
      },
      getDefaultBlockProperties: (_id) => {
        return null
      },
    }

    const structure = new Structure([3, 2, 1])
    structure.addBlock([1, 0, 0], 'minecraft:grass_block', { snowy: 'false' })
    structure.addBlock([2, 0, 0], 'minecraft:stone')
    structure.addBlock([1, 1, 0], 'minecraft:skeleton_skull', {
      rotation: '15',
    })
    structure.addBlock([2, 1, 0], 'minecraft:acacia_fence', {
      waterlogged: 'true',
      north: 'true',
    })
    structure.addBlock([0, 0, 0], 'minecraft:wall_torch', { facing: 'west' })

    setStructure(structure)
    setResources(resources)
  }, [blockDefinitionMap, blockModelMap, textureAtlas])

  if (structure === undefined || resources === undefined) {
    return <p>Loading</p>
  }

  return <StructureCanvas structure={structure} resources={resources} />
}

export default StructureRender
