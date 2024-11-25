import React, { useState, useEffect, useRef } from 'react';
import './aster.css';

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
        const value = gridData[rowIndex]?.[colIndex] ?? 0; // 安全に値を取得
        setSelectedCell({ row: rowIndex, col: colIndex });
        setCellValue(value);

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

            const cellValue = gridData[row]?.[col] ?? 0; // 安全に値を取得
            const imgSrc = images[cellValue];

            buttons.push(
                <button
                    key={`${row}-${col}`}
                    className={`aster-grid-button ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleCellClick(row, col)}
                    style={{
                        width: `${cellSize}px`,
                        height: `${cellSize}px`,
                    }}
                >
                    {imgSrc ? (
                        <img src={imgSrc} alt={`Cell ${cellValue}`} />
                    ) : (
                        // 画像がない場合はセルの値を表示
                        cellValue
                    )}
                </button>
            );
        }
    }

    const gridStyle = {
        gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
        gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
    };

    return (
        <div>
            <div className="aster-container">
                <div className="aster-controls">
                    <label>
                        行数:
                        <input type="number" value={rows} onChange={handleRowsChange} min="1" />
                    </label>
                    <label>
                        列数:
                        <input type="number" value={cols} onChange={handleColsChange} min="1" />
                    </label>
                    <label>
                        セルの大きさ (px):
                        <input
                            type="number"
                            value={cellSize}
                            onChange={handleCellSizeChange}
                            min="10"
                        />
                    </label>
                    {selectedCell && (
                        <div className="aster-cell-editor">
                            <h3>セル情報</h3>
                            <p>
                                行: {selectedCell.row + 1}, 列: {selectedCell.col + 1}
                            </p>
                            <label>
                                値:
                                <input
                                    type="number"
                                    value={cellValue}
                                    onChange={handleCellValueChange}
                                    min="0"
                                    max="9"
                                />
                            </label>
                        </div>
                    )}
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
