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

def dijkstra(start, end):
    pq = [(0, start)]
    distance = {start:0}
    parent = {start:None}

    while pq:

        current_distance, current = heapq.heappop(pq)

        if current == end:
            break

        for neighbor in get_neighbors(current[0], current[1]):
            new_distance = current_distance + 1
            if neighbor not in distance or new_distance < current_distance:
                distance[neighbor] = new_distance
                parent[neighbor] = current 

                heapq.heappush(pq, (new_distance, neighbor))

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
print(dijkstra((0,0), end))

