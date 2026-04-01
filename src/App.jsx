import {useState, useRef, useEffect} from 'react';
import './index.css';

const App = () => {
  const [activePage, setActivePage] = useState('home');

  const renderPage = () => {
    switch(activePage) {
      case 'home': return <Home onNavigate={(page) => setActivePage(page)} />;
      case 'sim': return <Simulate />;
      // Additional pages (Learn, Download, About) will be mapped here
      default: return <Home onNavigate={(page) => setActivePage(page)} />;
    }
  };

  return (
    <>
      <nav>
        <div className="nav-logo">PCA<span className="hi">Vis</span> <span className="lo">// dimensionality reduction</span></div>
        <div className="nav-links">
          <button className={`nav-btn ${activePage === 'home' ? 'active' : ''}`} onClick={(e) => setActivePage('home')}>⌂ Home</button>
          <button className={`nav-btn ${activePage === 'learn' ? 'active' : ''}`} onClick={(e) => setActivePage('learn')}>📖 Learn</button>
          <button className={`nav-btn ${activePage === 'sim' ? 'active' : ''}`} onClick={(e) => setActivePage('sim')}>⚡ Simulate</button>
        </div>
      </nav>
      {renderPage()}
    </>
  );
};

const Home = ({onNavigate}) => {
  return (
    <div className="page active" id="page-home">
      <div className="home-inner">
        <div className="home-content">
          <div className="home-eyebrow" style={{color: "var(--accent)", fontFamily: "'DM Mono', monospace", fontSize: "11px", letterSpacing: "3px", marginBottom: "20px"}}>// interactive learning tool</div>
          <h1 className="home-title">
            Principal Component<br/><span className="grad">Analysis</span><br/>Visualized
          </h1>
          <p className="home-sub">
            Understand how PCA reduces dimensionality while preserving variance. Watch data standardisation, covariance matrix calculation, and eigenvector projection in real-time.
          </p>
          <button className="btn-primary" onClick={(e) => onNavigate('sim')}>▶ Start Simulating</button>
        </div>
      </div>
    </div>
  );
};

const Simulate = () => {
  const canvasRef = useRef(null);
  const [nodes, setNodes] = useState([]);

  // Placeholder for canvas sizing and initial render
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const resize = () => {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
      draw(ctx, canvas.width, canvas.height);
    };

    window.addEventListener('resize', resize);
    resize();

    return () => window.removeEventListener('resize', resize);
  }, [nodes]);

  const draw = (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    // Draw Grid
    ctx.strokeStyle = '#1e2d4522';
    for(let x = 0; x < w; x += 48) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
    for(let y = 0; y < h; y += 48) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
    
    if (nodes.length === 0) {
      ctx.fillStyle = '#334155'; ctx.font = "14px 'DM Mono'"; ctx.textAlign = 'center';
      ctx.fillText('Click anywhere to add data points', w/2, h/2);
    }

    // Draw nodes
    nodes.forEach((n) => {
      ctx.beginPath(); ctx.arc(n.x, n.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#00e5ff'; ctx.fill();
    });
  };

  const handleCanvasClick = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setNodes((prev) => [...prev, {x, y}]);
  };

  return (
    <div className="page active sim-layout">
      <div className="sim-canvas-wrap">
        <canvas ref={canvasRef} id="simCanvas" onClick={handleCanvasClick}></canvas>
      </div>
      <div className="sim-sidebar" style={{padding: "20px"}}>
        <p style={{fontFamily: "'DM Mono', monospace", color: "var(--accent)"}}>// PCA CONTROLS</p>
        <button className="btn-primary" style={{marginTop: "10px"}} onClick={(e) => setNodes([])}>Clear Data</button>
      </div>
    </div>
  );
};

export default App;