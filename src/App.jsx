import React, {useState, useRef} from 'react';
import {Scatter, Bar} from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale
} from 'chart.js';
import Papa from 'papaparse';
import numeric from 'numeric';

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend, BarElement, CategoryScale);

const Navbar = ({currentView, setView}) => {
  return (
    <nav className="bg-slate-900 text-white p-4 shadow-md sticky top-0 z-50">
      <div className="container mx-auto flex flex-wrap justify-between items-center">
        <h1 className="text-xl font-bold tracking-wider cursor-pointer" onClick={() => setView('home')}>
          PCA VIRTUAL LAB
        </h1>
        <div className="flex space-x-2 mt-2 md:mt-0">
          <button 
            className={`px-3 py-1 rounded text-sm transition ${currentView === 'learn' ? 'bg-blue-800' : 'bg-blue-600 hover:bg-blue-500'}`} 
            onClick={() => setView('learn')}
          >
            Learn
          </button>
          <button 
            className={`px-3 py-1 rounded text-sm transition ${currentView === 'simulate' ? 'bg-emerald-800' : 'bg-emerald-600 hover:bg-emerald-500'}`} 
            onClick={() => setView('simulate')}
          >
            Simulate
          </button>
          <button 
            className="bg-purple-600 hover:bg-purple-500 px-3 py-1 rounded text-sm transition" 
            onClick={() => alert('Developed by: Aadhy')}
          >
            Developed by
          </button>
        </div>
      </div>
    </nav>
  );
};

const HomeView = ({setView}) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 p-8 text-center">
      <h2 className="text-5xl font-extrabold text-slate-900 mb-6">Master Principal Component Analysis</h2>
      <p className="text-lg text-gray-600 max-w-2xl mb-10">
        A complete virtual environment for visualizing dimensionality reduction. Navigate through our comprehensive mathematical guide, or jump straight into the interactive simulation to process your own datasets step-by-step.
      </p>
      <div className="flex space-x-4">
        <button 
          onClick={() => setView('learn')} 
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition"
        >
          Explore the Guide
        </button>
        <button 
          onClick={() => setView('simulate')} 
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition"
        >
          Launch Simulation
        </button>
      </div>
    </div>
  );
};

