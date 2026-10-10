
import { useEffect, useRef, useState } from "react";
import "./App.css";

const API = "http://127.0.0.1:5000/api";

const ALGORITHMS = [
  { value: "bfs", label: "Breadth-First Search" },
  { value: "dfs", label: "Depth-First Search" },
  { value: "dijkstra", label: "Dijkstra's Algorithm" },
  { value: "astar", label: "A* Search" },
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default function App() {
  const [maze, setMaze] = useState([]);
  const [algorithm, setAlgorithm] = useState("astar");
  const [speed, setSpeed] = useState(12);
  const [visited, setVisited] = useState(new Set());
  const [path, setPath] = useState(new Set());
  const [stats, setStats] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("Generate a maze to get started.");

  const runId = useRef(0);

  async function generateMaze() {
    runId.current += 1;
    setBusy(true);
    setMessage("Generating maze...");
    setVisited(new Set());
    setPath(new Set());
    setStats(null);

    try {
      const response = await fetch(`${API}/maze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: 21, cols: 21 }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not generate maze.");

      setMaze(data.maze);
      setMessage("Maze ready. Choose an algorithm and solve it.");
    } catch (error) {
      setMessage(`Error: ${error.message}. Is Flask running?`);
    } finally {
      setBusy(false);
    }
  }

  async function solveMaze() {
    if (!maze.length || busy) return;

    const thisRun = ++runId.current;
    setBusy(true);
    setVisited(new Set());
    setPath(new Set());
    setStats(null);
    setMessage("Searching...");

    const started = performance.now();

    try {
      const response = await fetch(`${API}/solve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ maze, algorithm }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not solve maze.");

      const visitedCells = new Set();

      for (const [index, cell] of data.visited.entries()) {
        if (thisRun !== runId.current) return;

        visitedCells.add(`${cell[0]},${cell[1]}`);
        setVisited(new Set(visitedCells));

        if (index % 5 === 0) await sleep(speed);
      }

      const pathCells = new Set();

      for (const [index, cell] of data.path.entries()) {
        if (thisRun !== runId.current) return;

        pathCells.add(`${cell[0]},${cell[1]}`);
        setPath(new Set(pathCells));

        if (index % 2 === 0) await sleep(speed);
      }

      setStats({
        visited: data.visited.length,
        pathLength: data.found ? Math.max(0, data.path.length - 1) : 0,
        elapsed: (performance.now() - started).toFixed(2),
        found: data.found,
      });

      setMessage(
        data.found
          ? "Destination reached!"
          : "No path found to the destination."
      );
    } catch (error) {
      if (thisRun === runId.current) {
        setMessage(`Error: ${error.message}. Is Flask running?`);
      }
    } finally {
      if (thisRun === runId.current) setBusy(false);
    }
  }

  function clearSolution() {
    if (busy) return;

    setVisited(new Set());
    setPath(new Set());
    setStats(null);
    setMessage("Solution cleared. Ready to solve again.");
  }

  useEffect(() => {
    generateMaze();
    // Generate the initial maze when the application loads.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top">
          <span className="brand-icon">⌘</span>
          <span>maze<span className="brand-accent">lab</span></span>
        </a>
        <span className="topbar-tag">PATHFINDING PLAYGROUND</span>
      </header>

      <section className="hero" id="top">
        <div className="eyebrow"><span /> INTERACTIVE ALGORITHM VISUALIZER</div>
        <h1>Find your way<span className="heading-accent">.</span></h1>
        <p>
          Generate a maze. Pick an algorithm. Watch how it thinks.
        </p>
      </section>

      <section className="workspace">
        <aside className="control-panel">
          <div className="panel-heading">
            <span className="section-number">01</span>
            <h2>Configure</h2>
          </div>

          <label htmlFor="algorithm">PATHFINDING ALGORITHM</label>
          <select
            id="algorithm"
            value={algorithm}
            onChange={(event) => setAlgorithm(event.target.value)}
            disabled={busy}
          >
            {ALGORITHMS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>

          <div className="control-divider" />

          <div className="speed-heading">
            <label htmlFor="speed">ANIMATION SPEED</label>
            <span>{speed} ms</span>
          </div>
          <input
            id="speed"
            type="range"
            min="1"
            max="60"
            value={speed}
            onChange={(event) => setSpeed(Number(event.target.value))}
          />
          <div className="range-labels">
            <span>FAST</span><span>SLOW</span>
          </div>

          <div className="control-divider" />

          <div className="legend">
            <div><span className="legend-dot start-dot" /> Start</div>
            <div><span className="legend-dot end-dot" /> Destination</div>
            <div><span className="legend-dot visited-dot" /> Explored</div>
            <div><span className="legend-dot path-dot" /> Final path</div>
            <div><span className="legend-dot wall-dot" /> Wall</div>
          </div>

          <div className="button-stack">
            <button className="button-primary" onClick={solveMaze}
              disabled={busy || !maze.length}>
              <span>▶</span> Solve maze
            </button>
            <button className="button-secondary" onClick={generateMaze}
              disabled={busy}>
              ↻ Generate new maze
            </button>
            <button className="button-quiet" onClick={clearSolution}
              disabled={busy || !maze.length}>
              Clear solution
            </button>
          </div>
        </aside>

        <section className="maze-panel">
          <div className="maze-panel-header">
            <div>
              <div className="panel-heading">
                <span className="section-number">02</span>
                <h2>The maze</h2>
              </div>
              <p className="maze-subtitle">21 × 21 GRID</p>
            </div>
            <span className={`status-pill ${busy ? "status-running" : ""}`}>
              <span /> {busy ? "RUNNING" : "READY"}
            </span>
          </div>

          <div className="maze-wrap">
            {maze.length ? (
              <div
                className="maze-grid"
                style={{ gridTemplateColumns: `repeat(${maze[0].length}, 1fr)` }}
              >
                {maze.map((row, r) =>
                  row.map((cell, c) => {
                    const key = `${r},${c}`;
                    const isPath = path.has(key);
                    const isVisited = visited.has(key);

                    let className = "cell";
                    if (cell === "#") className += " cell-wall";
                    else className += " cell-open";

                    if (isVisited) className += " cell-visited";
                    if (isPath) className += " cell-path";
                    if (cell === "S") className += " cell-start";
                    if (cell === "E") className += " cell-end";

                    return (
                      <div
                        key={key}
                        className={className}
                        title={`Row ${r}, column ${c}`}
                      >
                        {(cell === "S" || cell === "E") && cell}
                      </div>
                    );
                  })
                )}
              </div>
            ) : (
              <div className="empty-state">Preparing your maze...</div>
            )}
          </div>

          <div className="maze-footer">
            <span className="status-indicator" />
            <span>{message}</span>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-label">NODES EXPLORED</span>
              <strong>{stats?.visited ?? "—"}</strong>
            </div>
            <div className="stat-card">
              <span className="stat-label">PATH LENGTH</span>
              <strong>{stats ? stats.pathLength : "—"}</strong>
              <span className="stat-unit">steps</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">ELAPSED TIME</span>
              <strong>{stats?.elapsed ?? "—"}</strong>
              {stats && <span className="stat-unit">ms</span>}
            </div>
          </div>
        </section>
      </section>

      <footer className="footer">
        <span>MADE TO EXPLORE · BUILT WITH PYTHON + REACT</span>
        <span>MAZE LAB © 2026</span>
      </footer>
    </main>
  );
}
