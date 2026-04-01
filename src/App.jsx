import React, {useState, useEffect} from 'react';
import {Home, BookOpen, Activity, Download, Info} from 'lucide-react';
import './App.css';

// --- NATIVE PCA ENGINE ---
const performPCA = (data) => {
  const keys = Object.keys(data[0]).filter((k) => !isNaN(Number(data[0][k])));
  const n = data.length;
  
  // 1. Standardize (Mean centering & scaling)
  const means = keys.map((k) => data.reduce((sum, row) => sum + Number(row[k]), 0) / n);
  const stds = keys.map((k, i) => {
    const variance = data.reduce((sum, row) => sum + Math.pow(Number(row[k]) - means[i], 2), 0) / (n - 1);
    return variance === 0 ? 1 : Math.sqrt(variance);
  });

  const standardized = data.map((row) => {
    const obj = {};
    keys.forEach((k, i) => obj[k] = (Number(row[k]) - means[i]) / stds[i]);
    return obj;
  });

  // 2. Covariance Matrix
  const cov = keys.map((_, i) => keys.map((_, j) => {
    return standardized.reduce((sum, row) => sum + row[keys[i]] * row[keys[j]], 0) / (n - 1);
  }));

  // 3. Eigen Decomposition (Jacobi Algorithm)
  let max_iter = 100, m_dim = keys.length;
  let e = keys.map((_, i) => keys.map((_, j) => i === j ? 1 : 0));
  let M = cov.map((row) => [...row]);
  
  for(let iter = 0; iter < max_iter; iter++) {
    let max_val = 0, p = 0, q = 1;
    for(let i=0; i<m_dim; i++) {
      for(let j=i+1; j<m_dim; j++) {
        if(Math.abs(M[i][j]) > max_val) { max_val = Math.abs(M[i][j]); p = i; q = j; }
      }
    }
    if(max_val < 1e-9) break;
    let theta = (M[q][q] - M[p][p]) / (2 * M[p][q]);
    let t = Math.sign(theta || 1) / (Math.abs(theta) + Math.sqrt(theta*theta + 1));
    if (M[p][q] === 0) t = 0;
    let c = 1 / Math.sqrt(t*t + 1), s = c * t;

    for(let i=0; i<m_dim; i++) {
      if(i !== p && i !== q) {
        let mip = M[i][p], miq = M[i][q];
        M[i][p] = M[p][i] = c * mip - s * miq;
        M[i][q] = M[q][i] = s * mip + c * miq;
      }
    }
    let mpp = M[p][p], mqq = M[q][q], mpq = M[p][q];
    M[p][p] = c*c*mpp - 2*s*c*mpq + s*s*mqq;
    M[q][q] = s*s*mpp + 2*s*c*mpq + c*c*mqq;
    M[p][q] = M[q][p] = 0;

    for(let i=0; i<m_dim; i++) {
      let eip = e[i][p], eiq = e[i][q];
      e[i][p] = c * eip - s * eiq;
      e[i][q] = s * eip + c * eiq;
    }
  }

  // 4. Feature Vector Selection
  let eigen = keys.map((_, i) => ({ value: M[i][i], vector: e.map((row) => row[i]) }));
  eigen.sort((a, b) => b.value - a.value);
  const totalVar = eigen.reduce((s, ev) => s + ev.value, 0) || 1;
  eigen.forEach((ev) => ev.ratio = ev.value / totalVar);

  // 5. Recast Data
  const projected = standardized.map((row) => {
    return {
      PC1: keys.reduce((s, k, i) => s + row[k] * eigen[0].vector[i], 0),
      PC2: keys.reduce((s, k, i) => s + row[k] * eigen[1].vector[i], 0)
    };
  });

  return { keys, standardized, cov, eigen, projected };
};

// --- VISUALIZATION COMPONENTS ---
const ScatterPlot = ({data}) => {
  const padding = 30;
  const width = 400, height = 300;
  const minX = Math.min(...data.map((d) => d.PC1));
  const maxX = Math.max(...data.map((d) => d.PC1));
  const minY = Math.min(...data.map((d) => d.PC2));
  const maxY = Math.max(...data.map((d) => d.PC2));
  
  const scaleX = (x) => padding + ((x - minX) / (maxX - minX || 1)) * (width - padding * 2);
  const scaleY = (y) => height - padding - ((y - minY) / (maxY - minY || 1)) * (height - padding * 2);
  
  return (
    <div className="chart-container">
      <h4>Projected Data (PC1 vs PC2)</h4>
      <svg width={width} height={height} className="raw-chart">
        {data.map((d, i) => (
          <circle key={i} cx={scaleX(d.PC1)} cy={scaleY(d.PC2)} r={5} fill="#3182ce" opacity={0.7} />
        ))}
      </svg>
    </div>
  );
};

