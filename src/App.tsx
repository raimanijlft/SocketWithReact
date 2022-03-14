import React from 'react';
import logo from './logo.svg';
import './App.css';
import { SocketDashboard } from './SocketDashboard';

function App() {
  return (
    <div className="App">
      <header className='App-header'>
        <label><strong>WILIOT</strong></label>
        <p className='no-margin'><small>Test</small></p>
      </header>
      <SocketDashboard title='React Socket with graphs'></SocketDashboard>
    </div>
  );
}

export default App;
