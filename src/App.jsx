import React from 'react';
import {Home, BookOpen, Activity, Download, Info} from 'lucide-react';
import './App.css';

const Navbar = () => {
  const navItems = [
    {name: 'Home', icon: <Home size={18} />},
    {name: 'Learn', icon: <BookOpen size={18} />},
    {name: 'Simulate', icon: <Activity size={18} />},
    {name: 'Download', icon: <Download size={18} />},
    {name: 'About', icon: <Info size={18} />}
  ];

  return (
    <nav className="navbar">
      <div className="navbar-logo">PCA Educator</div>
      <div className="navbar-links">
        {navItems.map((item) => (
          <button key={item.name} className="nav-button">
            {item.icon}
            <span>{item.name}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

const HomePage = () => {
  return (
    <main className="homepage">
      <h1>Principal Component Analysis</h1>
      <p>Welcome to the interactive PCA learning environment.</p>
    </main>
  );
};

const App = () => {
  return (
    <div className="app-container">
      <Navbar />
      <HomePage />
    </div>
  );
};

export default App;