
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

def bfs(start, end):
    queue = [start]
    visited = {start}
    parent = {start: None}


    while queue:
        current = queue.pop(0)
        print("Exploring", current)
        if current == end:
            break

        for neighbor in get_neighbors(current[0], current[1]):
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
                parent[neighbor] = current 
        #reconstruct path
    if end not in parent:
        return []
    path = []
    current = end
    while current is not None:
        path.append(current)
        current = parent[current]
    path.reverse()
    return path


def dfs(start, end):

    stack = [start]
    visited = {start}
    parent = {start:None}

    while stack:

        current = stack.pop()
        print("Exploring", current)

        if current == end:
            break

        for neighbor in get_neighbors(current[0], current[1]):
            if neighbor not in visited: 
                visited.add(neighbor)
                stack.append(neighbor)
                parent[neighbor] = current 
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
print(bfs((0,0), end))
print(dfs((0,0), end))
