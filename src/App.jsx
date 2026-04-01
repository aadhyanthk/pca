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
      element.scrollIntoView({behavior: 'smooth', block: 'start'});
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
            max w<sup>T</sup>&Sigma;w subject to ||w|| = 1
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
          <table className="data-table">
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

const SimulatePage = () => (
  <main className="page-content center-content">
    <h1>Simulation Environment</h1>
  </main>
);

const DownloadPage = () => (
  <main className="page-content center-content">
    <h1>Download Latest Simulation</h1>
  </main>
);

const AboutPage = () => (
  <main className="page-content center-content">
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