import React, {useState} from 'react';
import {Home, BookOpen, Activity, Download, Info} from 'lucide-react';
import './App.css';

const Navbar = ({currentPage, setCurrentPage}) => {
  const navItems = [
    {name: 'Home', id: 'home', icon: <Home size={18} />},
    {name: 'Learn', id: 'learn', icon: <BookOpen size={18} />},
    {name: 'Simulate', id: 'simulate', icon: <Activity size={18} />},
    {name: 'Download', id: 'download', icon: <Download size={18} />},
    {name: 'About', id: 'about', icon: <Info size={18} />}
  ];

  return (
    <nav className="navbar">
      <div className="navbar-logo">PCA Educator</div>
      <div className="navbar-links">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`nav-button ${currentPage === item.id ? 'active' : ''}`}
            onClick={() => setCurrentPage(item.id)}
          >
            {item.icon}
            <span>{item.name}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

const HomePage = () => (
  <main className="page-content">
    <h1>Principal Component Analysis</h1>
    <p>Welcome to the interactive PCA learning environment.</p>
  </main>
);

const LearnPage = () => (
  <main className="page-content">
    <h1>Learn PCA</h1>
  </main>
);

const SimulatePage = () => (
  <main className="page-content">
    <h1>Simulation Environment</h1>
  </main>
);

const DownloadPage = () => (
  <main className="page-content">
    <h1>Download Latest Simulation</h1>
  </main>
);

const AboutPage = () => (
  <main className="page-content">
    <h1>About</h1>
  </main>
);

const App = () => {
  const [currentPage, setCurrentPage] = useState('home');

  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <HomePage />;
      case 'learn': return <LearnPage />;
      case 'simulate': return <SimulatePage />;
      case 'download': return <DownloadPage />;
      case 'about': return <AboutPage />;
      default: return <HomePage />;
    }
  };

  return (
    <div className="app-container">
      <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      {renderPage()}
    </div>
  );
};

export default App;