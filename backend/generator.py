
import random


def generate_maze(rows=21, cols=21):
    # Keep dimensions odd for this generation algorithm.
    if rows < 5 or cols < 5 or rows % 2 == 0 or cols % 2 == 0:
        raise ValueError("Rows and columns must be odd numbers of at least 5.")

    maze = [["#" for _ in range(cols)] for _ in range(rows)]

    def carve(row, col):
        maze[row][col] = "."

        directions = [(-2, 0), (2, 0), (0, -2), (0, 2)]
        random.shuffle(directions)

        for dr, dc in directions:
            new_row = row + dr
            new_col = col + dc

            if (
                1 <= new_row < rows - 1
                and 1 <= new_col < cols - 1
                and maze[new_row][new_col] == "#"
            ):
                wall_row = row + dr // 2
                wall_col = col + dc // 2

                maze[wall_row][wall_col] = "."
                carve(new_row, new_col)

    carve(1, 1)

    maze[1][1] = "S"
    maze[rows - 2][cols - 2] = "E"

    return maze
