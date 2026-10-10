from generator import generate_maze
from algorithms import bfs

maze = generate_maze(11, 11)

start = (1, 1)
end = (9, 9)

result = bfs(maze, start, end)

print("Found:", result["found"])
print("Path length:", len(result["path"]))
print("Visited cells:", len(result["visited"]))

for row in maze:
    print(" ".join(row))