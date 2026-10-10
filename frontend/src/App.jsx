
import { useEffect, useMemo, useState } from "react";
import "./App.css";

const API =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api";

const ALGORITHMS = [
  { value: "bfs", label: "BFS", fullName: "Breadth-First Search" },
  { value: "dfs", label: "DFS", fullName: "Depth-First Search" },
  { value: "dijkstra", label: "Dijkstra", fullName: "Dijkstra's Algorithm" },
  { value: "astar", label: "A*", fullName: "A* Search" },
];

const TOOLS = [
  { value: "wall", label: "Place wall" },
  { value: "erase", label: "Erase / normal tile" },
  { value: "start", label: "Move start point" },
  { value: "end", label: "Move destination" },
  { value: "mud", label: "Place mud (cost 3)" },
  { value: "water", label: "Place water (cost 5)" },
];

const GRID_SIZES = [
  { value: 11, label: "Small · 11 × 11" },
  { value: 21, label: "Medium · 21 × 21" },
  { value: 31, label: "Large · 31 × 31" },
  { value: 41, label: "XL · 41 × 41" },
  { value: 51, label: "Huge · 51 × 51" },
];

const ALGORITHM_DESCRIPTIONS = {
  bfs: "BFS explores level by level and finds a path with the fewest steps when every move has equal cost.",
  dfs: "DFS follows one branch deeply before backtracking. It can find a path, but does not guarantee the shortest one.",
  dijkstra: "Dijkstra considers terrain costs and finds a minimum-cost path.",
  astar: "A* combines the cost so far with a distance estimate to guide its search toward the destination.",
};

