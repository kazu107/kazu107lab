import React, { useState, useRef, useEffect } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import cytoscape from 'cytoscape';
import './markov.css';

function Markov() {
  const [elements, setElements] = useState([]);
  const [matrix, setMatrix] = useState([]);
  const [initialState, setInitialState] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const cyRef = useRef(null);

  const addNode = () => {
    const id = `n${elements.length}`;
    const newNode = { data: { id, label: id }, position: { x: Math.random() * 500, y: Math.random() * 500 } };
    setElements((prevElements) => [...prevElements, newNode]);
    setMatrix((prevMatrix) => [...prevMatrix, new Array(prevMatrix.length + 1).fill(0)]);
    setMatrix((prevMatrix) => prevMatrix.map(row => [...row, 0]));
    setInitialState((prevInitialState) => [...prevInitialState, 0]);
  };

  useEffect(() => {
    if (cyRef.current) {
      cyRef.current.on('tap', 'node', (event) => handleNodeClick(event.target));
    }
  }, [elements]);

  const handleNodeClick = (node) => {
    if (selectedNode) {
      if (selectedNode !== node.id()) {
        addEdge(selectedNode, node.id(), 0.5); // デフォルトの遷移確率を0.5に設定
      }
      setSelectedNode(null);
    } else {
      setSelectedNode(node.id());
    }
  };

  const addEdge = (source, target, probability) => {
    const edgeExists = elements.some(
        (el) => el.data.source === source && el.data.target === target
    );
    if (!edgeExists) {
      const newEdge = { data: { source, target, label: probability.toString() } };
      setElements((prevElements) => [...prevElements, newEdge]);
      updateMatrix(source, target, probability);
    }
  };

  const updateMatrix = (source, target, probability) => {
    const sourceIndex = parseInt(source.substring(1));
    const targetIndex = parseInt(target.substring(1));
    let newMatrix = [...matrix];
    newMatrix[sourceIndex][targetIndex] = probability;
    setMatrix(newMatrix);
  };

  const handleInitialStateChange = (index, value) => {
    let newInitialState = [...initialState];
    newInitialState[index] = parseFloat(value);
    setInitialState(newInitialState);
  };

  const runMarkovChain = () => {
    let state = [...initialState];
    const steps = 10;
    const history = [state];

    for (let step = 0; step < steps; step++) {
      let newState = new Array(state.length).fill(0);
      for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[i].length; j++) {
          newState[j] += state[i] * matrix[i][j];
        }
      }
      state = newState;
      history.push([...state]);
    }
    console.log('Markov Chain History:', history);
  };

  return (
      <div className="container">
        <div className="graph">
          <CytoscapeComponent
              elements={elements}
              style={{ width: '100%', height: '100%' }}
              cy={(cy) => { cyRef.current = cy; }}
              layout={{ name: 'preset' }}
          />
        </div>
        <div className="sidebar">
          <button onClick={addNode}>Add Node</button>
          <button onClick={runMarkovChain}>Run Markov Chain</button>
          <h3>Nodes</h3>
          {initialState.map((value, index) => (
              <div key={index}>
                <label>Node {index} Initial Probability:</label>
                <input
                    type="number"
                    value={value}
                    onChange={(e) => handleInitialStateChange(index, e.target.value)}
                />
              </div>
          ))}
          <h3>Edges</h3>
          {elements.filter(el => el.data.source && el.data.target).map((edge, index) => (
              <div key={index}>
                <p>Edge from {edge.data.source} to {edge.data.target} with probability {edge.data.label}</p>
              </div>
          ))}
        </div>
      </div>
  );
}

export default Markov;
