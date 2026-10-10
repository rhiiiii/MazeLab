
import heapq
from collections import deque


TERRAIN_COST = {
    ".": 1,
    "S": 1,
    "E": 1,
    "M": 3,
    "W": 5,
}


def get_neighbors(maze, row, col):
    rows = len(maze)
    cols = len(maze[0])

    directions = [
        (-1, 0),
        (0, -1),
        (0, 1),
        (1, 0),
    ]

    neighbors = []

    for dr, dc in directions:
        nr = row + dr
        nc = col + dc

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


def make_result(maze, path, order):
    total_cost = sum(
        TERRAIN_COST[maze[r][c]]
        for r, c in path[1:]
    )

    return {
        "path": path,
        "visited": order,
        "found": bool(path),
        "path_length": max(0, len(path) - 1),
        "total_cost": total_cost if path else None,
    }


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
    return make_result(maze, path, order)


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
    return make_result(maze, path, order)


def dijkstra(maze, start, end):
    priority_queue = [(0, start)]
    distance = {start: 0}
    parent = {start: None}
    settled = set()
    order = []

    while priority_queue:
        current_distance, current = heapq.heappop(
            priority_queue
        )

        if current in settled:
            continue

        settled.add(current)
        order.append(current)

        if current == end:
            break

        for neighbor in get_neighbors(maze, *current):
            if neighbor in settled:
                continue

            r, c = neighbor
            new_distance = (
                current_distance + TERRAIN_COST[maze[r][c]]
            )

            if new_distance < distance.get(
                neighbor, float("inf")
            ):
                distance[neighbor] = new_distance
                parent[neighbor] = current

                heapq.heappush(
                    priority_queue,
                    (new_distance, neighbor),
                )

    path = reconstruct_path(parent, end)
    return make_result(maze, path, order)


def heuristic(a, b):
    return abs(a[0] - b[0]) + abs(a[1] - b[1])


def astar(maze, start, end):
    priority_queue = [
        (heuristic(start, end), 0, start)
    ]

    distance = {start: 0}
    parent = {start: None}
    settled = set()
    order = []

    while priority_queue:
        _, current_distance, current = heapq.heappop(
            priority_queue
        )

        if current in settled:
            continue

        settled.add(current)
        order.append(current)

        if current == end:
            break

        for neighbor in get_neighbors(maze, *current):
            if neighbor in settled:
                continue

            r, c = neighbor
            new_distance = (
                current_distance + TERRAIN_COST[maze[r][c]]
            )

            if new_distance < distance.get(
                neighbor, float("inf")
            ):
                distance[neighbor] = new_distance
                parent[neighbor] = current

                priority = (
                    new_distance + heuristic(neighbor, end)
                )

                heapq.heappush(
                    priority_queue,
                    (priority, new_distance, neighbor),
                )

    path = reconstruct_path(parent, end)
    return make_result(maze, path, order)


ALGORITHMS = {
    "bfs": bfs,
    "dfs": dfs,
    "dijkstra": dijkstra,
    "astar": astar,
}
