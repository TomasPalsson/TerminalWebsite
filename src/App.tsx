import React from 'react'
import './App.css'
import TypingAnimation from './components/TypingAnimation'
import { MainButton } from './components/MainButton'
import { Terminal } from 'lucide-react'

function App() {
  return (
    <>

      <div className="flex flex-col items-center justify-center h-screen">
        <TypingAnimation
          text="Tómas Ari Pálsson"
          speed={50}
          className="text-terminal lg:text-6xl md:text-4xl sm:text-xl font-mono"
        />
        <span className='pt-5 text-gray-500 text-bold font-mono'>
          // Software Dev - AI 
        </span>
        <div className="flex justify-end space-x-4 pt-4">
          <MainButton link="/terminal" >
            <Terminal />
            <span>Terminal</span>
          </MainButton>
          <MainButton link="/aboutme" >
            <span>About Me!</span>
          </MainButton>
        </div>
      </div>
    </>
  )

}

export default App

