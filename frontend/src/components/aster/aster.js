import React, { useState, useEffect } from 'react';
import './aster.css';

// 画像のインポート
import grassImg from './pic/grass.png';
import forestImg from './pic/forest.png';
import rockImg from './pic/rock.png';

// 画像を整数値のインデックスに対応させた配列として管理
const images = [
    grassImg,    // 0番目: grass.png
    forestImg,   // 1番目: forest.png
    rockImg,     // 2番目: rock.png
    null,        // 3番目: 今後用意する予定
    null,        // 4番目: 今後用意する予定
    null,        // 5番目: 今後用意する予定
    null,        // 6番目: 今後用意する予定
    null,        // 7番目: 今後用意する予定
    null,        // 8番目: 今後用意する予定
    null,        // 9番目: 今後用意する予定
];

function GridButtons() {
    const [rows, setRows] = useState(5);
    const [cols, setCols] = useState(5);

    // 初期値としてgridDataを適切に初期化
    const [gridData, setGridData] = useState(() => {
        const initialGridData = [];
        for (let row = 0; row < rows; row++) {
            initialGridData.push(Array(cols).fill(0));
        }
        return initialGridData;
    });

    const [selectedCell, setSelectedCell] = useState(null);
    const [cellValue, setCellValue] = useState(0);

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

        // 選択中のセルが範囲外の場合、選択を解除
        setSelectedCell((prevSelectedCell) => {
            if (
                prevSelectedCell &&
                (prevSelectedCell.row >= rows || prevSelectedCell.col >= cols)
            ) {
                return null;
            }
            return prevSelectedCell;
        });
    }, [rows, cols]);

    const handleRowsChange = (e) => {
        const value = parseInt(e.target.value, 10);
        if (value > 0) setRows(value);
    };

    const handleColsChange = (e) => {
        const value = parseInt(e.target.value, 10);
        if (value > 0) setCols(value);
    };

    // セルをクリックしたときの処理
    const handleCellClick = (rowIndex, colIndex) => {
        const value = gridData[rowIndex]?.[colIndex] ?? 0; // 安全に値を取得
        setSelectedCell({ row: rowIndex, col: colIndex });
        setCellValue(value);
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

                // 行が存在しない場合は初期化
                if (!newGridData[selectedCell.row]) {
                    newGridData[selectedCell.row] = Array(cols).fill(0);
                }

                // 列が存在しない場合は初期化
                if (newGridData[selectedCell.row][selectedCell.col] === undefined) {
                    newGridData[selectedCell.row][selectedCell.col] = 0;
                }

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
        gridTemplateColumns: `repeat(${cols}, 40px)`,
        gridTemplateRows: `repeat(${rows}, 40px)`,
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
                    <div className="aster-grid-container" style={gridStyle}>
                        {buttons}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default GridButtons;
