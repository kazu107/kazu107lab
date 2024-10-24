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
    const [Chartmaxprob, setChartMaxprob] = useState({});
    const [data2, setData2] = useState([]);
    const [chartData, setChartData] = useState([]);

    // カラーコードの配列を定義
    const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#ff0000', '#00ff00', '#0000ff'];

    // 確率の変更
    const probChange = (e) => {
        setProbability(parseFloat(e.target.value));
    };

    // 数値の変更
    const numChange = (e) => {
        setValue(parseFloat(e.target.value));
    };

    // 確率pをn回試行したときに少なくともm回成功する確率を計算
    const atLeast = (n, m, p) => {
        let prob = 0;
        for (let k = m; k <= n; k++) {
            prob += binomialProbability(n, k, p);
        }
        return prob;
    };

    const binomialProbability = (n, k, p) => {
        const comb = combinations(n, k);
        const prob = comb * Math.pow(p, k) * Math.pow(1 - p, n - k);
        return prob;
    };

    const combinations = (n, k) => {
        if (k > n) return 0;
        if (k === 0 || k === n) return 1;
        let result = 1;
        for (let i = 1; i <= k; i++) {
            result *= n - (k - i);
            result /= i;
        }
        return result;
    };


    // データの計算
    React.useEffect(() => {
        const p = probability / 100.0;
        const newData = [];
        for (let n = 1; n <= value; n++) {
            const item = { x: n, y: 1 - Math.pow(1 - p, n) };
            //console.log(item.y);
            setMaxprob(item.y);
            chartData.forEach((data) => {
                const m = data.value;
                const key = `y${m}`;
                item[key] = atLeast(n, m, p);
                setChartMaxprob({ ...Chartmaxprob, [key]: item[key] });
            });
            newData.push(item);
        }
        setData2(newData);
    }, [probability, value, chartData]);// probability と value が変更されるたびに再計算

    // Tooltip のフォーマット
    const tooltipFormatter = (value, name, props) => {
        const percentage = (value * 100).toFixed(3); // 小数第3位にフォーマット
        const n = props.payload.x; // n回目の情報
        return [`${percentage}%`, `(${name}, ${n}回目)`];
    };

    // Y軸のカスタムフォーマッタ (100倍して % 表記に変換)
    const yAxisTickFormatter = (tick) => {
        return `${(tick * 100).toFixed(3)}%`; // 100倍して整数にし、% をつけて返す
    };

    // label を非表示にする
    const labelFormatter = () => {
        return ""; // labelを表示しないようにする
    };

    // Addボタンを押したときの処理
    const handleAdd = () => {
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        setChartData([...chartData, {value: 1, color: randomColor }]);
    };


    // deleteボタンを押したときの処理
    const handleDelete = (index) => {
        const newChartData = chartData.filter((_, i) => i !== index);
        setChartData(newChartData);
    };


    //　テキストボックスを変更したときの処理
    const handleChange = (index, e) => {
        const newValue = parseInt(e.target.value);
        const newChartData = chartData.map((data, i) => {
            if (i === index) {
                return { value: newValue };
            } else {
                return data;
            }
        });
        setChartData(newChartData);
    };

    // カラーコードを変更したときの処理
    const handleColorChange = (index, e) => {
        const newColor = e.target.value;
        const newChartData = chartData.map((data, i) => {
            if (i === index) {
                return { ...data, color: newColor };
            } else {
                return data;
            }
        });
        setChartData(newChartData);
    };

    // 追加したチャートのコンフィグ
    const AddedChart = chartData.map((data, index) => {
        const probNum = Chartmaxprob[`y${data.value}`] !== undefined ? ((Chartmaxprob[`y${data.value}`]) * 100).toFixed(3) : 0;
        return (
            <div className={"ChartConfigContainer"} key={data.id}>
                <span>at least</span>
                <input
                    type="number"
                    value={data.value}
                    onChange={(e) => handleChange(index, e)}
                    className="smallInput"
                    min="1"
                    max={value}
                    step="1"
                />
                <span>times</span>
                {/* カラーコード入力欄を追加 */}
                <input
                    type="color"
                    value={data.color}
                    onChange={(e) => handleColorChange(index, e)}
                    className="colorInput"
                />
                <a id="not-clickable">◕‿‿◕</a>
                <a>{probNum}%</a>
                <Tooltip anchorSelect="#not-clickable">
                    <button>You can't click me :(</button>
                </Tooltip>
                <span className="DeleteButton" onClick={() => handleDelete(index)}>×</span>
            </div>
        );
    });

    //　追加したチャートのグラフ
    const AddedLine = chartData.map((data, index) => {
        return (
            <Line
                key={data.id}
                type="monotone"
                dataKey={`y${data.value}`}
                stroke={data.color}
            />
        );
    });


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
                    <a>{(maxprob * 100).toFixed(3)}%</a>
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
                        {AddedLine}
                    </LineChart>
                </ResponsiveContainer>
                <div className={"AddChartContainer"}>
                    <span className="AddButton" onClick={handleAdd}>＋</span>
                    <span>Add Chart</span>
                </div>
                {AddedChart}
            </div>
        </>
    );
};

export default MyLineChart;