const BarChart = ({data}) => {
  const padding = 40;
  const width = 400, height = 300;
  const maxVal = Math.max(...data.map((d) => d.ratio));
  
  return (
    <div className="chart-container">
      <h4>Explained Variance</h4>
      <svg width={width} height={height} className="raw-chart">
        {data.map((d, i) => {
          const barHeight = (d.ratio / maxVal) * (height - padding * 2);
          const barWidth = (width - padding * 2) / data.length - 10;
          const x = padding + i * (barWidth + 10);
          const y = height - padding - barHeight;
          return (
            <g key={i}>
              <rect x={x} y={y} width={barWidth} height={barHeight} fill="#38a169" />
              <text x={x + barWidth/2} y={height - padding + 15} textAnchor="middle" fontSize="12" fill="#4a5568">PC{i+1}</text>
              <text x={x + barWidth/2} y={y - 5} textAnchor="middle" fontSize="12" fill="#4a5568">{(d.ratio * 100).toFixed(1)}%</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

// --- PAGES ---
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
  <main className="page-content center-content">
    <h1>Principal Component Analysis</h1>
    <p>Welcome to the interactive PCA learning environment.</p>
  </main>
);

const defaultCSV = `sepal_length,sepal_width,petal_length,petal_width
5.1,3.5,1.4,0.2
4.9,3.0,1.4,0.2
4.7,3.2,1.3,0.2
4.6,3.1,1.5,0.2
5.0,3.6,1.4,0.2`;

const SimulatePage = () => {
  const [inputText, setInputText] = useState(defaultCSV);
  const [parsedData, setParsedData] = useState(null);
  const [results, setResults] = useState(null);
  const [step, setStep] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let timer;
    if (isPlaying && step < 5) {
      timer = setTimeout(() => setStep((s) => s + 1), 2000); // Increased delay slightly to read tables
    } else if (step === 5) {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, step]);

  const handleParse = (text) => {
    const lines = text.trim().split('\n').map((l) => l.split(',').map((s) => s.trim()));
    if (lines.length < 2) return null;
    const keys = lines[0];
    const data = lines.slice(1).map((row) => {
      let obj = {};
      keys.forEach((k, i) => obj[k] = Number(row[i]));
      return obj;
    });
    setParsedData(data);
    return data;
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => setInputText(evt.target.result);
      reader.readAsText(file);
    }
  };

  const handleStart = () => {
    const data = handleParse(inputText);
    if (data) {
      setResults(performPCA(data));
      setStep(0);
      setIsPlaying(true);
    }
  };

  const generateDownload = () => {
    if (!results || !parsedData) return;
    const {keys, standardized, cov, eigen} = results;
    const n = parsedData.length;
    const grid = Array.from({length: n + 30}, () => Array(25).fill(''));
    
    grid[0][0] = 'Initial Data:';
    keys.forEach((k, i) => grid[1][i] = k);
    parsedData.forEach((row, i) => keys.forEach((k, j) => grid[i + 2][j] = row[k]));
    
    const rStart = n + 3; 
    grid[rStart][0] = 'Standardized Data:';
    grid[rStart][5] = 'Covariance Matrix';
    grid[rStart][10] = 'Eigenvalues:';
    grid[rStart][12] = 'Eigenvectors:';
    grid[rStart][18] = 'Explained Variance:';
    
    keys.forEach((k, i) => { grid[rStart + 1][i] = k; grid[rStart + 1][5 + i] = k; });
    eigen.forEach((_, i) => grid[rStart + 1][13 + i] = `PC${i + 1}`);
    grid[rStart + 1][18] = 'Variance_Ratio';
    
    standardized.forEach((row, i) => keys.forEach((k, j) => grid[rStart + 2 + i][j] = row[k]));
    cov.forEach((row, i) => {
      grid[rStart + 2 + i][4] = keys[i];
      row.forEach((val, j) => grid[rStart + 2 + i][5 + j] = val);
    });
    eigen.forEach((e, i) => grid[rStart + 1 + i][10] = e.value);
    keys.forEach((k, i) => {
      grid[rStart + 2 + i][12] = k;
      eigen.forEach((e, j) => grid[rStart + 2 + i][13 + j] = e.vector[i]);
    });
    eigen.forEach((e, i) => {
      grid[rStart + 2 + i][18] = e.ratio;
      grid[rStart + 2 + i][19] = `PC${i + 1}`;
    });
    
    const textStart = rStart + keys.length + 3;
    if (grid.length > textStart + 4) {
      grid[textStart][10] = 'Av=λv';
      grid[textStart + 1][10] = 'Where:';
      grid[textStart + 2][10] = 'A= covariance matrix';
      grid[textStart + 3][10] = 'v=eigenvector';
      grid[textStart + 4][10] = 'λ=eigenvalues';
      grid[textStart][18] = 'Variance Ratio=λi/∑λ';
      grid[textStart + 2][18] = 'PC1 and PC2 are highest so they are picked.';
    }
    
    const csvContent = grid.map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], {type: 'text/csv;charset=utf-8;'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'PCA_Result.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderDataPreview = (dataArray, limit = 5) => {
    if (!dataArray || dataArray.length === 0) return null;
    const keys = Object.keys(dataArray[0]);
    return (
      <div className="table-wrapper">
        <table className="math-table">
          <thead>
            <tr>{keys.map(k => <th key={k}>{k}</th>)}</tr>
          </thead>
          <tbody>
            {dataArray.slice(0, limit).map((row, i) => (
              <tr key={i}>{keys.map(k => <td key={k}>{Number(row[k]).toFixed(4)}</td>)}</tr>
            ))}
          </tbody>
        </table>
        {dataArray.length > limit && <div className="muted-text">... showing {limit} of {dataArray.length} rows</div>}
      </div>
    );
  };

  const renderMatrix = (matrix, rowLabels, colLabels) => {
    return (
      <div className="table-wrapper">
        <table className="math-table">
          <thead>
            <tr>
              <th></th>
              {colLabels.map(l => <th key={l}>{l}</th>)}
            </tr>
          </thead>
          <tbody>
            {matrix.map((row, i) => (
              <tr key={i}>
                <th>{rowLabels[i]}</th>
                {row.map((val, j) => <td key={j}>{Number(val).toFixed(4)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <main className="page-content">
      <div className="sim-header">
        <h1>Simulation Environment</h1>
        <p>Input your data below and observe the mathematical transformations.</p>
      </div>
      
      <div className="sim-dashboard">
        <div className="sim-controls">
          <h3>1. Input Dataset (CSV Format)</h3>
          <textarea 
            value={inputText} 
            onChange={(e) => setInputText(e.target.value)}
            className="csv-input"
          />
          <div className="sim-actions">
            <input type="file" accept=".csv" onChange={handleFileUpload} id="csv-upload" className="file-input" />
            <label htmlFor="csv-upload" className="upload-btn">Upload CSV</label>
            <button onClick={handleStart} className="start-btn" disabled={isPlaying}>
              {isPlaying ? 'Simulating...' : 'Start Simulation'}
            </button>
          </div>
        </div>

        {step >= 0 && results && (
          <div className="sim-viewer">
            <h3>2. Algorithm Execution</h3>
            <div className="sim-steps-container">
              
              {step >= 0 && (
                <div className="sim-step fade-in">
                  <div className="step-title">Step 1: Data Parsed</div>
                  {renderDataPreview(parsedData)}
                </div>
              )}

              {step >= 1 && (
                <div className="sim-step fade-in">
                  <div className="step-title">Step 2: Data Standardized (Z-Score)</div>
                  {renderDataPreview(results.standardized)}
                </div>
              )}

              {step >= 2 && (
                <div className="sim-step fade-in">
                  <div className="step-title">Step 3: Covariance Matrix</div>
                  {renderMatrix(results.cov, results.keys, results.keys)}
                </div>
              )}

              {step >= 3 && (
                <div className="sim-step fade-in">
                  <div className="step-title">Step 4: Eigen Decomposition</div>
                  <div className="table-wrapper">
                    <table className="math-table">
                      <thead>
                        <tr>
                          <th>Component</th>
                          <th>Eigenvalue (&lambda;)</th>
                          <th>Eigenvector (v)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.eigen.map((e, i) => (
                          <tr key={i}>
                            <td>PC{i + 1}</td>
                            <td>{Number(e.value).toFixed(4)}</td>
                            <td>[{e.vector.map(v => Number(v).toFixed(3)).join(', ')}]</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {step >= 4 && (
                <div className="sim-step fade-in">
                  <div className="step-title">Step 5: Principal Components Selected</div>
                  <div className="visualizations">
                    <BarChart data={results.eigen} />
                  </div>
                </div>
              )}

              {step >= 5 && (
                <div className="sim-step fade-in">
                  <div className="step-title">Step 6: Final Projection (Recasting Data)</div>
                  <div className="split-view">
                    <div className="split-table">
                      {renderDataPreview(results.projected)}
                    </div>
                    <div className="split-chart">
                      <ScatterPlot data={results.projected} />
                    </div>
                  </div>
                </div>
              )}

            </div>

            {step >= 5 && (
              <div className="download-section fade-in">
                <button onClick={generateDownload} className="download-btn">
                  <Download size={18} /> Download Exact PCA_Result.csv
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
};

// ... Include LearnPage, DownloadPage, AboutPage as they were ...
const App = () => {
  const [currentPage, setCurrentPage] = useState('simulate');

  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <HomePage />;
      case 'simulate': return <SimulatePage />;
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