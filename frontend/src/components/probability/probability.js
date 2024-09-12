import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FaQuestionCircle } from 'react-icons/fa'; // アイコンライブラリ
import { Helmet } from 'react-helmet';
import ReactTooltip from 'react-tooltip'; // ツールチップライブラリ
import './probability.css';

const MyLineChart = () => {
    const [value, setValue] = useState(100.0);
    const [probability, setProbability] = useState(1.0);
    const [maxprob, setMaxprob] = useState(100.0);
    const [data2, setData2] = useState([]);

    const probChange = (e) => {
        setProbability(parseFloat(e.target.value));
    };

    const numChange = (e) => {
        setValue(parseFloat(e.target.value));
    };

    React.useEffect(() => {
        let p = 1.0 - probability / 100.0;  // 確率の計算
        let p2 = 1.0 - probability / 100.0;  // 確率の計算
        const newData = [];
        for (let i = 0; i < value; i++) {
            newData.push({ x: i + 1, y: 1.0 - p2 });
            if (i === value - 1) {
                setMaxprob(p2 * 100.0);
            }
            p2 *= p;  // 確率の変化を計算
        }
        setData2(newData);
    }, [probability, value]);  // probability と value が変更されるたびに再計算

    // Tooltip のフォーマット
    const tooltipFormatter = (value, name, props) => {
        const percentage = (value * 100).toFixed(3); // 小数第3位にフォーマット
        const n = props.payload.x; // n回目の情報
        return [`${percentage}%`, `${n}回目`];
    };

    // Y軸のカスタムフォーマッタ (100倍して % 表記に変換)
    const yAxisTickFormatter = (tick) => {
        return `${(tick * 100).toFixed(3)}%`; // 100倍して整数にし、% をつけて返す
    };

    // label を非表示にする
    const labelFormatter = () => {
        return ""; // labelを表示しないようにする
    };

    return (
        <>
            <Helmet>
                <title>Gacha Simulator</title>
            </Helmet>
            <div className={"prob-main"}>
                <div className={"prob-container"}>
                    <input
                        type="number"
                        value={probability}
                        onChange={probChange}
                        className="smallInput"
                        min="0.0"
                        max="100.0"
                        step="0.01"
                    />
                    <span>%</span>
                    <input
                        type="number"
                        value={value}
                        onChange={numChange}
                        className="smallInput"
                        min="1"
                    />
                    <span>回</span>
                    <a id="not-clickable">◕‿‿◕</a>
                    <a>{(100.0 - maxprob).toFixed(3)}%</a>
                    <Tooltip anchorSelect="#not-clickable">
                        <button>You can't click me :(</button>
                    </Tooltip>
                </div>
                <h3>Probability</h3>
                <ResponsiveContainer width="50%" height={400}>
                    <LineChart
                        width={500}
                        height={300}
                        data={data2}
                        margin={{
                            top: 5, right: 30, left: 20, bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3"/>
                        <XAxis dataKey="x" domain={['auto', 'auto']} type="number"/>
                        <YAxis dataKey="y" domain={['auto', 'auto']} type="number" tickFormatter={yAxisTickFormatter}/>
                        <Tooltip formatter={tooltipFormatter} labelFormatter={labelFormatter}/>
                        <Legend/>
                        <Line type="monotone" dataKey="y" stroke="#8884d8"/>
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </>
    );
};

export default MyLineChart;
