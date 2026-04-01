import React, {useState, useEffect} from 'react';
import {Home, BookOpen, Activity, Download, Info} from 'lucide-react';
import './App.css';

// --- NATIVE PCA ENGINE ---
const performPCA = (data) => {
  const keys = Object.keys(data[0]).filter((k) => !isNaN(Number(data[0][k])));
  const n = data.length;
  
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

  const cov = keys.map((_, i) => keys.map((_, j) => {
    return standardized.reduce((sum, row) => sum + row[keys[i]] * row[keys[j]], 0) / (n - 1);
  }));

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

  let eigen = keys.map((_, i) => ({value: M[i][i], vector: e.map((row) => row[i])}));
  eigen.sort((a, b) => b.value - a.value);
  const totalVar = eigen.reduce((s, ev) => s + ev.value, 0) || 1;
  eigen.forEach((ev) => ev.ratio = ev.value / totalVar);

  const projected = standardized.map((row) => {
    return {
      PC1: keys.reduce((s, k, i) => s + row[k] * eigen[0].vector[i], 0),
      PC2: keys.reduce((s, k, i) => s + row[k] * eigen[1].vector[i], 0)
    };
  });

  return {keys, standardized, cov, eigen, projected};
};

// --- VISUALIZATION COMPONENTS ---
const ScatterPlot = ({data}) => {
  const padding = 45; // Increased padding for axis labels
  const width = 400, height = 300;
  const minX = Math.min(...data.map((d) => d.PC1));
  const maxX = Math.max(...data.map((d) => d.PC1));
  const minY = Math.min(...data.map((d) => d.PC2));
  const maxY = Math.max(...data.map((d) => d.PC2));
  
  const scaleX = (x) => padding + ((x - minX) / (maxX - minX || 1)) * (width - padding * 2);
  const scaleY = (y) => height - padding - ((y - minY) / (maxY - minY || 1)) * (height - padding * 2);

  const xTicks = [minX, (minX + maxX) / 2, maxX];
  const yTicks = [minY, (minY + maxY) / 2, maxY];
  
  return (
    <div className="chart-container">
      <h4>Projected Data (PC1 vs PC2)</h4>
      <svg width={width} height={height} className="raw-chart">
        {/* Grid Axes */}
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#475569" strokeWidth="1" />
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#475569" strokeWidth="1" />
        
        {/* X Ticks & Scale */}
        {xTicks.map((t, i) => (
          <g key={`x-${i}`}>
            <line x1={scaleX(t)} y1={height - padding} x2={scaleX(t)} y2={height - padding + 5} stroke="#475569" />
            <text x={scaleX(t)} y={height - padding + 20} textAnchor="middle" fontSize="10" fill="#94a3b8">{t.toFixed(2)}</text>
          </g>
        ))}
        
        {/* Y Ticks & Scale */}
        {yTicks.map((t, i) => (
          <g key={`y-${i}`}>
            <line x1={padding - 5} y1={scaleY(t)} x2={padding} y2={scaleY(t)} stroke="#475569" />
            <text x={padding - 10} y={scaleY(t) + 3} textAnchor="end" fontSize="10" fill="#94a3b8">{t.toFixed(2)}</text>
          </g>
        ))}

        {/* Labels */}
        <text x={width / 2} y={height - 5} textAnchor="middle" fontSize="12" fontWeight="bold" fill="#e2e8f0">PC1</text>
        <text x={12} y={height / 2} textAnchor="middle" fontSize="12" fontWeight="bold" fill="#e2e8f0" transform={`rotate(-90, 12, ${height/2})`}>PC2</text>

        {/* Data Points */}
        {data.map((d, i) => (
          <circle key={i} cx={scaleX(d.PC1)} cy={scaleY(d.PC2)} r={5} fill="#60a5fa" opacity={0.8} />
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
              <rect x={x} y={y} width={barWidth} height={barHeight} fill="#10b981" />
              <text x={x + barWidth/2} y={height - padding + 15} textAnchor="middle" fontSize="12" fill="#e2e8f0">PC{i+1}</text>
              <text x={x + barWidth/2} y={y - 5} textAnchor="middle" fontSize="12" fill="#e2e8f0">{(d.ratio * 100).toFixed(1)}%</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

// --- NAVIGATION ---
const Navbar = ({currentPage, setCurrentPage}) => {
  const navItems = [
    {name: 'Home', id: 'home', icon: <Home size={18} />, isExternal: false},
    {name: 'Learn', id: 'learn', icon: <BookOpen size={18} />, isExternal: false},
    {name: 'Simulate', id: 'simulate', icon: <Activity size={18} />, isExternal: false},
    {name: 'Download', id: 'download', icon: <Download size={18} />, isExternal: true, url: 'https://github.com/aadhyanthk/pca'},
    {name: 'About', id: 'about', icon: <Info size={18} />, isExternal: false}
  ];

  return (
    <nav className="navbar">
      <div className="navbar-logo">PCA Educator</div>
      <div className="navbar-links">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`nav-button ${currentPage === item.id && !item.isExternal ? 'active' : ''}`}
            onClick={() => {
              if (item.isExternal) {
                window.open(item.url, '_blank', 'noopener,noreferrer');
              } else {
                setCurrentPage(item.id);
              }
            }}
          >
            {item.icon}
            <span>{item.name}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

// --- PAGES ---
const HomePage = () => (
  <main className="page-content center-content">
    <h1>Principal Component Analysis</h1>
    <p>Welcome to the interactive PCA learning environment.</p>
  </main>
);

const LearnPage = () => {
  const scrollToSection = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 90;
      window.scrollTo({top: y, behavior: 'smooth'});
    }
  };

  const sections = [
    {id: 'intro', title: 'Introduction'},
    {id: 'concepts', title: 'Key Concepts'},
    {id: 'objective', title: 'Objective of PCA'},
    {id: 'steps', title: 'The Algorithm'},
    {id: 'example', title: 'Worked Example'},
    {id: 'selection', title: 'Scree Plot & Selection'},
    {id: 'reconstruction', title: 'Reconstruction'},
    {id: 'assumptions', title: 'Assumptions'},
    {id: 'applications', title: 'Applications'},
    {id: 'conclusion', title: 'Conclusion'}
  ];

  return (
    <div className="learn-container">
      <aside className="learn-sidebar">
        <h3>Syllabus</h3>
        <ul>
          {sections.map((sec) => (
            <li key={sec.id}>
              <a href={`#${sec.id}`} onClick={(e) => scrollToSection(e, sec.id)}>
                {sec.title}
              </a>
            </li>
          ))}
        </ul>
      </aside>
      
      <main className="learn-content">
        <h1>Mastering PCA</h1>

        <section id="intro">
          <h2>Introduction to Dimensionality Reduction</h2>
          <p>Dimensionality reduction is the process of reducing the number of features in a dataset while retaining as much important information as possible. It is an <strong>unsupervised transformation</strong>—meaning it requires no predefined labels—to project high-dimensional data into a lower-dimensional space.</p>
          <p>PCA (Principal Component Analysis) is the gold standard for this, transforming correlated features into linearly uncorrelated variables called <strong>Principal Components</strong>.</p>
        </section>

        <section id="concepts">
          <h2>Key Concepts</h2>
          <ul>
            <li><strong>Variance:</strong> Measures how spread-out data is along a feature. High variance indicates more information.</li>
            <li><strong>Covariance:</strong> Measures how two features change together.</li>
            <li><strong>Covariance Matrix (&Sigma;):</strong> A symmetric matrix where each entry (i, j) is the covariance between feature i and feature j.</li>
            <li><strong>Eigenvectors & Eigenvalues:</strong> Eigenvectors (v) define the directions of the new axes, while Eigenvalues (&lambda;) define the variance magnitude along those axes.</li>
          </ul>
        </section>

        <section id="objective">
          <h2>Objective of PCA</h2>
          <p>PCA finds directions that maximize variance. The first principal component w₁ is found by solving for the direction that maximizes variance under a unit vector constraint:</p>
          <div className="math-block">
            max w<sup>T</sup>&Sigma;w &nbsp; | &nbsp; ||w|| = 1
          </div>
        </section>

        <section id="steps">
          <h2>The PCA Algorithm</h2>
          <ol className="content-list">
            <li><strong>Standardize:</strong> Mean-center the data so &mu; = 0. PCA is sensitive to scale.</li>
            <li><strong>Covariance Matrix:</strong> Compute &Sigma; to capture relationships between pairs.</li>
            <li><strong>Eigen Decomposition:</strong> Solve det(&Sigma; - &lambda;I) = 0 for &lambda; and v.</li>
            <li><strong>Sort:</strong> Rank eigenvectors by &lambda; in descending order.</li>
            <li><strong>Select:</strong> Choose the top <em>k</em> components based on explained variance.</li>
            <li><strong>Project:</strong> Multiply the original data by the projection matrix W: Z = X &middot; W.</li>
          </ol>
        </section>

        <section id="example">
          <h2>Worked Example</h2>
          <p>Consider a simple 2D dataset with 5 points:</p>
          <div className="table-wrapper">
            <table className="math-table">
              <thead>
                <tr><th>Point</th><th>X</th><th>Y</th><th>X - x̄</th><th>Y - ȳ</th><th>PC1 Score</th></tr>
              </thead>
              <tbody>
                <tr><td>P1</td><td>2.5</td><td>2.4</td><td>0.46</td><td>0.16</td><td>0.430</td></tr>
                <tr><td>P2</td><td>0.5</td><td>0.7</td><td>-1.54</td><td>-1.54</td><td>-2.218</td></tr>
                <tr><td>P3</td><td>2.2</td><td>2.9</td><td>0.16</td><td>0.66</td><td>0.593</td></tr>
                <tr><td>P4</td><td>1.9</td><td>2.2</td><td>-0.14</td><td>-0.04</td><td>-0.124</td></tr>
                <tr><td>P5</td><td>3.1</td><td>3.0</td><td>1.06</td><td>0.76</td><td>1.277</td></tr>
              </tbody>
            </table>
          </div>
          <p>In this example, PC1 alone explains <strong>96.3%</strong> of the total variance (&lambda;₁=1.284, &lambda;₂=0.049), allowing us to reduce the data to 1D with minimal loss.</p>
        </section>

        <section id="selection">
          <h2>Scree Plot & Component Selection</h2>
          <p>A Scree Plot graphs eigenvalues against component numbers. To choose <em>k</em>, we use:</p>
          <ul>
            <li><strong>Kaiser's Rule:</strong> Retain components with &lambda; &gt; 1.</li>
            <li><strong>Cumulative Variance:</strong> Retain until &ge; 95% variance is explained.</li>
            <li><strong>Elbow Method:</strong> Find where the curve flattens.</li>
          </ul>
        </section>

        <section id="reconstruction">
          <h2>Reconstruction & Information Loss</h2>
          <p>We can approximate the original data using: <strong>X<sub>approx</sub> = Z &middot; W<sup>T</sup> + &mu;</strong>.</p>
          <p>The reconstruction error is the sum of the discarded eigenvalues. Choosing more components reduces error but increases dimensionality.</p>
        </section>

        <section id="assumptions">
          <h2>Assumptions of PCA</h2>
          <ul>
            <li><strong>Linearity:</strong> Assumes components are linear combinations.</li>
            <li><strong>Large Variance = Important:</strong> Treats high-variance as high-signal.</li>
            <li><strong>Orthogonality:</strong> Components are assumed to be perpendicular.</li>
            <li><strong>Scale Sensitivity:</strong> Requires prior standardization.</li>
          </ul>
        </section>

        <section id="applications">
          <h2>Real-World Applications</h2>
          <ul className="content-list">
            <li><strong>Image Compression:</strong> Reducing pixels via Eigenfaces.</li>
            <li><strong>Genomics:</strong> Visualizing genetic distance across thousands of markers.</li>
            <li><strong>Finance:</strong> Identifying hidden factors in stock price correlations.</li>
            <li><strong>Anomaly Detection:</strong> Outliers often fall far from the PCA projection plane.</li>
          </ul>
        </section>

        <section id="conclusion">
          <h2>Conclusion</h2>
          <p>PCA is an essential preprocessing step. By effectively compressing data and eliminating noise, it empowers more efficient machine learning. You are now ready to test these theories in the <strong>Simulation</strong> tab.</p>
        </section>
      </main>
    </div>
  );
};

const defaultCSV = `sepal_length,sepal_width,petal_length,petal_width
5.1,3.5,1.4,0.2
4.9,3.0,1.4,0.2
4.7,3.2,1.3,0.2
4.6,3.1,1.5,0.2
5.0,3.6,1.4,0.2
5.4,3.9,1.7,0.4
4.6,3.4,1.4,0.3
5.0,3.4,1.5,0.2
4.4,2.9,1.4,0.2
4.9,3.1,1.5,0.1
5.4,3.7,1.5,0.2
4.8,3.4,1.6,0.2
4.8,3.0,1.4,0.1
4.3,3.0,1.1,0.1
5.8,4.0,1.2,0.2
5.7,4.4,1.5,0.4
5.4,3.9,1.3,0.4
5.1,3.5,1.4,0.3
5.7,3.8,1.7,0.3
5.1,3.8,1.5,0.3`;

const SimulatePage = () => {
  const [inputText, setInputText] = useState(defaultCSV);
  const [parsedData, setParsedData] = useState(null);
  const [results, setResults] = useState(null);
  const [step, setStep] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let timer;
    if (isPlaying && step < 5) {
      timer = setTimeout(() => setStep((s) => s + 1), 2000);
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

const AboutPage = () => {
  const teamMembers = [
    {name: 'Aadhyanth K', id: '24BYB1098'},
    {name: 'Guhan PC', id: '24BYB1052'},
    {name: 'SS Kishore Kumar', id: '24BYB1007'},
    {name: 'Niranjan N', id: '24BYB1111'}
  ];

  const getInitials = (name) => {
    return name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <main className="page-content center-content about-page">
      <div className="about-header">
        <h1>About Us</h1>
        <p>We are a dedicated team of developers committed to making complex machine learning algorithms like Principal Component Analysis accessible and interactive for all students.</p>
      </div>
      
      <div className="team-grid">
        {teamMembers.map((member) => (
          <div className="team-card" key={member.id}>
            <div className="avatar">
              {getInitials(member.name)}
            </div>
            <h3>{member.name}</h3>
            <p className="member-id">{member.id}</p>
          </div>
        ))}
      </div>
    </main>
  );
};

const App = () => {
  const [currentPage, setCurrentPage] = useState('home');

  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <HomePage />;
      case 'learn': return <LearnPage />;
      case 'simulate': return <SimulatePage />;
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