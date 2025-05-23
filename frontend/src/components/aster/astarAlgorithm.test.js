import { aStarSearch, TERRAIN_WEIGHTS } from './astarAlgorithm';

// Helper to convert {row, col} start/goal to {x, y} for the algorithm
const formatCoords = (coords) => ({ x: coords.col, y: coords.row });

describe('aStarSearch', () => {
    // Test Scenario 1: Simple Path
    it('should find a simple path in a clear grid', () => {
        const gridData = [
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0]
        ];
        const start = { row: 0, col: 0 };
        const goal = { row: 2, col: 2 };
        const { path } = aStarSearch(gridData, formatCoords(start), formatCoords(goal));
        
        // Expected path could be one of several if diagonal movement isn't preferred/disallowed
        // Assuming movement is cardinal (Up, Down, Left, Right)
        // And assuming a preference (e.g. Down then Right, or Right then Down)
        // For a 3x3 grid from (0,0) to (2,2), a path length of 5 (4 steps) is expected.
        // Example: (0,0)->(1,0)->(2,0)->(2,1)->(2,2)
        expect(path.length).toBe(5); 
        expect(path[0]).toEqual(start);
        expect(path[path.length - 1]).toEqual(goal);
        // A more robust check would be to verify each step is valid or check against a set of possible shortest paths.
        // For now, checking length and endpoints for simple cases.
        const expectedPath = [
            { row: 0, col: 0 },
            { row: 1, col: 0 },
            { row: 2, col: 0 },
            { row: 2, col: 1 },
            { row: 2, col: 2 }
        ];
        // Note: The exact path can vary based on tie-breaking. Let's test for one valid path.
        // If the algorithm's tie-breaking is consistent, this will pass. Otherwise, more flexible checks are needed.
        // A simple check is that all points in the path are valid & path length is correct.
        // For this specific case, let's assume a common tie-breaking (e.g., explore neighbors in D-R-U-L order)
        // which might produce the path above or similar.
        // Example: (0,0)->(0,1)->(0,2)->(1,2)->(2,2) is also valid.
        // Let's check if the path contains the expected points in one of the valid orders.
         const pathSet = new Set(path.map(p => `${p.row}-${p.col}`));
         expect(pathSet.has("0-0")).toBe(true);
         expect(pathSet.has("2-2")).toBe(true);
         // Check intermediate points based on one possible valid path
         // This test might be brittle due to tie-breaking.
         // A better general test is path length and validity of moves.
    });

    // Test Scenario 2: Path with Obstacles
    it('should find a path around obstacles', () => {
        const gridData = [
            [0, 0, 0, 0],
            [0, 4, 4, 0], // 4 is sea (impassable)
            [0, 0, 0, 0],
            [0, 4, 0, 0],
        ];
        const start = { row: 0, col: 0 };
        const goal = { row: 3, col: 3 };
        const { path } = aStarSearch(gridData, formatCoords(start), formatCoords(goal));
        
        expect(path.length > 0).toBe(true); // Path should exist
        expect(path[0]).toEqual(start);
        expect(path[path.length - 1]).toEqual(goal);
        // Verify no part of the path goes through an obstacle (terrain type 4)
        path.forEach(node => {
            expect(gridData[node.row][node.col]).not.toBe(4);
        });
        // Expected path: (0,0)->(0,1)->(0,2)->(0,3)->(1,3)->(2,3)->(2,2)->(3,2)->(3,3) - length 9
        // Or (0,0)->(1,0)->(2,0)->(2,1)->(2,2)->(3,2)->(3,3) - length 7 (if (2,3) is blocked by (1,3) and (3,1))
        // The path should be (0,0)->(1,0)->(2,0)->(2,1)->(2,2)->(3,2)->(3,3)
        const expectedOptimalPath = [
            {row: 0, col: 0},
            {row: 1, col: 0},
            {row: 2, col: 0},
            {row: 2, col: 1},
            {row: 2, col: 2},
            {row: 3, col: 2},
            {row: 3, col: 3},
        ];
        expect(path).toEqual(expectedOptimalPath);
    });

    // Test Scenario 3: No Path Found
    it('should return an empty path if no path exists', () => {
        const gridData = [
            [0, 4, 0], // 4 is sea (impassable)
            [0, 4, 0],
            [0, 4, 0]
        ];
        const start = { row: 0, col: 0 };
        const goal = { row: 0, col: 2 };
        const { path } = aStarSearch(gridData, formatCoords(start), formatCoords(goal));
        expect(path).toEqual([]);
    });
    
    it('should return an empty path if start is inside a wall of obstacles', () => {
        const gridData = [
            [4, 4, 4], 
            [4, 0, 4], // start at 0,0 (relative to this, so 1,1 in grid)
            [4, 4, 4]
        ];
        const start = { row: 1, col: 1 };
        const goal = { row: 0, col: 0 }; // Goal outside
        const { path } = aStarSearch(gridData, formatCoords(start), formatCoords(goal));
        expect(path).toEqual([]);
    });


    // Test Scenario 4: Path with Varying Terrain Weights
    it('should choose the cheapest path, not necessarily the shortest in cells', () => {
        const gridData = [
            [0, 0, 0, 0, 0], // Start (0,0)
            [2, 2, 2, 2, 0], // Row of expensive rocks (cost 10)
            [0, 0, 0, 0, 0]  // Goal (0,4)
        ];
        // TERRAIN_WEIGHTS: 0:1 (grass), 2:10 (rock)
        const start = { row: 0, col: 0 };
        const goal = { row: 0, col: 4 };

        // Path 1 (direct through grid[0]): (0,0)->(0,1)->(0,2)->(0,3)->(0,4) - Cost: 1+1+1+1 = 4, Length 5
        // Path 2 (around rocks): (0,0)->(grid[0]... )->(grid[2]...)->(0,4)
        // (0,0) -> (0,1) -> (0,2) -> (0,3) -> (0,4) cost (1*4) = 4
        // (0,0) -> (1,0) -> (2,0) -> (2,1) -> (2,2) -> (2,3) -> (2,4) -> (1,4) -> (0,4)
        // Let's refine the grid for a clearer test:
        const gridDataWeighted = [
            [0, 0, 0, 0, 0], // Start (0,0) Goal (0,4)
            [0, 2, 2, 2, 0], // Middle row: grass, 3 rocks, grass
            [0, 0, 0, 0, 0] 
        ];
        // Path A (direct): (0,0)->(0,1)->(0,2)->(0,3)->(0,4). Total cost: 1+1+1+1 = 4. Length 5.
        // Path B (through rocks): (0,0)->(1,0)->(1,1 rock)->(1,2 rock)->(1,3 rock)->(1,4)->(0,4). 
        // Cost for B: 1 (to 1,0) + 10 (to 1,1) + 10 (to 1,2) + 10 (to 1,3) + 1 (to 1,4) + 1 (to 0,4) = 33. Length 7.
        // Path C (around rocks): (0,0)->(1,0)->(2,0)->(2,1)->(2,2)->(2,3)->(2,4)->(1,4)->(0,4)
        // Cost for C: 1 (to 1,0) + 1 (to 2,0) + 1 (to 2,1) + 1 (to 2,2) + 1 (to 2,3) + 1 (to 2,4) + 1 (to 1,4) + 1 (to 0,4) = 8. Length 9.

        // The A* should find Path A.
        // Let's make Path A more expensive.
        const gridDataWeighted2 = [
            // S G G G G
            // G R R R G
            // G G G G E
            [0, 2, 2, 2, 0], // Start (0,0) Goal (0,4)
            [0, 0, 0, 0, 0], // Middle row: all grass
            [0, 2, 2, 2, 0] 
        ];
        const start2 = { row: 0, col: 0 };
        const goal2 = { row: 0, col: 4 };
        // Path A (direct through grid[0]): (0,0)->(0,1 rock)->(0,2 rock)->(0,3 rock)->(0,4 grass). Cost: 10+10+10+1 = 31. Length 5.
        // Path B (through middle grass row): (0,0)->(1,0 grass)->(1,1 grass)->(1,2 grass)->(1,3 grass)->(1,4 grass)->(0,4 grass). 
        // Cost for B: 1 (to 1,0) + 1 (to 1,1) + 1 (to 1,2) + 1 (to 1,3) + 1 (to 1,4) + 1 (to 0,4) = 6. Length 7.
        
        const { path } = aStarSearch(gridDataWeighted2, formatCoords(start2), formatCoords(goal2));
        const expectedPath = [
            { row: 0, col: 0 },
            { row: 1, col: 0 },
            { row: 1, col: 1 },
            { row: 1, col: 2 },
            { row: 1, col: 3 },
            { row: 1, col: 4 },
            { row: 0, col: 4 }
        ];
        expect(path).toEqual(expectedPath);
        expect(path.length).toBe(7);
    });

    // Test Scenario 5: Start or Goal is Obstacle
    it('should return an empty path if start is an obstacle', () => {
        const gridData = [[4]];
        const start = { row: 0, col: 0 };
        const goal = { row: 0, col: 0 };
        const { path } = aStarSearch(gridData, formatCoords(start), formatCoords(goal));
        expect(path).toEqual([]);
    });

    it('should return an empty path if goal is an obstacle', () => {
        const gridData = [
            [0, 4] // Goal at (0,1) is obstacle
        ];
        const start = { row: 0, col: 0 };
        const goal = { row: 0, col: 1 };
        const { path } = aStarSearch(gridData, formatCoords(start), formatCoords(goal));
        expect(path).toEqual([]);
    });

    // Test Scenario 6: Start and Goal are the Same
    it('should return a path with only the start/goal point if they are the same', () => {
        const gridData = [[0]];
        const start = { row: 0, col: 0 };
        const goal = { row: 0, col: 0 };
        const { path } = aStarSearch(gridData, formatCoords(start), formatCoords(goal));
        expect(path).toEqual([{ row: 0, col: 0 }]);
    });
    
    it('should return a path with only the start/goal point if they are the same (larger grid)', () => {
        const gridData = [
            [0,0,0],
            [0,0,0],
            [0,0,0]
        ];
        const start = { row: 1, col: 1 };
        const goal = { row: 1, col: 1 };
        const { path } = aStarSearch(gridData, formatCoords(start), formatCoords(goal));
        expect(path).toEqual([{ row: 1, col: 1 }]);
    });

    // Test Scenario 7: Edge Cases
    it('should work for a 1x1 grid (path exists)', () => {
        const gridData = [[0]];
        const start = { row: 0, col: 0 };
        const goal = { row: 0, col: 0 };
        const { path } = aStarSearch(gridData, formatCoords(start), formatCoords(goal));
        expect(path).toEqual([{ row: 0, col: 0 }]);
    });
    
    it('should work for a 1x1 grid (start is obstacle)', () => {
        const gridData = [[4]]; // impassable
        const start = { row: 0, col: 0 };
        const goal = { row: 0, col: 0 };
        const { path } = aStarSearch(gridData, formatCoords(start), formatCoords(goal));
        expect(path).toEqual([]);
    });

    it('should find path in a single row grid', () => {
        const gridData = [[0, 0, 0, 0, 0]];
        const start = { row: 0, col: 0 };
        const goal = { row: 0, col: 4 };
        const { path } = aStarSearch(gridData, formatCoords(start), formatCoords(goal));
        expect(path).toEqual([
            { row: 0, col: 0 },
            { row: 0, col: 1 },
            { row: 0, col: 2 },
            { row: 0, col: 3 },
            { row: 0, col: 4 },
        ]);
    });
    
    it('should return empty path in a single row grid with obstacle', () => {
        const gridData = [[0, 0, 4, 0, 0]]; // Obstacle at (0,2)
        const start = { row: 0, col: 0 };
        const goal = { row: 0, col: 4 };
        const { path } = aStarSearch(gridData, formatCoords(start), formatCoords(goal));
        expect(path).toEqual([]);
    });

    it('should find path in a single column grid', () => {
        const gridData = [[0], [0], [0], [0], [0]];
        const start = { row: 0, col: 0 };
        const goal = { row: 4, col: 0 };
        const { path } = aStarSearch(gridData, formatCoords(start), formatCoords(goal));
        expect(path).toEqual([
            { row: 0, col: 0 },
            { row: 1, col: 0 },
            { row: 2, col: 0 },
            { row: 3, col: 0 },
            { row: 4, col: 0 },
        ]);
    });

    it('should handle start/goal at edges/corners', () => {
        const gridData = [
            [0, 0, 0],
            [0, 4, 0], // Obstacle in middle
            [0, 0, 0]
        ];
        const start = { row: 0, col: 0 }; // Top-left corner
        const goal = { row: 2, col: 2 }; // Bottom-right corner
        const { path } = aStarSearch(gridData, formatCoords(start), formatCoords(goal));
        // Expected path: (0,0)->(0,1)->(0,2)->(1,2)->(2,2) OR (0,0)->(1,0)->(2,0)->(2,1)->(2,2)
        // Both are length 5
        expect(path.length).toBe(5);
        expect(path[0]).toEqual(start);
        expect(path[path.length - 1]).toEqual(goal);
        path.forEach(node => {
            expect(gridData[node.row][node.col]).not.toBe(4);
        });
    });
    
    // Test for history and allNodes structure (basic check)
    it('should return history and allNodes map', () => {
        const gridData = [[0, 0]];
        const start = { row: 0, col: 0 };
        const goal = { row: 0, col: 1 };
        const { history, allNodes } = aStarSearch(gridData, formatCoords(start), formatCoords(goal));

        expect(history).toBeInstanceOf(Array);
        expect(allNodes).toBeInstanceOf(Map);

        if (history.length > 0) {
            const step = history[0];
            expect(step).toHaveProperty('current');
            expect(step.current).toHaveProperty('row');
            expect(step.current).toHaveProperty('col');
            expect(step).toHaveProperty('openSet');
            expect(step.openSet).toBeInstanceOf(Array);
            expect(step).toHaveProperty('closedSet');
            expect(step.closedSet).toBeInstanceOf(Array);
        }
        
        // Check if start and goal nodes are in allNodes
        // Note: astarAlgorithm.js keys allNodes by "y-x"
        if (allNodes.size > 0) {
             expect(allNodes.has(`${start.row}-${start.col}`)).toBe(true); // Start node
             // Goal node might not be in allNodes if path is not found or if it's the last node processed
             // but if path is found, it should be.
        }
    });
});
