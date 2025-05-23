import React, { useState, useEffect, useRef } from 'react';
import './aster.css';
import { aStarSearch, TERRAIN_WEIGHTS } from './astarAlgorithm.js';

// 画像のインポート
import grassImg from './pic/grass.png';
import forestImg from './pic/forest.png';
import rockImg from './pic/rock.png';
import desertImg from './pic/desert.png';
import seaImg from './pic/sea.png';
import snowImg from './pic/snow.png';
import iceImg from './pic/ice.png';

// 画像を整数値のインデックスに対応させた配列として管理
const images = [
    grassImg,    // 0番目: grass.png
    forestImg,   // 1番目: forest.png
    rockImg,     // 2番目: rock.png
    desertImg,   // 3番目: desert.png
    seaImg,      // 4番目: sea.png
    snowImg,     // 5番目: snow.png
    iceImg,      // 6番目: ice.png
    null,        // 7番目: 今後用意する予定
    null,        // 8番目: 今後用意する予定
    null,        // 9番目: 今後用意する予定
];

function GridButtons() {
    const [rows, setRows] = useState(5);
    const [cols, setCols] = useState(5);
    const [cellSize, setCellSize] = useState(40); // セルの大きさを管理する状態を追加

    // A* related state
    const [startPoint, setStartPoint] = useState({ row: null, col: null });
    const [goalPoint, setGoalPoint] = useState({ row: null, col: null });
    const [path, setPath] = useState([]);
    const [selectionMode, setSelectionMode] = useState('cell'); // 'cell', 'start', 'goal'

    // New state variables for visualization and cost display
    const [visualizationHistory, setVisualizationHistory] = useState([]);
    const [currentStepIndex, setCurrentStepIndex] = useState(-1); // -1: viz not active, 0 to N-1: playing
    const [showCostValues, setShowCostValues] = useState(null); // 'gCost', 'hCost', 'fCost', or null
    const [costData, setCostData] = useState({}); // Stores { "row-col": { gCost, hCost, fCost } }
    const [userMessage, setUserMessage] = useState(""); // For messages like "No path found!"
    const [showHelp, setShowHelp] = useState(false); // For toggling help section


    // 初期値としてgridDataを適切に初期化
    const [gridData, setGridData] = useState(() => {
        const initialGridData = [];
        for (let row = 0; row < rows; row++) {
            initialGridData.push(Array(cols).fill(0));
        }
        return initialGridData;
    });

    // 初期状態でセル (1,1) を選択
    const [selectedCell, setSelectedCell] = useState({ row: 0, col: 0 });
    const [cellValue, setCellValue] = useState(0);

    // グリッドコンテナへの参照を取得
    const gridRef = useRef(null);

    // 行数や列数が変更されたときにグリッドデータを更新
    useEffect(() => {
        setGridData((prevGridData) => {
            const newGridData = [];

            for (let row = 0; row < rows; row++) {
                if (prevGridData[row]) {
                    // 既存の行がある場合
                    const newRow = [...prevGridData[row]];

                    if (cols > newRow.length) {
                        // 列数が増えた場合、新しい列を追加
                        newRow.push(...Array(cols - newRow.length).fill(0));
                    } else if (cols < newRow.length) {
                        // 列数が減った場合、余分な列を削除
                        newRow.length = cols;
                    }

                    newGridData.push(newRow);
                } else {
                    // 新しい行を追加
                    newGridData.push(Array(cols).fill(0));
                }
            }

            return newGridData;
        });

        // 選択中のセルが範囲外の場合、選択を調整
        setSelectedCell((prevSelectedCell) => {
            let { row, col } = prevSelectedCell || { row: 0, col: 0 };
            if (row >= rows) row = rows - 1;
            if (col >= cols) col = cols - 1;
            return { row, col };
        });
    }, [rows, cols]);

    // キーボードの矢印キーと数字キーでセルの選択と値の変更を行う
    const handleKeyDown = (e) => {
        if (!selectedCell) return;

        let { row, col } = selectedCell;
        let handled = false;

        if (e.key === 'ArrowUp') {
            if (row > 0) {
                row -= 1;
                handled = true;
            }
        } else if (e.key === 'ArrowDown') {
            if (row < rows - 1) {
                row += 1;
                handled = true;
            }
        } else if (e.key === 'ArrowLeft') {
            if (col > 0) {
                col -= 1;
                handled = true;
            }
        } else if (e.key === 'ArrowRight') {
            if (col < cols - 1) {
                col += 1;
                handled = true;
            }
        } else if (e.key >= '0' && e.key <= '9') {
            // 数字キーが押された場合
            const value = parseInt(e.key, 10);
            setCellValue(value);

            // gridDataを更新
            setGridData((prevGridData) => {
                const newGridData = [...prevGridData];
                newGridData[row] = [...newGridData[row]];
                newGridData[row][col] = value;
                return newGridData;
            });
            handled = true;
        }

        if (handled) {
            e.preventDefault(); // ページのスクロールを防止
            setSelectedCell({ row, col });
            const value = gridData[row]?.[col] ?? 0;
            setCellValue(value);
        }
    };

    const handleRowsChange = (e) => {
        const value = parseInt(e.target.value, 10);
        if (value > 0) setRows(value);
    };

    const handleColsChange = (e) => {
        const value = parseInt(e.target.value, 10);
        if (value > 0) setCols(value);
    };

    // セルサイズの変更処理
    const handleCellSizeChange = (e) => {
        const value = parseInt(e.target.value, 10);
        if (value >= 10) setCellSize(value);
    };

    // セルをクリックしたときの処理
    const handleCellClick = (rowIndex, colIndex) => {
        const terrainType = gridData[rowIndex]?.[colIndex] ?? 0;
        const isPassable = TERRAIN_WEIGHTS[terrainType] !== Infinity;

        if (selectionMode === 'start') {
            if (isPassable) {
                setStartPoint({ row: rowIndex, col: colIndex });
            } else {
                alert("Cannot set start point on an impassable cell.");
            }
        } else if (selectionMode === 'goal') {
            if (isPassable) {
                setGoalPoint({ row: rowIndex, col: colIndex });
            } else {
                alert("Cannot set goal point on an impassable cell.");
            }
        } else { // selectionMode === 'cell'
            const value = gridData[rowIndex]?.[colIndex] ?? 0; // 安全に値を取得
            setSelectedCell({ row: rowIndex, col: colIndex });
            setCellValue(value);
        }

        // グリッドにフォーカスを当てる
        if (gridRef.current) {
            gridRef.current.focus();
        }
    };

    // セルの値を変更したときの処理（即時更新）
    const handleCellValueChange = (e) => {
        let value = parseInt(e.target.value, 10);
        if (isNaN(value)) value = 0;
        // 値を0~9の範囲に制限
        if (value < 0) value = 0;
        if (value > 9) value = 9;

        setCellValue(value);

        if (selectedCell) {
            setGridData((prevGridData) => {
                const newGridData = [...prevGridData];
                newGridData[selectedCell.row] = [...newGridData[selectedCell.row]];
                newGridData[selectedCell.row][selectedCell.col] = value;
                return newGridData;
            });
        }
    };

    // ボタンの生成
    const buttons = [];
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const isSelected =
                selectedCell && selectedCell.row === row && selectedCell.col === col;
            const isStart = startPoint.row === row && startPoint.col === col;
            const isGoal = goalPoint.row === row && goalPoint.col === col;
            let isFinalPathNode = path.some(p => p.row === row && p.col === col);
            
            let buttonClass = `aster-grid-button ${isSelected ? 'selected' : ''}`;
            let cellText = null; // For 'S', 'G'
            let costText = null;  // For cost values like g:10, h:5, f:15
            const cellKey = `${row}-${col}`; // Key for costData, e.g., "0-0"

            // Visualization step active
            if (currentStepIndex >= 0 && currentStepIndex < visualizationHistory.length) {
                const currentStep = visualizationHistory[currentStepIndex];
                isFinalPathNode = false; // Don't show final path during step-by-step playback initially

                if (currentStep.current && currentStep.current.row === row && currentStep.current.col === col) {
                    buttonClass += ' current-node';
                } else if (currentStep.openSet && currentStep.openSet.some(n => n.row === row && n.col === col)) {
                    buttonClass += ' open-set-node';
                } else if (currentStep.closedSet && currentStep.closedSet.some(n => n.row === row && n.col === col)) {
                    buttonClass += ' closed-set-node';
                }
                // If it's the last step, also show the final path
                if (currentStepIndex === visualizationHistory.length - 1) {
                    if(path.some(p => p.row === row && p.col === col)) {
                       isFinalPathNode = true;
                    }
                }
            } else { // Visualization not active or finished, show final path
                 if (isFinalPathNode) {
                    buttonClass += ' path-node';
                 }
            }
            
            if (isStart) {
                buttonClass += ' start-point';
                cellText = 'S';
            } else if (isGoal) {
                buttonClass += ' goal-point';
                cellText = 'G';
            } else if (isFinalPathNode && !isStart && !isGoal) { // Ensure path doesn't override S/G styles if path includes them
                 buttonClass += ' path-node';
            }


            const cellCosts = costData[cellKey];
            if (showCostValues && cellCosts && cellCosts[showCostValues] !== undefined) {
                const val = cellCosts[showCostValues];
                costText = val === Infinity ? "Inf" : parseFloat(val).toFixed(0);
            }

            const cellGridValue = gridData[row]?.[col] ?? 0; 
            const imgSrc = images[cellGridValue];
            
            // Determine image opacity: lower if any special state is applied (open, closed, current, path)
            // but not for start/goal if they are also part of these sets (their specific colors should dominate)
            let imageOpacity = 1;
            if (!isStart && !isGoal) {
                if (buttonClass.includes('open-set-node') || 
                    buttonClass.includes('closed-set-node') || 
                    buttonClass.includes('current-node') ||
                    buttonClass.includes('path-node')) {
                    imageOpacity = 0.3;
                }
            }


            buttons.push(
                <button
                    key={cellKey}
                    className={buttonClass}
                    onClick={() => handleCellClick(row, col)}
                    style={{
                        width: `${cellSize}px`,
                        height: `${cellSize}px`,
                    }}
                >
                    {cellText && <span className="button-text-overlay">{cellText}</span>}
                    {costText && <span className="cost-text-overlay">{`${showCostValues.replace('Cost','')}: ${costText}`}</span>}
                    {imgSrc && (
                        <img 
                            src={imgSrc} 
                            alt={`Cell ${cellGridValue}`} 
                            style={{ opacity: imageOpacity }}
                        />
                    )}
                    {!imgSrc && !cellText && !costText && cellGridValue}
                </button>
            );
        }
    }

    const gridStyle = {
        gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
        gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
    };
    
    const handleFindPath = () => {
        if (startPoint.row === null || startPoint.col === null || goalPoint.row === null || goalPoint.col === null) {
            alert("Please set both start and goal points.");
            return;
        }

        setCurrentStepIndex(-1);
        setVisualizationHistory([]);
        setCostData({});
        setPath([]);
        setUserMessage(""); // Clear previous messages

        const startCoords = { x: startPoint.col, y: startPoint.row };
        const goalCoords = { x: goalPoint.col, y: goalPoint.row };

        const { path: resultPath, history: resultHistory, allNodes: allNodesMap } = aStarSearch(gridData, startCoords, goalCoords);
        
        setPath(resultPath); 
        setVisualizationHistory(resultHistory);
        
        const newCostData = {};
        allNodesMap.forEach((node, key) => { 
            newCostData[key] = { 
                gCost: node.gCost,
                hCost: node.hCost,
                fCost: node.fCost,
            };
        });
        setCostData(newCostData);

        if (resultPath.length === 0 && resultHistory.length > 0) { // Path not found but algorithm ran
            setUserMessage("No path found!");
        } else if (resultPath.length > 0) {
            setUserMessage(`Path found! Length: ${resultPath.length}`);
        } else {
             setUserMessage(""); // No history, probably start/goal on obstacle
        }


        if (resultHistory.length > 0) {
            setCurrentStepIndex(0); 
        }
    };

    const handleResetSelection = () => { // Renamed to Reset All
        setStartPoint({ row: null, col: null });
        setGoalPoint({ row: null, col: null });
        setPath([]);
        setSelectionMode('cell'); 
        setVisualizationHistory([]);
        setCurrentStepIndex(-1);
        setCostData({});
        setShowCostValues(null);
        setUserMessage("");
    };
    
    const handleNextStep = () => {
        setCurrentStepIndex(prev => Math.min(prev + 1, visualizationHistory.length - 1));
    };

    const handlePrevStep = () => {
        setCurrentStepIndex(prev => Math.max(prev - 1, 0)); 
    };

    const handleResetVisualization = () => { // Resets playback, not all data
        setCurrentStepIndex(visualizationHistory.length > 0 ? 0 : -1); // Go to first step or -1 if no history
    };


    return (
        <div>
            <div className="aster-container">
                <div className="aster-controls">
                    {/* Help Toggle Button */}
                    <div className="control-group help-toggle-group">
                         <button onClick={() => setShowHelp(!showHelp)} className="help-button">
                            {showHelp ? 'Hide Help' : 'Show Help / Instructions'}
                        </button>
                    </div>

                    {/* Help Section */}
                    {showHelp && (
                        <div className="control-group help-section">
                            <h4>How to Use:</h4>
                            <ol>
                                <li>Adjust grid size if needed using "Grid Setup".</li>
                                <li>Select "Edit Grid" mode. Click on cells and use the "Value (0-9)" input to set terrain types. (0: Grass, 1: Forest, 2: Rock, 3: Desert, 4: Sea (Impassable), 5: Snow, 6: Ice)</li>
                                <li>Select "Set Start" mode and click a passable cell to mark the starting point ('S').</li>
                                <li>Select "Set Goal" mode and click a passable cell to mark the goal point ('G').</li>
                                <li>Click "Find Path". The algorithm will run and display results.</li>
                                <li>If a path is found, use "Prev", "Next", "Replay" buttons to step through the visualization.</li>
                                <li>Use "Display Cell Costs" options to see g, h, or f costs on the grid cells.</li>
                                <li>Click "Reset All" to clear selections, path, and visualization.</li>
                            </ol>
                            <h4>Visual Legend:</h4>
                            <ul>
                                <li><span className="legend-color-start"></span> Start Point ('S')</li>
                                <li><span className="legend-color-goal"></span> Goal Point ('G')</li>
                                <li><span className="legend-color-path"></span> Final Path</li>
                                <li><span className="legend-color-open"></span> Open Set (Cells being considered)</li>
                                <li><span className="legend-color-closed"></span> Closed Set (Cells already evaluated)</li>
                                <li><span className="legend-color-current"></span> Current Node (Cell being processed in current step)</li>
                            </ul>
                            <h4>Terrain Weights:</h4>
                            <p>Different terrains have different movement costs. For example, Forests (cost: {TERRAIN_WEIGHTS[1]}) are harder to traverse than Grass (cost: {TERRAIN_WEIGHTS[0]}). Sea (cost: {TERRAIN_WEIGHTS[4]}) is impassable.</p>
                            <h4>Cost Display:</h4>
                            <p>
                                <strong>gCost:</strong> Cost from start to this cell. <br />
                                <strong>hCost:</strong> Estimated heuristic cost from this cell to goal. <br />
                                <strong>fCost:</strong> Total estimated cost (gCost + hCost).
                            </p>
                        </div>
                    )}

                    {/* Group 1: Grid Setup */}
                    <div className="control-group grid-setup-group">
                        <h4>Grid Setup</h4>
                        <label> Rows: <input type="number" value={rows} onChange={handleRowsChange} min="1" /> </label>
                        <label> Columns: <input type="number" value={cols} onChange={handleColsChange} min="1" /> </label>
                        <label> Cell Size (px): <input type="number" value={cellSize} onChange={handleCellSizeChange} min="10" /> </label>
                    </div>

                    {/* Group 2: Mode Selection & Cell Editing */}
                    <div className="control-group mode-selection-group">
                        <h4>Mode & Selection</h4>
                        <p>Current Mode: <strong>{selectionMode.toUpperCase()}</strong></p>
                        <button onClick={() => setSelectionMode('cell')} className={selectionMode === 'cell' ? 'active-mode' : ''}>Edit Grid</button>
                        <button onClick={() => setSelectionMode('start')} className={selectionMode === 'start' ? 'active-mode' : ''}>Set Start</button>
                        <button onClick={() => setSelectionMode('goal')} className={selectionMode === 'goal' ? 'active-mode' : ''}>Set Goal</button>
                        
                        {startPoint.row !== null && <p>Start: (R:{startPoint.row + 1}, C:{startPoint.col + 1})</p>}
                        {goalPoint.row !== null && <p>Goal: (R:{goalPoint.row + 1}, C:{goalPoint.col + 1})</p>}

                        {selectedCell && selectionMode === 'cell' && (
                            <div className="aster-cell-editor">
                                <h5>Edit Cell ({selectedCell.row + 1}, {selectedCell.col + 1})</h5>
                                <label> Value (0-9):
                                    <input type="number" value={cellValue} onChange={handleCellValueChange} min="0" max="9" />
                                </label>
                            </div>
                        )}
                    </div>
                    
                    {/* Group 3: Pathfinding Actions */}
                    <div className="control-group pathfinding-actions-group">
                        <h4>Pathfinding</h4>
                        <button onClick={handleFindPath} disabled={startPoint.row === null || goalPoint.row === null}>Find Path</button>
                        <button onClick={handleResetSelection}>Reset All</button>
                        {userMessage && <p className="user-message">{userMessage}</p>}
                    </div>

                    {/* Group 4: Visualization Controls */}
                    {visualizationHistory.length > 0 && (
                        <div className="control-group visualization-controls">
                            <h4>Visualization Steps</h4>
                            <button onClick={handlePrevStep} disabled={currentStepIndex <= 0}>Prev</button>
                            <button onClick={handleNextStep} disabled={currentStepIndex >= visualizationHistory.length - 1 || currentStepIndex === -1}>Next</button>
                            <button onClick={handleResetVisualization}>Replay</button>
                            <p>Step: {currentStepIndex >= 0 ? currentStepIndex + 1 : 0} / {visualizationHistory.length}</p>
                        </div>
                    )}

                    {/* Group 5: Cost Display Options */}
                    <div className="control-group cost-controls">
                        <h4>Display Cell Costs</h4>
                        <label><input type="radio" name="costType" value="none" checked={showCostValues === null} onChange={() => setShowCostValues(null)} /> None</label>
                        <label><input type="radio" name="costType" value="gCost" checked={showCostValues === 'gCost'} onChange={() => setShowCostValues('gCost')} /> g</label>
                        <label><input type="radio" name="costType" value="hCost" checked={showCostValues === 'hCost'} onChange={() => setShowCostValues('hCost')} /> h</label>
                        <label><input type="radio" name="costType" value="fCost" checked={showCostValues === 'fCost'} onChange={() => setShowCostValues('fCost')} /> f</label>
                    </div>
                </div>
                <div className="aster-grid-frame">
                    <div
                        className="aster-grid-container"
                        style={gridStyle}
                        tabIndex="0" // フォーカスを可能にする
                        ref={gridRef}
                        onKeyDown={handleKeyDown} // キーボードイベントハンドラを追加
                    >
                        {buttons}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default GridButtons;
