import heapq

def get_neighbors(row, col):
    n = [(row-1, col), #upper
         (row,  col-1), #left
         (row, col+1), #right
         (row+1, col) #down
         ]
    neighbors = []
    for i in n:
        if 0 <= i[0] < len(maze) and 0 <= i[1] < len(maze[0]) and maze[i[0]][i[1]] != "#" :
            neighbors.append(i)

    return neighbors

def heuristic(a, b):
    return abs(a[0] - b[0]) + abs(a[1] - b[1])


def astar(start, end):

    pq = [(0, start)]
    distance = {start:0}
    parent = {start:None}

    while pq:
        _, current = heapq.heappop(pq)

        if current == end:
            break
        for neighbor in get_neighbors(current[0], current[1]):
            new_distance = distance[current] + 1
            if neighbor not in distance or new_distance < distance[neighbor]:
                distance[neighbor] = new_distance
                parent[neighbor] = current
                priority = new_distance + heuristic(neighbor, end)
                heapq.heappush(pq, (priority, neighbor))

    if end not in parent:
        return []

    path = []
    current = end
    while current is not None:
        path.append(current)
        current = parent[current]
    path.reverse()
    return path


maze = [
    ['S', '.', '.', '#', '.'],
    ['#', '.', '#', '.', '.'],
    ['.', '.', '.', '.', '#'],
    ['.', '#', '#', '.', 'E']
]

for i in maze:
    print(i)

end = (3, 4)
print(astar((0,0), end))