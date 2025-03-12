import React, { useState } from 'react'
import Search from './components/Search'

const App = () => {

  const [searchTerm, setSearchTerm] = useState('');

  return (
    <main>
      <div className='pattern'/>

      <div className='wrapper'>
        <header>
          <img src="./hero.png" alt="Background-img" />
          <h1> Find <span className='text-gradient'>Movies</span> you'll enjoy without any hassle</h1>
        </header>
        
        < Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      
      </div>
    </main>
  )
}

export default App