function App() {
  const [maze, setMaze] = useState([]);
  const [algorithm, setAlgorithm] = useState("bfs");
  const [editMode, setEditMode] = useState("wall");
  const [gridSize, setGridSize] = useState(21);

  const [timeline, setTimeline] = useState([]);
  const [animationIndex, setAnimationIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(20);

  const [stats, setStats] = useState(null);
  const [comparisons, setComparisons] = useState([]);
  const [busy, setBusy] = useState(false);
  const [compareLoading, setCompareLoading] = useState(false);
  const [message, setMessage] = useState(
    "Generate a maze to get started."
  );

  const isAnimating =
    timeline.length > 0 && animationIndex < timeline.length;

  const visibleEvents = useMemo(
    () => timeline.slice(0, animationIndex),
    [timeline, animationIndex]
  );

  const visited = useMemo(() => {
    const cells = new Set();

    for (const event of visibleEvents) {
      if (event.type === "visited") {
        cells.add(`${event.row},${event.col}`);
      }
    }

    return cells;
  }, [visibleEvents]);

  const path = useMemo(() => {
    const cells = new Set();

    for (const event of visibleEvents) {
      if (event.type === "path") {
        cells.add(`${event.row},${event.col}`);
      }
    }

    return cells;
  }, [visibleEvents]);

  // Advance the animation by one event at the selected speed.
  useEffect(() => {
    if (!isPlaying || animationIndex >= timeline.length) {
      return undefined;
    }

    const timer = setTimeout(() => {
      setAnimationIndex((index) =>
        Math.min(index + 1, timeline.length)
      );
    }, speed);

    return () => clearTimeout(timer);
  }, [isPlaying, animationIndex, timeline, speed]);

  // Finish the animation and update the status message.
  useEffect(() => {
    if (!timeline.length || animationIndex < timeline.length) {
      return;
    }

    setIsPlaying(false);

    setMessage(
      stats?.found
        ? "Path found! Try another algorithm or compare all four."
        : "No path found. Try removing some walls."
    );
  }, [animationIndex, timeline.length, stats]);

  function clearRun() {
    setTimeline([]);
    setAnimationIndex(0);
    setIsPlaying(false);
    setStats(null);
    setComparisons([]);
  }

  async function generateMaze() {
    setBusy(true);
    setIsPlaying(false);
    setMessage("Generating maze...");
    clearRun();

    try {
      const response = await fetch(`${API}/maze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rows: gridSize,
          cols: gridSize,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not generate maze.");
      }

      setMaze(data.maze);
      setMessage(
        `Generated a ${gridSize} × ${gridSize} maze. Ready to explore!`
      );
    } catch (error) {
      setMessage(error.message || "Could not connect to the backend.");
    } finally {
      setBusy(false);
    }
  }

  async function solveMaze() {
    if (!maze.length || busy) return;

    setBusy(true);
    setIsPlaying(false);
    clearRun();
    setMessage("Calculating the search...");

    try {
      const response = await fetch(`${API}/solve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ maze, algorithm }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not solve maze.");
      }

      const events = [
        ...data.visited.map(([row, col]) => ({
          type: "visited",
          row,
          col,
        })),
        ...data.path.map(([row, col]) => ({
          type: "path",
          row,
          col,
        })),
      ];

      setStats({
        visited: data.visited.length,
        pathLength: data.path_length,
        totalCost: data.total_cost,
        elapsed: data.elapsed_ms,
        found: data.found,
      });

      setTimeline(events);
      setAnimationIndex(0);
      setIsPlaying(events.length > 0);

      setMessage(
        events.length
          ? "Playing search animation..."
          : "No animation events to display."
      );
    } catch (error) {
      setMessage(error.message || "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  function togglePlayback() {
    if (busy || !timeline.length) return;

    if (animationIndex >= timeline.length) {
      // Play again from the beginning after completion.
      setAnimationIndex(0);
      setIsPlaying(true);
      setMessage("Replaying animation...");
      return;
    }

    setIsPlaying((playing) => !playing);
    setMessage(
      isPlaying ? "Animation paused." : "Animation resumed."
    );
  }

  function stepForward() {
    if (busy || !timeline.length) return;

    setIsPlaying(false);

    setAnimationIndex((index) =>
      Math.min(index + 1, timeline.length)
    );

    setMessage("Stepping through the search...");
  }

  function resetAnimation() {
    if (busy || !timeline.length) return;

    setIsPlaying(false);
    setAnimationIndex(0);
    setMessage("Animation reset. Press Play to replay.");
  }

  function clearSolution() {
    if (busy) return;

    clearRun();
    setMessage("Solution cleared.");
  }

  async function compareAlgorithms() {
    if (!maze.length || busy || compareLoading) return;

    setCompareLoading(true);
    setMessage("Comparing all four algorithms...");

    try {
      const response = await fetch(`${API}/compare`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ maze }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Comparison failed.");
      }

      setComparisons(data.comparisons);
      setMessage("Comparison complete! All algorithms used the same maze.");
    } catch (error) {
      setMessage(error.message || "Could not compare algorithms.");
    } finally {
      setCompareLoading(false);
    }
  }

  function handleCellClick(row, col) {
    if (busy || isAnimating || !maze.length) return;

    const nextMaze = maze.map((line) => [...line]);
    const cell = nextMaze[row][col];

    if (editMode === "start" || editMode === "end") {
      if (cell === "#") return;

      const marker = editMode === "start" ? "S" : "E";

      for (let r = 0; r < nextMaze.length; r++) {
        for (let c = 0; c < nextMaze[r].length; c++) {
          if (nextMaze[r][c] === marker) {
            nextMaze[r][c] = ".";
          }
        }
      }

      nextMaze[row][col] = marker;
    } else {
      if (cell === "S" || cell === "E") return;

      const replacement = {
        wall: "#",
        erase: ".",
        mud: "M",
        water: "W",
      }[editMode];

      nextMaze[row][col] = replacement;
    }

    setMaze(nextMaze);
    clearRun();
    setMessage("Maze edited. Ready to solve again.");
  }

  useEffect(() => {
    generateMaze();
    // Generate the initial maze when the app opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function getCellClass(cell, row, col) {
    const key = `${row},${col}`;
    let className = "maze-cell";

    if (cell === "#") className += " cell-wall";
    if (cell === "M") className += " cell-mud";
    if (cell === "W") className += " cell-water";
    if (visited.has(key)) className += " cell-visited";
    if (path.has(key)) className += " cell-path";
    if (cell === "S") className += " cell-start";
    if (cell === "E") className += " cell-end";

    return className;
  }

  const selectedAlgorithm = ALGORITHMS.find(
    (item) => item.value === algorithm
  );

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">ALGORITHM PLAYGROUND</p>
          <h1>Maze<span>Lab</span></h1>
          <p className="subtitle">
            Build a maze. Visualize the search. Find the path.
          </p>
        </div>

        <div className="header-tag">
          <span className="status-dot" />
          INTERACTIVE VISUALIZER
        </div>
      </header>

      <section className="workspace">
        <aside className="control-panel">
          <p className="section-label">CONTROLS</p>

          <label htmlFor="algorithm">PATHFINDING ALGORITHM</label>
          <select
            id="algorithm"
            value={algorithm}
            onChange={(event) => setAlgorithm(event.target.value)}
            disabled={busy || isAnimating}
          >
            {ALGORITHMS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.fullName}
              </option>
            ))}
          </select>

          <p className="algorithm-description">
            {ALGORITHM_DESCRIPTIONS[algorithm]}
          </p>

          <label htmlFor="grid-size">GRID SIZE</label>
          <select
            id="grid-size"
            value={gridSize}
            onChange={(event) => {
              setGridSize(Number(event.target.value));
              setMessage("Grid size changed. Generate a new maze to apply it.");
            }}
            disabled={busy || isAnimating}
          >
            {GRID_SIZES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>

          <label htmlFor="edit-mode">EDIT MAZE</label>
          <select
            id="edit-mode"
            value={editMode}
            onChange={(event) => setEditMode(event.target.value)}
            disabled={busy || isAnimating}
          >
            {TOOLS.map((tool) => (
              <option key={tool.value} value={tool.value}>
                {tool.label}
              </option>
            ))}
          </select>

          <p className="editor-hint">
            Choose a tool, then click a cell. Editing is paused while an animation is running.
          </p>

          <div className="panel-divider" />

          <label htmlFor="speed">
            ANIMATION SPEED
            <span className="speed-value">{speed} ms</span>
          </label>

          <input
            id="speed"
            type="range"
            min="1"
            max="100"
            value={speed}
            onChange={(event) => setSpeed(Number(event.target.value))}
          />

          <div className="range-labels">
            <span>Fast</span>
            <span>Slow</span>
          </div>

          <div className="panel-divider" />

          <button
            className="primary-button"
            onClick={solveMaze}
            disabled={busy || !maze.length}
          >
            {busy ? "Working..." : "▶  Solve Maze"}
          </button>

          <button
            className="secondary-button"
            onClick={togglePlayback}
            disabled={busy || !timeline.length}
          >
            {isPlaying ? "Ⅱ  Pause" : "▶  Play / Resume"}
          </button>

          <div className="button-row">
            <button
              className="secondary-button"
              onClick={stepForward}
              disabled={busy || !timeline.length || animationIndex >= timeline.length}
            >
              Step →
            </button>

            <button
              className="secondary-button"
              onClick={resetAnimation}
              disabled={busy || !timeline.length}
            >
              Reset
            </button>
          </div>

          <button
            className="secondary-button"
            onClick={generateMaze}
            disabled={busy}
          >
            ↻  Generate New Maze
          </button>

          <button
            className="secondary-button"
            onClick={clearSolution}
            disabled={busy || (!timeline.length && !stats)}
          >
            Clear Solution
          </button>

          <div className="panel-divider" />

          <p className="section-label">COMPARE ALGORITHMS</p>
          <p className="editor-hint">
            Run all four algorithms on the same maze and compare their results.
          </p>

          <button
            className="compare-button"
            onClick={compareAlgorithms}
            disabled={busy || compareLoading || !maze.length}
          >
            {compareLoading ? "Comparing..." : "⇄  Compare All Four"}
          </button>

          <div className="panel-divider" />

          <p className="section-label">LEGEND</p>

          <div className="legend">
            <div><span className="legend-dot start-dot" /> Start</div>
            <div><span className="legend-dot end-dot" /> Destination</div>
            <div><span className="legend-dot wall-dot" /> Wall</div>
            <div><span className="legend-dot visited-dot" /> Explored</div>
            <div><span className="legend-dot path-dot" /> Final path</div>
            <div><span className="legend-dot mud-dot" /> Mud · cost 3</div>
            <div><span className="legend-dot water-dot" /> Water · cost 5</div>
          </div>
        </aside>

        <section className="visualization-panel">
          <div className="maze-heading">
            <div>
              <p className="section-label">LIVE VISUALIZATION</p>
              <h2>Your maze</h2>
            </div>

            <span className="grid-badge">
              {maze.length
                ? `${maze.length} × ${maze[0].length}`
                : "Loading..."}
            </span>
          </div>

          <div className="maze-container">
            {maze.length > 0 && (
              <div
                className="maze-grid"
                style={{
                  gridTemplateColumns: `repeat(${maze[0].length}, minmax(0, 1fr))`,
                }}
              >
                {maze.map((line, row) =>
                  line.map((cell, col) => (
                    <button
                      key={`${row}-${col}`}
                      type="button"
                      aria-label={`Row ${row + 1}, column ${col + 1}: ${cell}`}
                      title={`(${row}, ${col}) — ${cell}`}
                      className={getCellClass(cell, row, col)}
                      onClick={() => handleCellClick(row, col)}
                      disabled={busy || isAnimating}
                    >
                      {cell === "S" && "S"}
                      {cell === "E" && "E"}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <p className="status-message">
            <span className="status-dot" />
            {message}
          </p>

          {timeline.length > 0 && (
            <div className="progress-section">
              <div className="progress-labels">
                <span>ANIMATION PROGRESS</span>
                <span>
                  {animationIndex.toLocaleString()} / {timeline.length.toLocaleString()}
                </span>
              </div>

              <div
                className="progress-track"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={timeline.length}
                aria-valuenow={animationIndex}
              >
                <div
                  className="progress-fill"
                  style={{
                    width: `${(animationIndex / timeline.length) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}

          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-label">CELLS EXPLORED</span>
              <strong>{stats ? stats.visited : "—"}</strong>
            </div>

            <div className="stat-card">
              <span className="stat-label">PATH LENGTH</span>
              <strong>{stats && stats.found ? stats.pathLength : "—"}</strong>
            </div>

            <div className="stat-card">
              <span className="stat-label">PATH COST</span>
              <strong>{stats && stats.found ? stats.totalCost : "—"}</strong>
            </div>

            <div className="stat-card">
              <span className="stat-label">SOLVE TIME</span>
              <strong>{stats ? `${stats.elapsed} ms` : "—"}</strong>
            </div>
          </div>

          {stats && (
            <p className="result-note">
              {selectedAlgorithm?.fullName}:{" "}
              {stats.found
                ? `found a path in ${stats.pathLength} steps with total cost ${stats.totalCost}.`
                : "could not find a path."}
            </p>
          )}
        </section>
      </section>

      {comparisons.length > 0 && (
        <section className="comparison-panel">
          <div className="comparison-heading">
            <div>
              <p className="section-label">BENCHMARK RESULTS</p>
              <h2>Algorithm showdown</h2>
              <p className="comparison-subtitle">
                Same maze, same start and destination. Lower path cost and fewer explored cells can be useful, depending on your goal.
              </p>
            </div>

            <button
              className="secondary-button refresh-comparison"
              onClick={compareAlgorithms}
              disabled={compareLoading || busy}
            >
              {compareLoading ? "Running..." : "↻ Run again"}
            </button>
          </div>

          <div className="table-scroll">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Algorithm</th>
                  <th>Found?</th>
                  <th>Explored</th>
                  <th>Path length</th>
                  <th>Path cost</th>
                  <th>Time (ms)</th>
                </tr>
              </thead>

              <tbody>
                {comparisons.map((item) => (
                  <tr key={item.algorithm}>
                    <td>
                      <strong>
                        {ALGORITHMS.find(
                          (algorithmItem) =>
                            algorithmItem.value === item.algorithm
                        )?.label || item.algorithm}
                      </strong>
                    </td>
                    <td>
                      <span className={item.found ? "result-yes" : "result-no"}>
                        {item.found ? "Yes" : "No"}
                      </span>
                    </td>
                    <td>{item.visited_count}</td>
                    <td>{item.found ? item.path_length : "—"}</td>
                    <td>{item.found ? item.total_cost : "—"}</td>
                    <td>{item.elapsed_ms}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="comparison-footnote">
            Execution time varies between runs and depends on your computer. For a fairer timing comparison, run the benchmark several times. BFS optimizes steps on equal-cost grids; Dijkstra and A* optimize terrain cost.
          </p>
        </section>
      )}

      <footer className="app-footer">
        MAZELAB <span>·</span> BUILT TO EXPLORE ALGORITHMS
      </footer>
    </main>
  );
}

export default App;
