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
          className="font-mono text-terminal lg:text-6xl md:text-4xl sm:text-xl"
        />
        <span className='pt-5 font-mono text-gray-500 text-bold'>
          // Software Dev
        </span>
        <div className="flex justify-end pt-4 space-x-4">
          <MainButton link="/terminal" >
            <Terminal />
            <span>Terminal</span>
          </MainButton>
          <MainButton link="/aboutme" >
            <FaInfo />
            <span>About Me!</span>
          </MainButton>
          <MainButton link="/chat">
            <IoChatbubbleEllipsesOutline/>
            <span>Chat With AI Me!</span>
          </MainButton>

        </div>
      </div>
    </>
  )

}

export default App

