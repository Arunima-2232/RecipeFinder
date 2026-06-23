import './App.css';
import React from 'react';
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import Login from './components/Login';
import Recipe from './components/Recipe';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login/>}/>
        <Route path="/recipeFinder" element={<Recipe/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
