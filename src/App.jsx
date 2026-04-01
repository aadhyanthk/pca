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
    {id: 'math', title: 'The Mathematics of PCA'},
    {id: 'step-1', title: '1. Standardization'},
    {id: 'step-2', title: '2. Covariance Matrix'},
    {id: 'step-3', title: '3. Eigen Decomposition'},
    {id: 'step-4', title: '4. Feature Vector'},
    {id: 'step-5', title: '5. Recasting Data'},
    {id: 'use-cases', title: 'Example Use Cases'},
    {id: 'conclusion', title: 'Conclusion'}
  ];

  return (
    <div className="learn-container">
      <aside className="learn-sidebar">
        <h3>Algorithm Steps</h3>
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
        <h1>Learn Principal Component Analysis</h1>

        <section id="intro">
          <h2>Introduction</h2>
          <p>Principal Component Analysis (PCA) is a powerful statistical technique used primarily for dimensionality reduction in machine learning and data analysis. When dealing with complex datasets containing numerous variables, it becomes challenging to visualize and process the information. PCA elegantly solves this by transforming the large set of variables into a smaller, more manageable set called "principal components," while retaining as much of the original dataset's variation as possible.</p>
        </section>

        <section id="math">
          <h2>The Mathematics of PCA</h2>
          <p className="intro-text">Here is the mechanical breakdown of the algorithm, detailing how data is transformed step by step.</p>
        </section>

        <section id="step-1">
          <h2>1. Standardization</h2>
          <p>Before applying PCA, we must standardize the range of the continuous initial variables so that each contributes equally to the analysis. We achieve this by subtracting the mean and dividing by the standard deviation.</p>
          <div className="math-block">
            Z = (X - &mu;) / &sigma;
          </div>
        </section>

        <section id="step-2">
          <h2>2. Covariance Matrix Computation</h2>
          <p>The goal is to understand how the variables of the input dataset are varying from the mean with respect to each other. The covariance matrix mathematically captures the correlations between all possible pairs of variables.</p>
          <div className="math-block">
            C = (Z<sup>T</sup> &middot; Z) / (n - 1)
          </div>
        </section>

        <section id="step-3">
          <h2>3. Eigen Decomposition</h2>
          <p>We compute the eigenvectors and eigenvalues of the covariance matrix to identify the principal components. Eigenvectors represent the directions of maximum variance, while eigenvalues define their magnitude.</p>
          <div className="math-block">
            C &middot; v = &lambda; &middot; v
          </div>
          <p><em>Where 'v' is the eigenvector and '&lambda;' is the eigenvalue.</em></p>
        </section>

        <section id="step-4">
          <h2>4. Feature Vector Selection</h2>
          <p>We order the eigenvectors by their corresponding eigenvalues in descending order. This orders the principal components by significance. We discard the components of lesser significance and form a matrix of vectors, called the Feature Vector (W).</p>
          <div className="math-block">
            W = [v<sub>1</sub>, v<sub>2</sub>, ..., v<sub>k</sub>]
          </div>
        </section>

        <section id="step-5">
          <h2>5. Recasting the Data</h2>
          <p>Finally, we use the Feature Vector to reorient the data from the original axes to the ones represented by the principal components. This is done by multiplying the transposed standardized dataset by the Feature Vector.</p>
          <div className="math-block">
            Y = Z &middot; W
          </div>
        </section>

        <section id="use-cases">
          <h2>Example Use Cases</h2>
          <p>PCA is highly versatile and is deployed across various domains to streamline data:</p>
          <ul className="content-list">
            <li><strong>Image Compression:</strong> Reducing the number of pixels required to render an image without losing significant visual fidelity.</li>
            <li><strong>Genomics:</strong> Visualizing genetic distance and relatedness between populations by condensing thousands of DNA markers.</li>
            <li><strong>Finance:</strong> Identifying underlying market trends and managing risk by analyzing the correlations between different stocks or assets.</li>
            <li><strong>Facial Recognition:</strong> Extracting the most critical features from facial images (Eigenfaces) to match identities efficiently.</li>
          </ul>
        </section>

        <section id="conclusion">
          <h2>Conclusion</h2>
          <p>By effectively compressing data and eliminating noise, PCA serves as an essential preprocessing step for many advanced machine learning models. Understanding its underlying mechanics allows us to make informed decisions about when and how to apply dimensionality reduction to our datasets. Once you are comfortable with these concepts, you can proceed to the Simulation environment to observe these transformations in action.</p>
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