
# MazeLab 🧩

An interactive pathfinding visualizer built with React and Flask. Generate random mazes, customize obstacles and terrain, watch search algorithms explore the grid, and compare their results.

## ✨ Features

- **Four pathfinding algorithms:** BFS, DFS, Dijkstra's algorithm, and A*
- **Random maze generation:** Create mazes in multiple grid sizes
- **Interactive maze editor:** Place walls, move the start and destination, and erase cells
- **Weighted terrain:** Add mud and water with different traversal costs
- **Animated visualization:** Watch explored cells and the final path appear
- **Playback controls:** Pause, resume, reset, and step through the animation
- **Algorithm benchmarking:** Compare explored cells, path length, path cost, and execution time
- **Responsive UI:** Dark theme with a green accent

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React, JavaScript, CSS, Vite |
| Backend | Python, Flask |
| API | REST endpoints, JSON |
| Cross-origin requests | Flask-CORS |
| Algorithms | BFS, DFS, Dijkstra, A* |
| Version control | Git and GitHub |

## 🧠 Algorithms

| Algorithm | Search strategy | Optimality |
|---|---|---|
| BFS | Explores level by level | Minimum number of steps when all moves have equal cost |
| DFS | Explores a branch deeply before backtracking | Does not guarantee an optimal path |
| Dijkstra | Expands the lowest accumulated-cost node | Minimum-cost path for non-negative terrain costs |
| A* | Combines accumulated cost with a heuristic | Minimum-cost path with the admissible Manhattan heuristic used here |

MazeLab uses a traversal cost of 1 for normal cells, 3 for mud, and 5 for water. BFS and DFS do not optimize weighted terrain costs; Dijkstra and A* do.

## 📁 Project Structure

```text
maze-lab/
├── backend/
│   ├── app.py
│   ├── algorithms.py
│   ├── generator.py
│   ├── requirements.txt
│   └── venv/                 # Local virtual environment; not committed
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── index.css
│   ├── package.json
│   └── ...
├── .gitignore
└── README.md
```

## 🚀 Run Locally

### Prerequisites

- Python 3
- Node.js and npm
- Git

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd maze-lab
```

Replace `YOUR_GITHUB_REPOSITORY_URL` with your repository's actual URL.

### 2. Set up the backend

Open a terminal in the project directory:

```bash
cd backend
python -m venv venv
```

Activate the environment.

**Windows PowerShell:**

```powershell
.\venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start Flask:

```bash
python app.py
```

The backend runs at `http://127.0.0.1:5000`.

### 3. Set up the frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

Keep both terminals running while using the application.

## 🔌 API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Check backend availability |
| POST | `/api/maze` | Generate a maze |
| POST | `/api/solve` | Solve a maze using a selected algorithm |
| POST | `/api/compare` | Compare all four algorithms |

## 📊 Benchmark Metrics

MazeLab compares:

- **Explored cells:** Number of nodes expanded by the algorithm
- **Path length:** Number of steps in the resulting path
- **Path cost:** Sum of traversal costs along the path, excluding the start cell
- **Execution time:** Time spent running the algorithm on the backend

Execution time varies with the machine and workload. For meaningful comparisons, run multiple trials on the same maze.

## 🔮 Future Improvements

- Public deployment
- More maze-generation algorithms
- Additional heuristic visualizations
- Exportable benchmark results
- Automated tests for algorithms and API endpoints

## 👩‍💻 Author

Built as a hands-on project to explore data structures, graph traversal, shortest-path algorithms, and full-stack development.

---

If you find this project interesting, consider starring the repository!
