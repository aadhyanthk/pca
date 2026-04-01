# PCA Interactive: A Visual Deep-Dive

**Learn Principal Component Analysis through a guided curriculum, watch the pipeline unfold step by step, and export full numerical results to CSV—no black-box ML library required.**

[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-000000?style=for-the-badge&logo=vercel)](https://YOUR_VERCEL_DEPLOYMENT.vercel.app)
[![GitHub](https://img.shields.io/badge/Source_Code-GitHub-181717?style=for-the-badge&logo=github)](https://github.com/aadhyanthk/pca)
[![Build](https://img.shields.io/badge/build-npm%20run%20build-success?style=for-the-badge&logo=vite)](https://github.com/aadhyanthk/pca)

---

## Interactive features overview

PCA Educator is a single-page experience with a bottom navigation bar. Highlights:

| Area | What you get |
|------|----------------|
| **Learn** | Full in-app syllabus: intro, key concepts, objectives, PCA steps, worked examples, scree plots, reconstruction, assumptions, applications, and wrap-up—with sidebar jump links. |
| **Step-by-step simulation** | Paste or upload CSV data, run **Start Simulation**, and watch timed reveals: parsed data → z-score standardization → covariance matrix → eigen-decomposition → explained-variance bar chart → **PC1/PC2** projection with scatter plot. |
| **CSV export** | After the final step, **Download Exact PCA_Result.csv** builds a grid (raw data, standardized matrix, covariance, eigenvalues/vectors, variance ratios, short annotations) and triggers a browser download. |

---

## The algorithm (the math)

Implementation lives in a **native JavaScript PCA engine** (no scikit-learn-style PCA call):

1. **Standardization (z-scores)**  
   For each numeric column: subtract the sample mean and divide by the sample standard deviation (with a safe fallback when variance is zero so division stays stable).

2. **Covariance matrix**  
   Built from standardized data using the usual \(n-1\) denominator so the matrix matches standard textbook PCA on correlations when variables are z-scored.

3. **Eigenpairs via the Jacobi eigenvalue method**  
   The symmetric covariance matrix is diagonalized with **Jacobi rotations**: repeatedly choose the largest off-diagonal entry, apply a plane rotation to zero it (up to tolerance), update the accumulating eigenvector matrix, and stop when off-diagonal mass falls below a small threshold or iteration budget is reached. Eigenvalues are sorted descending; **explained variance** is each \(\lambda_i / \sum_j \lambda_j\).

4. **Projection**  
   Data are projected onto the top two eigenvectors as **PC1** and **PC2** for tables and charts.

This pipeline matches what you teach in the **Learn** tab and what the **Simulate** tab reveals incrementally.

---

## Tech stack and architecture

**Built with**

| Layer | Choice |
|--------|--------|
| UI | [React 19](https://react.dev/) |
| Tooling | [Vite 8](https://vitejs.dev/) |
| Icons | [Lucide React](https://lucide.dev/) |
| Styling | **CSS3** (`App.css`—layout, components, learn/simulate themes) |
| Charts | Custom **SVG** bar and scatter visualizations inside the app |

**Architecture note — routing**

Navigation is **state-based**, not URL-based: `currentPage` in the root component (`'home' | 'learn' | 'simulate' | 'about'`) drives a `switch` that renders the active view. There is no React Router dependency; deep-linking to tabs would be a natural future upgrade.

**Repository layout (essentials)**

- `src/App.jsx` — PCA engine, pages (Home, Learn, Simulate, About), navbar, visualization helpers  
- `src/main.jsx` — React root mount  
- `src/App.css` — global and feature styles  
- `vite.config.js` — Vite configuration  

Dependencies such as `chart.js`, `react-chartjs-2`, `papaparse`, and `numeric` are listed in `package.json`; the current UI relies on the inline engine and native CSV handling. They are available if you extend the app (richer charts, streaming parse, etc.).

---

## Local setup and installation

Prerequisites: **[Node.js](https://nodejs.org/)** (LTS recommended; includes `npm`).

```bash
git clone https://github.com/aadhyanthk/pca.git
cd pca
npm install
npm run dev
```

Then open the URL Vite prints (typically `http://localhost:5173`).

Other scripts:

```bash
npm run build    # production bundle
npm run preview  # serve the production build locally
npm run lint     # ESLint
```

---

## Project members and contributors

| Name | ID | Role |
|------|-----|------|
| Aadhyanth K | 24BYB1098 | Lead developer & repository owner |
| Guhan PC | 24BYB1052 | Full-stack / UI implementation |
| SS Kishore Kumar | 24BYB1007 | Content & Learn curriculum |
| Niranjan N | 24BYB1111 | Math logic & simulation QA |

---

## Challenges and learning outcomes

- **Numeric stability and scale** — PCA is sensitive to feature scale; implementing explicit z-score standardization made the covariance interpretation align with teaching and kept eigenvalues meaningful.  
- **Eigen-decomposition in the browser** — Jacobi iterations run synchronously inside `performPCA`; the **step-by-step simulation** uses timed UI steps so users see a paced walkthrough even though the full computation completes in one shot when simulation starts. A heavier extension would chunk work with `requestAnimationFrame` or a Web Worker for very large matrices.  
- **Export correctness** — The CSV export lays out multiple blocks (raw, standardized, covariance, eigen-system, variance ratios) in one sheet-style grid so instructors and students can verify numbers in Excel or Python.

---

## Future roadmap

- **Persistence** — Integrate **Firebase** (or similar) for saved datasets, user progress through the Learn syllabus, or shareable simulation links.  
- **3D visualization** — When retaining **three** principal components, add an interactive **3D scatter** (e.g. three.js or WebGL) for PC1–PC3 space.  
- **URL routing** — Adopt React Router (or Vite-aware equivalents) for `/learn`, `/simulate`, and shareable anchors.  
- **CI/CD** — GitHub Actions running `npm run build` on every push; Vercel preview deployments per PR.

---

## License

Add a `LICENSE` file if you want a formal open-source terms (e.g. MIT). Until then, treat usage as defined by your course or team policy.
