// frontend/src/components/aster/astarAlgorithm.js

// Node representation
class Node {
    constructor(x, y, gCost = 0, hCost = 0, parent = null, isWall = false) {
        this.x = x;
        this.y = y;
        this.gCost = gCost; // Cost from start to this node
        this.hCost = hCost; // Heuristic cost from this node to goal
        this.fCost = gCost + hCost; // Total estimated cost
        this.parent = parent; // Parent node for path reconstruction
        this.isWall = isWall; // Flag for impassable terrain
    }
}

// Terrain weights
const TERRAIN_WEIGHTS = {
    0: 1,  // grassImg (Grass)
    1: 5,  // forestImg (Forest)
    2: 10, // rockImg (Rock)
    3: 2,  // desertImg (Desert)
    4: Infinity, // seaImg (Sea - impassable)
    5: 3,  // snowImg (Snow)
    6: 4,  // iceImg (Ice)
    7: Infinity, // Default for 7-9 (impassable)
    8: Infinity, // Default for 7-9 (impassable)
    9: Infinity, // Default for 7-9 (impassable)
};

// Heuristic function (Manhattan distance)
function heuristic(node, goal) {
    return Math.abs(node.x - goal.x) + Math.abs(node.y - goal.y);
}

// Path reconstruction utility
function reconstructPath(node) {
    const path = [];
    let current = node;
    while (current !== null) {
        // Store as {row, col} directly for easier use in aster.js
        path.unshift({ row: current.y, col: current.x });
        current = current.parent;
    }
    return path;
}

// Helper to convert node list to {row, col} array
function nodesToCoordsArray(nodeArray) {
    return nodeArray.map(node => ({ row: node.y, col: node.x, gCost: node.gCost, hCost: node.hCost, fCost: node.fCost }));
}

// Helper to convert Set of "x-y" strings to {row, col} array
// Also needs access to a structure that maps "x-y" to full node for costs,
// or we assume nodes in closedSet are also in allNodesMap for cost retrieval.
function closedSetToCoordsArray(closedSetStrings, allNodesMap) {
    const coordsArray = [];
    closedSetStrings.forEach(key => {
        const [x, y] = key.split('-').map(Number);
        const node = allNodesMap.get(key); // Get the full node for its costs
        if (node) {
             coordsArray.push({ row: y, col: x, gCost: node.gCost, hCost: node.hCost, fCost: node.fCost });
        } else {
            // Fallback if node not in allNodesMap (should not happen if allNodesMap is comprehensive)
            coordsArray.push({ row: y, col: x });
        }
    });
    return coordsArray;
}


// A* Search Function
export function aStarSearch(gridData, startCoords, goalCoords) {
    const rows = gridData.length;
    const cols = gridData[0].length;

    const startNode = new Node(startCoords.x, startCoords.y);
    const goalNode = new Node(goalCoords.x, goalCoords.y);

    // Initialize start node costs
    startNode.hCost = heuristic(startNode, goalNode);
    startNode.fCost = startNode.gCost + startNode.hCost;

    // Open set (using an array, ideally a min-heap)
    const openSet = [startNode];
    // Closed set (using a Set for efficient lookup of "x-y" coordinates)
    const closedSet = new Set(); // Stores "x-y" strings

    const visualizationHistory = [];
    const allNodesMap = new Map(); // To store all nodes encountered for cost data { "row-col": Node }

    // Add start node to allNodesMap
    allNodesMap.set(`${startNode.y}-${startNode.x}`, startNode);


    while (openSet.length > 0) {
        // Sort openSet by fCost to get the node with the lowest fCost
        openSet.sort((a, b) => a.fCost - b.fCost);
        const currentNode = openSet.shift();

        // Add to allNodesMap if not already (it should be, but as a safeguard)
        if (!allNodesMap.has(`${currentNode.y}-${currentNode.x}`)) {
            allNodesMap.set(`${currentNode.y}-${currentNode.x}`, currentNode);
        }
        
        // Record step for visualization BEFORE checking for goal
        // Convert openSet and closedSet to {row, col} format for history
        visualizationHistory.push({
            current: { row: currentNode.y, col: currentNode.x, gCost: currentNode.gCost, hCost: currentNode.hCost, fCost: currentNode.fCost },
            openSet: nodesToCoordsArray([...openSet]), // Pass a copy
            closedSet: closedSetToCoordsArray(new Set(closedSet), allNodesMap) // Pass a copy
        });

        // Check if goal is reached
        if (currentNode.x === goalNode.x && currentNode.y === goalNode.y) {
            const finalPath = reconstructPath(currentNode);
            return { path: finalPath, history: visualizationHistory, allNodes: allNodesMap };
        }

        // Move current node to closed set (using "x-y" string key)
        closedSet.add(`${currentNode.x}-${currentNode.y}`);

        // Explore neighbors (up, down, left, right)
        const neighbors = [];
        const { x, y } = currentNode;

        // Right
        if (x + 1 < cols) neighbors.push({ x: x + 1, y: y });
        // Left
        if (x - 1 >= 0) neighbors.push({ x: x - 1, y: y });
        // Down
        if (y + 1 < rows) neighbors.push({ x: x, y: y + 1 });
        // Up
        if (y - 1 >= 0) neighbors.push({ x: x, y: y - 1 });

        for (const neighborCoords of neighbors) {
            const neighborX = neighborCoords.x;
            const neighborY = neighborCoords.y;
            const neighborKey = `${neighborX}-${neighborY}`; // Used for closedSet check
            const neighborMapKey = `${neighborY}-${neighborX}`; // Used for allNodesMap

            // Skip if already evaluated
            if (closedSet.has(neighborKey)) {
                continue;
            }

            // Get terrain type and cost
            const terrainType = gridData[neighborY][neighborX];
            const moveCost = TERRAIN_WEIGHTS[terrainType];

            // Check if wall
            if (moveCost === Infinity) {
                // Mark as wall in allNodesMap for cost display if needed (e.g. cost Infinity)
                if (!allNodesMap.has(neighborMapKey)) {
                     allNodesMap.set(neighborMapKey, new Node(neighborX, neighborY, Infinity, Infinity, null, true));
                }
                continue;
            }

            const tentativeGCost = currentNode.gCost + moveCost;

            let neighborNode = openSet.find(node => node.x === neighborX && node.y === neighborY);

            if (!neighborNode || tentativeGCost < neighborNode.gCost) {
                if (!neighborNode) {
                    // This is a new node
                    neighborNode = new Node(neighborX, neighborY);
                    neighborNode.hCost = heuristic(neighborNode, goalNode);
                    openSet.push(neighborNode);
                    // Add to allNodesMap when it's first created and added to openSet
                    allNodesMap.set(neighborMapKey, neighborNode);
                } else {
                    // Node already in openSet, update it. Also update in allNodesMap.
                    allNodesMap.set(neighborMapKey, neighborNode);
                }
                
                neighborNode.gCost = tentativeGCost;
                neighborNode.fCost = neighborNode.gCost + neighborNode.hCost;
                neighborNode.parent = currentNode;

            }
        }
    }

    // No path found
    return { path: [], history: visualizationHistory, allNodes: allNodesMap };
}

// Export terrain weights if they might be used by the React component directly
export { TERRAIN_WEIGHTS };