const LearnView = () => {
  return (
    <div className="flex w-full min-h-screen bg-white">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-50 border-r p-6 hidden md:block sticky top-0 h-screen overflow-y-auto">
        <h3 className="font-bold text-lg mb-4 text-slate-800">Contents</h3>
        <ul className="space-y-3 text-sm text-blue-600 font-medium">
          <li><a href="#introduction" className="hover:text-blue-800">1. Introduction to PCA</a></li>
          <li><a href="#mathematics" className="hover:text-blue-800">2. Core Mathematics</a></li>
          <li><a href="#algorithm" className="hover:text-blue-800">3. Step-by-Step Algorithm</a></li>
          <li><a href="#applications" className="hover:text-blue-800">4. Real-World Applications</a></li>
        </ul>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 md:p-12 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-12">
          <section id="introduction">
            <h2 className="text-3xl font-bold mb-4 border-b pb-2">1. Introduction to PCA</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Principal Component Analysis (PCA) is an unsupervised machine learning technique utilized primarily for dimensionality reduction. It simplifies the complexity in high-dimensional data while retaining the trends and patterns.
            </p>
          </section>

          <section id="mathematics">
            <h2 className="text-3xl font-bold mb-4 border-b pb-2">2. Core Mathematics</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              The foundational operation in PCA relies on identifying the eigenvectors and eigenvalues of the data's covariance matrix.
            </p>
            <div className="bg-slate-100 p-6 rounded-lg text-center font-mono my-4">
              Covariance Matrix Calculation: $\Sigma = \frac{1}{n-1} X^T X$
            </div>
            <p className="text-gray-700 leading-relaxed">
              Where $X$ represents the mean-centered data matrix, and $n$ represents the total number of observations.
            </p>
          </section>

          <section id="algorithm">
            <h2 className="text-3xl font-bold mb-4 border-b pb-2">3. Step-by-Step Algorithm</h2>
            <ul className="list-decimal ml-6 space-y-2 text-gray-700">
              <li><strong>Standardization:</strong> Scale the data to ensure all variables contribute equally.</li>
              <li><strong>Covariance Matrix:</strong> Compute the matrix to identify correlations between variables.</li>
              <li><strong>Eigendecomposition:</strong> Calculate the eigenvalues and eigenvectors of the covariance matrix.</li>
              <li><strong>Principal Components:</strong> Sort eigenvectors by descending eigenvalues and project the original data.</li>
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
};

const SimulateView = () => {
  const [inputData, setInputData] = useState("2.5, 2.4\n0.5, 0.7\n2.2, 2.9\n1.9, 2.2\n3.1, 3.0\n2.3, 2.7\n2.0, 1.6\n1.0, 1.1\n1.5, 1.6\n1.1, 0.9");
  const [steps, setSteps] = useState([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [finalResults, setFinalResults] = useState(null);

  const formatMatrix = (matrix) => {
    return matrix.map((row) => row.map((val) => val.toFixed(3)).join(' | ')).join('\n');
  };

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      Papa.parse(file, {
        complete: (results) => {
          const parsed = results.data
            .filter((row) => row.length > 1 && !isNaN(row[0]))
            .map((row) => row.map(Number));
          setInputData(parsed.map((r) => r.join(", ")).join("\n"));
        }
      });
    }
  };

  const downloadResults = () => {
    if (!finalResults) return alert("Please run the simulation first.");
    const csvContent = "data:text/csv;charset=utf-8,PC1,PC2\n" + finalResults.pcData.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "pca_components.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const runSimulation = async () => {
    setIsSimulating(true);
    setSteps([]);
    setFinalResults(null);

    // Parse Data
    const rows = inputData.trim().split('\n');
    const data = rows.map((row) => row.split(',').map(Number));
    const n = data.length;
    const m = data[0].length;

    await sleep(800);
    setSteps((prev) => [...prev, {id: 1, title: "Step 1: Raw Data Ingestion", content: formatMatrix(data)}]);

    // Mean Centering
    await sleep(1200);
    const means = Array(m).fill(0);
    data.forEach((row) => { row.forEach((val, j) => { means[j] += val; }); });
    means.forEach((val, j) => { means[j] /= n; });
    const centeredData = data.map((row) => row.map((val, j) => val - means[j]));
    setSteps((prev) => [...prev, {id: 2, title: "Step 2: Mean Centering (Standardization)", content: formatMatrix(centeredData)}]);

    // Covariance
    await sleep(1200);
    const covMatrix = Array(m).fill(0).map(() => Array(m).fill(0));
    for (let i = 0; i < m; i++) {
      for (let j = 0; j < m; j++) {
        let sum = 0;
        for (let k = 0; k < n; k++) {
          sum += centeredData[k][i] * centeredData[k][j];
        }
        covMatrix[i][j] = sum / (n - 1);
      }
    }
    setSteps((prev) => [...prev, {id: 3, title: "Step 3: Covariance Matrix Computation", content: formatMatrix(covMatrix)}]);

    // Eigendecomposition
    await sleep(1200);
    const eig = numeric.eig(covMatrix);
    const eigenvalues = eig.lambda.x; 
    const eigenvectors = eig.E.x;
    const step4Text = `Eigenvalues:\n${eigenvalues.map((v) => v.toFixed(4)).join(', ')}\n\nEigenvectors:\n${formatMatrix(eigenvectors)}`;
    setSteps((prev) => [...prev, {id: 4, title: "Step 4: Eigendecomposition", content: step4Text}]);

    // Projection
    await sleep(1200);
    const principalComponents = numeric.dot(centeredData, eigenvectors);
    const totalVariance = eigenvalues.reduce((a, b) => a + b, 0);
    const varianceRatio = eigenvalues.map((v) => v / totalVariance);
    
    setSteps((prev) => [...prev, {id: 5, title: "Step 5: Final Projection", content: "Data successfully projected onto Principal Components. Visualizations generating..."}]);
    
    await sleep(800);
    setFinalResults({pcData: principalComponents, varianceData: varianceRatio});
    setIsSimulating(false);
  };

  return (
    <div className="w-full p-6 space-y-8 bg-gray-50 min-h-screen">
      <section className="bg-white p-6 rounded-lg shadow border-t-4 border-emerald-600">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Data Input & Controls</h2>
          <button 
            onClick={downloadResults} 
            className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm transition"
          >
            Download Results (CSV)
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold mb-2">Upload Dataset (.csv file)</label>
            <input 
              type="file" 
              accept=".csv"
              onChange={handleFileUpload} 
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 mb-4" 
            />
            <label className="block text-sm font-semibold mb-2">Or Enter M × N Numerical Data</label>
            <textarea 
              value={inputData} 
              onChange={(e) => setInputData(e.target.value)} 
              rows="5" 
              className="w-full p-3 border rounded font-mono text-sm bg-slate-50"
            />
          </div>
          <div className="flex flex-col justify-center items-center bg-slate-50 p-4 rounded border border-dashed border-slate-300">
            <button 
              onClick={runSimulation} 
              disabled={isSimulating}
              className={`text-white font-bold py-4 px-10 rounded-full shadow-lg transition transform hover:scale-105 ${isSimulating ? 'bg-gray-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-500'}`}
            >
              {isSimulating ? 'Processing Step-by-Step...' : 'Execute Algorithm'}
            </button>
          </div>
        </div>
      </section>

      {steps.length > 0 && (
        <section className="bg-white p-6 rounded-lg shadow border-t-4 border-amber-500">
          <h2 className="text-2xl font-bold mb-4">Live Execution Trace</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {steps.map((step) => (
              <div key={step.id} className="p-4 border rounded bg-slate-50 shadow-sm animate-fade-in">
                <h4 className="font-bold text-sm text-amber-700 border-b pb-2 mb-2">{step.title}</h4>
                <pre className="text-xs overflow-auto h-32 text-gray-800">{step.content}</pre>
              </div>
            ))}
          </div>
        </section>
      )}

      {finalResults && (
        <section className="bg-white p-6 rounded-lg shadow border-t-4 border-indigo-600 animate-fade-in">
          <h2 className="text-2xl font-bold mb-6">Final Output Visualizations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="border rounded p-4 bg-slate-50">
              <h3 className="text-center font-semibold mb-4 text-slate-700">PCA Scatter Plot (PC1 vs PC2)</h3>
              <Scatter 
                data={{
                  datasets: [{
                    label: 'Projected Points',
                    data: finalResults.pcData.map((row) => ({x: row[0], y: row[1] || 0})),
                    backgroundColor: 'rgba(79, 70, 229, 0.6)',
                  }]
                }} 
              />
            </div>
            <div className="border rounded p-4 bg-slate-50">
              <h3 className="text-center font-semibold mb-4 text-slate-700">Explained Variance Ratio</h3>
              <Bar 
                data={{
                  labels: finalResults.varianceData.map((_, i) => `PC${i + 1}`),
                  datasets: [{
                    label: 'Variance Ratio',
                    data: finalResults.varianceData,
                    backgroundColor: 'rgba(16, 185, 129, 0.6)',
                  }]
                }} 
              />
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default function App() {
  const [currentView, setCurrentView] = useState('home');

  const renderView = () => {
    switch(currentView) {
      case 'home': return <HomeView setView={setCurrentView} />;
      case 'learn': return <LearnView />;
      case 'simulate': return <SimulateView />;
      default: return <HomeView setView={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
      <Navbar currentView={currentView} setView={setCurrentView} />
      <div className="flex-grow flex w-full">
        {renderView()}
      </div>
      <style>{`
        .animate-fade-in { animation: fadeIn 0.5s ease-in-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}