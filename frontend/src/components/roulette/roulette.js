import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import './roulette.css';

const VerticalRoulette = () => {
    const [items, setItems] = useState(["リネール", "選手1", "選手2", "選手3", "選手4"]);
    const [newItem, setNewItem] = useState("");
    const [start, setStart] = useState(false);
    const [position, setPosition] = useState(-items.length * 50); // 初期位置を範囲外に設定
    const [speed, setSpeed] = useState(0.05); // 初期速度（ミリ秒単位の間隔）を設定
    const [time, setTime] = useState(0); // 経過時間を追跡
    const [disabled, setDisabled] = useState(false); // ボタンを無効化するフラグ
    const [isZeroItems, setIsZeroItems] = useState(false); // アイテムが0個の場合のフラグ
    const [selectedItem, setSelectedItem] = useState(items[0]); // 選択中の要素

    useEffect(() => {
        let interval;
        if (start) {
            setDisabled(true); // ルーレットが回転中はボタンを無効化
            interval = setInterval(() => {
                setPosition(prevPosition => {
                    const nextPosition = prevPosition + 1;
                    const totalHeight = items.length * 50;
                    const resetThreshold = -items.length * 50;

                    // 位置リセットのタイミング調整
                    return nextPosition >= totalHeight + resetThreshold ? resetThreshold : nextPosition;
                });

                // 時間経過に伴って速度を調整
                setTime(prevTime => prevTime + 0.05);

                // しばらく初速を保った後、徐々に減速させる
                const newSpeed = Math.pow(time, 3.7) / 1000000; // ここで減速カーブを描く
                setSpeed(newSpeed);

                // 選択中の要素が中央に来たかをチェック
                const selectedIndex = items.indexOf(selectedItem);
                const targetPosition = (-(selectedIndex * 50) + 100 - (items.length * 50)) % (items.length * 50); // 100は中央に来るためのオフセット
                const isCentered = Math.abs(position - targetPosition) < 3; // 中央に来たかどうかを確認

                // 一定のスピードに達し、かつ要素が中央に来たら停止
                if (newSpeed >= 30 && (isCentered)) {
                    setStart(false);
                    setDisabled(false); // 停止後にボタンを有効化

                    // 停止時に位置を調整して5つの要素がちょうど見えるようにする
                    setPosition(targetPosition);
                    setTime(0); // 時間もリセット
                    setSpeed(0.05); // 速度もリセット
                }

            }, speed);
        }
        return () => clearInterval(interval);
    }, [start, speed, time, items, selectedItem, position]);

    const handleAddItem = () => {
        if (newItem) {
            setItems(prevItems => [...prevItems, newItem]);
            setNewItem("");
            setPosition(-items.length * 50); // アイテムを追加するときに位置をリセット
            setIsZeroItems(false);
        }
    };

    const handleStartStop = () => {
        if (start) {
            setStart(false);
            setSpeed(0.05); // 停止時に速度をリセット
            setTime(0); // 時間もリセット
        } else {
            setStart(true);
        }
    };

    const handleDelete = () => {
        setItems([]);
        setPosition(-items.length * 50); // アイテムを削除するときに位置をリセット
        setIsZeroItems(true);
    }

    const handleRadioChange = (event) => {
        setSelectedItem(event.target.value); // 選択されたアイテムを更新
    };

    // 要素が少ないときに空白ができないようにアイテムを繰り返し、前後に配置
    const repeatedItems = items.length >= 5 ? items : [...items, ...items, ...items];

    return (
        <>
        <Helmet>
            <title>Vertical Roulette</title>
        </Helmet>
        <div className="main">
            <div className="roulette-container">
                <div className="roulette-wrapper">
                    <div className="roulette" style={{transform: `translateY(${position}px)`}}>
                        {repeatedItems.map((item, index) => (
                            <div key={index} className="roulette-item">
                                <span className="roulette-font">{item}</span>
                            </div>
                        ))}
                        {repeatedItems.map((item, index) => (
                            <div key={index + repeatedItems.length} className="roulette-item">
                                <span className="roulette-font">{item}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="controls">
                    <input
                        type="text"
                        value={newItem}
                        onChange={(e) => setNewItem(e.target.value)}
                        placeholder="Add new item"
                        disabled={start || disabled} // ルーレットが回転中は入力不可
                    />
                    <button onClick={handleAddItem} disabled={start || disabled}>Add Item</button>
                    {/* ルーレットが回転中はボタンを無効化 */}
                    <button onClick={handleStartStop}
                            disabled={start || disabled || isZeroItems}>{start ? "Stop" : "Start"} Roulette
                    </button>
                    {/* 回転中はボタンを無効化 */}
                </div>
                <div className="radio-buttons">
                    {items.map((item, index) => (
                        <label key={index}>
                            <input
                                type="radio"
                                value={item}
                                checked={selectedItem === item}
                                onChange={handleRadioChange}
                                disabled={start || disabled || isZeroItems} // ルーレットが回転中はラジオボタンも無効化
                            />
                            {item}
                        </label>
                    ))}
                </div>
                <div className="controls">
                    <button onClick={handleDelete} disabled={start || disabled || isZeroItems}>delete all</button>
                </div>
            </div>
        </div>
        </>
    );
};

export default VerticalRoulette;
