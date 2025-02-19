import { FC } from 'react'

import StructureRender from '@/components/minecraft/StructureRender'

const Home: FC = () => {
  return (
    <div className="hero bg-base-200 min-h-screen">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <StructureRender />
        </div>
      </div>
    </div>
  )
}

export default Home
