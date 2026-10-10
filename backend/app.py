
from flask import Flask, jsonify, request
from flask_cors import CORS
from time import perf_counter

from generator import generate_maze
from algorithms import ALGORITHMS


app = Flask(__name__)
CORS(app)


def find_marker(maze, marker):
    for row in range(len(maze)):
        for col in range(len(maze[row])):
            if maze[row][col] == marker:
                return (row, col)

    return None


def validate_maze(maze):
    if not isinstance(maze, list) or not maze:
        return False

    if not all(isinstance(row, list) for row in maze):
        return False

    cols = len(maze[0])

    if cols == 0 or not all(len(row) == cols for row in maze):
        return False

    allowed_cells = {"#", ".", "S", "E", "M", "W"}

    if any(
        cell not in allowed_cells
        for row in maze
        for cell in row
    ):
        return False

    starts = sum(row.count("S") for row in maze)
    ends = sum(row.count("E") for row in maze)

    return starts == 1 and ends == 1


def run_algorithm(maze, algorithm_name, start, end):
    started = perf_counter()

    result = ALGORITHMS[algorithm_name](maze, start, end)

    elapsed_ms = round(
        (perf_counter() - started) * 1000,
        3,
    )

    return result, elapsed_ms


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


@app.route("/api/maze", methods=["POST"])
def create_maze():
    data = request.get_json(silent=True) or {}

    rows = data.get("rows", 21)
    cols = data.get("cols", 21)

    if (
        not isinstance(rows, int)
        or isinstance(rows, bool)
        or not isinstance(cols, int)
        or isinstance(cols, bool)
    ):
        return jsonify({
            "error": "Rows and columns must be integers."
        }), 400

    if (
        rows < 5 or cols < 5
        or rows > 51 or cols > 51
        or rows % 2 == 0 or cols % 2 == 0
    ):
        return jsonify({
            "error": (
                "Rows and columns must be odd numbers "
                "between 5 and 51."
            )
        }), 400

    maze = generate_maze(rows, cols)

    return jsonify({"maze": maze})


@app.route("/api/solve", methods=["POST"])
def solve_maze():
    data = request.get_json(silent=True) or {}

    maze = data.get("maze")
    algorithm_name = data.get("algorithm", "bfs")

    if not validate_maze(maze):
        return jsonify({
            "error": (
                "Invalid maze. It must contain exactly "
                "one start and one destination."
            )
        }), 400

    if algorithm_name not in ALGORITHMS:
        return jsonify({"error": "Unknown algorithm."}), 400

    start = find_marker(maze, "S")
    end = find_marker(maze, "E")

    result, elapsed_ms = run_algorithm(
        maze, algorithm_name, start, end
    )

    result["elapsed_ms"] = elapsed_ms

    return jsonify(result)


@app.route("/api/compare", methods=["POST"])
def compare_algorithms():
    data = request.get_json(silent=True) or {}
    maze = data.get("maze")

    if not validate_maze(maze):
        return jsonify({
            "error": (
                "Invalid maze. It must contain exactly "
                "one start and one destination."
            )
        }), 400

    start = find_marker(maze, "S")
    end = find_marker(maze, "E")

    comparisons = []

    for name, algorithm_function in ALGORITHMS.items():
        result, elapsed_ms = run_algorithm(
            maze, name, start, end
        )

        comparisons.append({
            "algorithm": name,
            "found": result["found"],
            "visited_count": len(result["visited"]),
            "path_length": result["path_length"],
            "total_cost": result["total_cost"],
            "elapsed_ms": elapsed_ms,
        })

    return jsonify({"comparisons": comparisons})


if __name__ == "__main__":
    app.run(debug=True, port=5000)
