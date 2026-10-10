
import heapq
from collections import deque


def get_neighbors(maze, row, col):
    rows = len(maze)
    cols = len(maze[0])

    directions = [(-1, 0), (0, -1), (0, 1), (1, 0)]
    neighbors = []

    for dr, dc in directions:
        nr, nc = row + dr, col + dc

        if (
            0 <= nr < rows
            and 0 <= nc < cols
            and maze[nr][nc] != "#"
        ):
            neighbors.append((nr, nc))

    return neighbors


def reconstruct_path(parent, end):
    if end not in parent:
        return []

    path = []
    current = end

    while current is not None:
        path.append(current)
        current = parent[current]

    return path[::-1]


def bfs(maze, start, end):
    queue = deque([start])
    parent = {start: None}
    visited = {start}
    order = []

    while queue:
        current = queue.popleft()
        order.append(current)

        if current == end:
            break

        for neighbor in get_neighbors(maze, *current):
            if neighbor not in visited:
                visited.add(neighbor)
                parent[neighbor] = current
                queue.append(neighbor)

    path = reconstruct_path(parent, end)

    return {
        "path": path,
        "visited": order,
        "found": bool(path),
    }


def dfs(maze, start, end):
    stack = [start]
    parent = {start: None}
    visited = {start}
    order = []

    while stack:
        current = stack.pop()
        order.append(current)

        if current == end:
            break

        for neighbor in get_neighbors(maze, *current):
            if neighbor not in visited:
                visited.add(neighbor)
                parent[neighbor] = current
                stack.append(neighbor)

    path = reconstruct_path(parent, end)

    return {
        "path": path,
        "visited": order,
        "found": bool(path),
    }


def dijkstra(maze, start, end):
    pq = [(0, start)]
    distance = {start: 0}
    parent = {start: None}
    settled = set()
    order = []

    while pq:
        current_distance, current = heapq.heappop(pq)

        if current in settled:
            continue

        settled.add(current)
        order.append(current)

        if current == end:
            break

        for neighbor in get_neighbors(maze, *current):
            if neighbor in settled:
                continue

            new_distance = current_distance + 1

            if new_distance < distance.get(neighbor, float("inf")):
                distance[neighbor] = new_distance
                parent[neighbor] = current
                heapq.heappush(pq, (new_distance, neighbor))

    path = reconstruct_path(parent, end)

    return {
        "path": path,
        "visited": order,
        "found": bool(path),
    }


def heuristic(a, b):
    # Manhattan distance: only up, down, left and right moves.
    return abs(a[0] - b[0]) + abs(a[1] - b[1])


def astar(maze, start, end):
    pq = [(heuristic(start, end), 0, start)]
    distance = {start: 0}
    parent = {start: None}
    closed = set()
    order = []

    while pq:
        _, current_distance, current = heapq.heappop(pq)

        if current in closed:
            continue

        closed.add(current)
        order.append(current)

        if current == end:
            break

        for neighbor in get_neighbors(maze, *current):
            if neighbor in closed:
                continue

            new_distance = current_distance + 1

            if new_distance < distance.get(neighbor, float("inf")):
                distance[neighbor] = new_distance
                parent[neighbor] = current

                priority = new_distance + heuristic(neighbor, end)

                heapq.heappush(
                    pq, (priority, new_distance, neighbor)
                )

    path = reconstruct_path(parent, end)

    return {
        "path": path,
        "visited": order,
        "found": bool(path),
    }


ALGORITHMS = {
    "bfs": bfs,
    "dfs": dfs,
    "dijkstra": dijkstra,
    "astar": astar,
}
