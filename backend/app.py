
from flask import Flask, jsonify, request
from flask_cors import CORS

from generator import generate_maze
from algorithms import ALGORITHMS

app = Flask(__name__)
CORS(app)


def find_marker(maze, marker):
    for r, row in enumerate(maze):
        for c, cell in enumerate(row):
            if cell == marker:
                return (r, c)

    return None


@app.get("/api/health")
def health():
    return jsonify({"status": "ok"})


@app.post("/api/maze")
def create_maze():
    data = request.get_json(silent=True) or {}

    rows = data.get("rows", 21)
    cols = data.get("cols", 21)

    try:
        rows = int(rows)
        cols = int(cols)
        maze = generate_maze(rows, cols)
    except (ValueError, TypeError) as error:
        return jsonify({"error": str(error)}), 400

    return jsonify({
        "maze": maze,
        "start": find_marker(maze, "S"),
        "end": find_marker(maze, "E"),
    })


@app.post("/api/solve")
def solve_maze():
    data = request.get_json(silent=True) or {}

    maze = data.get("maze")
    algorithm_name = data.get("algorithm", "bfs").lower()

    if algorithm_name not in ALGORITHMS:
        return jsonify({"error": "Unknown algorithm"}), 400

    if (
        not isinstance(maze, list)
        or not maze
        or not all(isinstance(row, list) for row in maze)
        or not maze[0]
        or any(len(row) != len(maze[0]) for row in maze)
        or any(cell not in ("#", ".", "S", "E")
               for row in maze for cell in row)
    ):
        return jsonify({"error": "Invalid maze"}), 400

    start = find_marker(maze, "S")
    end = find_marker(maze, "E")

    if start is None or end is None:
        return jsonify({
            "error": "Maze must contain both S and E"
        }), 400

    result = ALGORITHMS[algorithm_name](maze, start, end)

    return jsonify(result)


if __name__ == "__main__":
    app.run(debug=True, port=5000)
