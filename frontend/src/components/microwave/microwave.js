import React, { useState, useEffect } from 'react';
import Draggable from "react-draggable";
import './microwave.css';

function Microwave() {
    return (
        <>
            <div className="main">
                <div className={"compares"}>
                    <MyComponent canAdd={true} initialValue={{
                        first: 1,
                        second: 500,
                        thirdMinutes: 2,
                        thirdSeconds: 30,
                    }}/>
                </div>
            </div>
        </>
    );
}

const MyComponent = ({canAdd, initialValue}) => {
    // base values
    const [values, setValues] = useState({
        first: initialValue.first,
        second: initialValue.second,
        thirdMinutes: initialValue.thirdMinutes,
        thirdSeconds: initialValue.thirdSeconds,
    });
    // added comparing values
    const [compare, setCompare] = useState(
        [
            {
                first: initialValue.first,
                second: initialValue.second,
                thirdMinutes: initialValue.thirdMinutes,
                thirdSeconds: initialValue.thirdSeconds,
            }
        ]
    );

    // update comparison values when base values change
    useEffect(() => {
        const curValue = values;
        const Joules = curValue.second * (curValue.thirdMinutes * 60 + curValue.thirdSeconds) / curValue.first;

        const newCompare = compare.map((item) => {
            const newTime = Joules * item.first / item.second;
            const newMinutes = parseInt(newTime / 60);
            const newSeconds = parseInt(newTime % 60);
            return {
                first: item.first,
                second: item.second,
                thirdMinutes: newMinutes,
                thirdSeconds: newSeconds,
            };
        });
        setCompare(newCompare);
    }, [values]);

    // input change handler
    const handleChange = (e) => {
        const { name, value } = e.target;
        const compareName = name.slice(0, 4);
        if (compareName === "Main") { // base values
            setValues({
                ...values,
                [name.slice(4)]: value,
            });
        } else { // comparing values
            const index = parseInt(name.slice(-1));
            const field = name.slice(0, -2);
            const newCompare = [...compare];
            const item = newCompare[index - 1];

            if (field === "first" || field === "second") {
                // Update time based on amount or wattage change
                item[field] = parseInt(value, 10);
                const Joules = values.second * (values.thirdMinutes * 60 + values.thirdSeconds) / values.first;
                const newTime = Joules * item.first / item.second;
                item.thirdMinutes = parseInt(newTime / 60);
                item.thirdSeconds = parseInt(newTime % 60);
            } else if (field === "thirdMinutes" || field === "thirdSeconds") {
                // Update wattage based on time change
                item[field] = parseInt(value, 10);
                const totalSeconds = item.thirdMinutes * 60 + item.thirdSeconds;
                const Joules = values.second * (values.thirdMinutes * 60 + values.thirdSeconds) / values.first;
                item.second = Math.round(Joules * item.first / totalSeconds);
            }

            newCompare[index - 1] = { ...item };
            setCompare(newCompare);
        }
    };

    // close button action
    const handleClose = (index) => {
        const newCompare = [...compare];
        newCompare.splice(index - 1, 1);
        setCompare(newCompare);
    };

    // add button action
    const handleAdd = () => {
        const curValue = values;
        const Joules = curValue.second * (curValue.thirdMinutes * 60 + curValue.thirdSeconds) / curValue.first;
        const newWattage = (Math.floor(Math.random() * 10) + 1) * 200;
        const newTime = Joules / newWattage;
        const newMinutes = parseInt(newTime / 60);
        const newSeconds = parseInt(newTime % 60);
        const newCompare = [...compare];
        newCompare.push({
            first: 1,
            second: newWattage,
            thirdMinutes: newMinutes,
            thirdSeconds: newSeconds,
        });
        setCompare(newCompare);
    };

    // comparison values
    const comparison = compare.map((item, index) => {
        return (
            <Draggable key={index+1} cancel=".row, .closeButton">
                <div>
                    <div className="sub-container">
                        <div className="header">
                            <span>comparison#{index+1}</span>
                            <span className="closeButton" onClick={() => handleClose(index)}>X</span>
                        </div>
                        <div className="row">
                            <span>amount:</span>
                            <input
                                type="number"
                                name={`first_${index + 1}`}
                                value={item.first}
                                onChange={handleChange}
                                className="smallInput"
                                min="0"
                            />
                        </div>
                        <div className="row">
                            <span>wattage:</span>
                            <input
                                type="number"
                                name={`second_${index + 1}`}
                                value={item.second}
                                onChange={handleChange}
                                className="input"
                                step="50"
                                min="0"
                            />
                            <span>W</span>
                        </div>
                        <div className="row">
                            <span>time:</span>
                            <input
                                type="number"
                                name={`thirdMinutes_${index + 1}`}
                                value={item.thirdMinutes}
                                onChange={handleChange}
                                className="smallInput"
                                min="0"
                            />
                            <span>m</span>
                            <input
                                type="number"
                                name={`thirdSeconds_${index + 1}`}
                                value={item.thirdSeconds}
                                onChange={handleChange}
                                className="smallInput"
                                min="0"
                            />
                            <span>s</span>
                        </div>
                    </div>
                </div>
            </Draggable>
        );
    });

    return (
        <>
            <Draggable cancel=".row, .closeButton">
                <div className="container">
                    <div className="header">
                        <span>Base</span>
                        <span className="AddButton" onClick={handleAdd}>＋</span>
                    </div>
                    <div className="row">
                        <span>amount:</span>
                        <input
                            type="number"
                            name="Mainfirst"
                            value={values.first}
                            onChange={handleChange}
                            className="smallInput"
                            min="0"
                        />
                    </div>
                    <div className="row">
                        <span>wattage:</span>
                        <input
                            type="number"
                            name="Mainsecond"
                            value={values.second}
                            onChange={handleChange}
                            className="input"
                            step="50"
                            min="0"
                        />
                        <span>W</span>
                    </div>
                    <div className="row">
                        <span>time:</span>
                        <input
                            type="number"
                            name="MainthirdMinutes"
                            value={values.thirdMinutes}
                            onChange={handleChange}
                            className="smallInput"
                            min="0"
                        />
                        <span>m</span>
                        <input
                            type="number"
                            name="MainthirdSeconds"
                            value={values.thirdSeconds}
                            onChange={handleChange}
                            className="smallInput"
                            min="0"
                        />
                        <span>s</span>
                    </div>
                </div>
            </Draggable>
            {comparison}
        </>
    );
};

export default Microwave;
