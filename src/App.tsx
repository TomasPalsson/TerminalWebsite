import React from 'react'
import './App.css'
import TypingAnimation from './components/TypingAnimation'
import { MainButton } from './components/MainButton'
import { Terminal } from 'lucide-react'
import { IoChatbubbleEllipsesOutline } from 'react-icons/io5'
import { FaInfo } from 'react-icons/fa'

function App() {
  return (
    <>

      <div className="flex flex-col items-center justify-center h-screen">
        <TypingAnimation
          text="Tómas Ari Pálsson"
          speed={50}
          className="px-2 font-mono text-4xl text-center sm:text-5xl md:text-5xl lg:text-6xl text-terminal"
        />
        <span className='pt-5 font-mono text-gray-500 text-bold'>
          // Software Dev
        </span>
        <div className="flex flex-wrap justify-center gap-4 px-4 pt-6">
          <MainButton link="/terminal" >
            <Terminal />
            <span>Terminal</span>
          </MainButton>
          <MainButton link="/aboutme" >
            <FaInfo />
            <span>About Me!</span>
          </MainButton>

        </div>
      </div>
    </>
  )

}

export default App

