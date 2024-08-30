import React, { useState, useEffect, useRef } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import './markov.css';

const CytoscapeGraph = () => {
  const [elements, setElements] = useState([
    { data: { id: 'special-node', label: 'Hello' }, position: { x: 100, y: 200 } },
    { data: { id: 'my', label: 'My' }, position: { x: 300, y: 100 } },
    { data: { id: 'new', label: 'New' }, position: { x: 300, y: 300 } },
    { data: { id: 'world', label: 'World!' }, position: { x: 500, y: 200 } },
    { data: { source: 'special-node', target: 'my', label: '0.50' } },
    { data: { source: 'special-node', target: 'new', label: '0.50' } },
    { data: { source: 'my', target: 'world', label: '1.00' } },
    { data: { source: 'new', target: 'world', label: '1.00' } },
  ]);

  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedEdges, setSelectedEdges] = useState([]);
  const [nodeLabel, setNodeLabel] = useState('');
  const [nodeErrors, setNodeErrors] = useState({}); // ノードのエラーステータスを保存
  const [noOutgoingEdges, setNoOutgoingEdges] = useState({}); // エッジがないノードを保存
  const [edgeLabels, setEdgeLabels] = useState({}); // エッジのラベルを管理
  const [transitionSpeed, setTransitionSpeed] = useState(1000); // ミリ秒単位での速度
  const [markovChainLog, setMarkovChainLog] = useState(''); // マルコフ連鎖のログ
  const [currentNodeId, setCurrentNodeId] = useState(null); // 現在遷移しているノードのID
  const [isRunning, setIsRunning] = useState(false); // 遷移中かどうかを管理
  const [isModalOpen, setIsModalOpen] = useState(false); // モーダルウィンドウの表示状態
  const [importText, setImportText] = useState(''); // インポートテキスト
  const [addSpace, setAddSpace] = useState(true); // 出力に空白を入れるかどうか
  const logTextareaRef = useRef(null); // テキストエリアへの参照
  const intervalIdRef = useRef(null); // intervalIdをuseRefで管理

  const cyRef = useRef(null);

  useEffect(() => {
    const cy = cyRef.current;
    if (cy) {
      const handleNodeClick = (event) => {
        if (!isRunning) {
          event.stopPropagation(); // イベントのバブリングを止める
          const node = event.target;
          handleNodeSelection(node);
        }
      };

      const handleBackgroundClick = (event) => {
        if (!isRunning && event.target === cy) { // 背景がクリックされたときのみ選択を解除
          setSelectedNode(null);
          setSelectedEdges([]);
        }
      };

      cy.on('tap', 'node', handleNodeClick);
      cy.on('tap', handleBackgroundClick); // バックグラウンドをクリックしたときに選択を解除

      return () => {
        cy.off('tap', 'node', handleNodeClick);
        cy.off('tap', handleBackgroundClick);
      };
    }
  }, [selectedNode, elements, isRunning]);

  // エッジの数値合計をチェックして、ノードのラベル色を変更する
  useEffect(() => {
    const newErrors = {};
    const noEdges = {};
    const cy = cyRef.current;
    if (cy) {
      cy.nodes().forEach(node => {
        const outgoingEdges = node.connectedEdges().filter(edge => edge.data('source') === node.id());
        const total = outgoingEdges.reduce((sum, edge) => sum + parseFloat(edge.data('label')), 0);
        if (total.toFixed(2) !== '1.00') {
          newErrors[node.id()] = true;
        }
        if (outgoingEdges.length === 0) {
          noEdges[node.id()] = true;
        }
      });
    }
    setNodeErrors(newErrors);
    setNoOutgoingEdges(noEdges);
  }, [elements]);

  const handleNodeSelection = (node) => {
    if (!isRunning && selectedNode) {
      // 重複チェック（自己ループも許可）
      const existingEdge = elements.find(
          (el) => el.data.source === selectedNode.id() && el.data.target === node.id()
      );

      if (!existingEdge) {
        const newEdgeId = `edge-${selectedNode.id()}-${node.id()}`;
        const newEdge = {
          data: {
            id: newEdgeId,
            source: selectedNode.id(),
            target: node.id(),
            label: "0.50",
          },
        };
        setElements((prev) => [...prev, newEdge]);
      }
      setSelectedNode(null);
      setSelectedEdges([]);
    } else {
      setSelectedNode(node);
      setNodeLabel(node.data('label'));

      const outgoingEdges = node.connectedEdges().filter(edge => edge.data('source') === node.id()).map(edge => {
        const sourceNode = cyRef.current.$(`#${edge.data('source')}`).data('label');
        const targetNode = cyRef.current.$(`#${edge.data('target')}`).data('label');
        return {
          id: edge.id(),
          source: edge.data('source'),
          target: edge.data('target'),
          label: edge.data('label'),
          sourceLabel: sourceNode,
          targetLabel: targetNode,
        };
      });
      setSelectedEdges(outgoingEdges);

      const initialEdgeLabels = {};
      outgoingEdges.forEach(edge => {
        initialEdgeLabels[edge.id] = edge.label;
      });
      setEdgeLabels(initialEdgeLabels);
    }
  };

  const handleNodeLabelChange = (e) => {
    const newLabel = e.target.value;
    setNodeLabel(newLabel);

    setElements((prevElements) =>
        prevElements.map((el) =>
            el.data.id === selectedNode.id() ? { ...el, data: { ...el.data, label: newLabel } } : el
        )
    );
  };

  const handleEdgeLabelChange = (e, edgeId) => {
    let newLabel = parseFloat(e.target.value);

    // 0.00から1.00の範囲に制限
    if (newLabel < 0) newLabel = 0;
    if (newLabel > 1) newLabel = 1;

    // 小数点以下2桁までにフォーマット
    newLabel = newLabel.toFixed(2);

    setEdgeLabels((prevLabels) => ({
      ...prevLabels,
      [edgeId]: newLabel,
    }));

    setElements((prevElements) =>
        prevElements.map((el) =>
            el.data.id === edgeId ? { ...el, data: { ...el.data, label: newLabel } } : el
        )
    );
  };

  const addNode = () => {
    if (!isRunning) {
      const newNodeId = `node-${elements.length}`;
      const newNode = { data: { id: newNodeId, label: `Node ${elements.length}` } };
      setElements([...elements, newNode]);
    }
  };

  const deleteNode = (nodeId) => {
    setElements((prevElements) => prevElements.filter(el => el.data.id !== nodeId && el.data.source !== nodeId && el.data.target !== nodeId));
    setSelectedNode(null);
    setSelectedEdges([]);
  };

  const deleteEdge = (edgeId) => {
    setElements((prevElements) => prevElements.filter(el => el.data.id !== edgeId));
  };

  const startMarkovChain = () => {
    if (isRunning) return;

    setIsRunning(true); // 遷移中に設定
    const cy = cyRef.current;
    if (!cy) return;

    let currentNode = cy.$('#special-node');
    setCurrentNodeId(currentNode.id()); // 初期ノードを設定
    setMarkovChainLog(currentNode.data('label') + (addSpace ? ' ' : '')); // 最初のノードを出力

    const runMarkovChain = () => {
      if (currentNode) {
        const outgoingEdges = currentNode.connectedEdges().filter(edge => edge.data('source') === currentNode.id());
        if (outgoingEdges.length > 0) {
          const probabilities = outgoingEdges.map(edge => parseFloat(edge.data('label')));
          const total = probabilities.reduce((acc, prob) => acc + prob, 0);
          const random = Math.random() * total;

          let cumulative = 0;
          for (let i = 0; i < outgoingEdges.length; i++) {
            cumulative += probabilities[i];
            if (random <= cumulative) {
              currentNode = cy.$(`#${outgoingEdges[i].data('target')}`);
              setCurrentNodeId(currentNode.id()); // 遷移ノードを更新
              setMarkovChainLog((prevLog) => prevLog + currentNode.data('label') + (addSpace ? ' ' : ''));
              break;
            }
          }
        } else {
          stopMarkovChain(); // 遷移先がない場合に停止
        }
      }
    };

    const id = setInterval(runMarkovChain, transitionSpeed);
    intervalIdRef.current = id; // intervalIdをuseRefで管理
  };

  const stopMarkovChain = () => {
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current); // インターバルをクリアして停止
      intervalIdRef.current = null;
      setIsRunning(false); // 遷移終了
      setCurrentNodeId(null); // 現在のノード選択を解除
    }
  };

  const clearLog = () => {
    setMarkovChainLog('');
  };

  const copyToClipboard = () => {
    if (logTextareaRef.current) {
      logTextareaRef.current.select();
      document.execCommand('copy');
    }
  };

  const exportGraph = () => {
    const cy = cyRef.current;
    if (cy) {
      const elements = cy.elements().jsons(); // フラットなelements配列を取得
      const jsonString = JSON.stringify(elements, null, 2);
      navigator.clipboard.writeText(jsonString);
    }
  };

  const importGraph = () => {
    try {
      const importedElements = JSON.parse(importText);

      // importedElementsが配列かどうかを確認
      if (Array.isArray(importedElements)) {
        setElements(importedElements);
        setIsModalOpen(false); // モーダルを閉じる
      } else {
        alert('Invalid format: The imported data should be an array.');
      }
    } catch (error) {
      alert('Invalid JSON format.');
    }
  };

  const handleSpeedChange = (e) => {
    const speed = parseInt(e.target.value, 10);
    if (!isNaN(speed) && speed > 0) {
      setTransitionSpeed(speed);
    }
  };

  return (
      <div className="cyto-container">
        <div className="cyto-graph-container">
          <CytoscapeComponent
              elements={elements}
              stylesheet={[
                {
                  selector: 'node',
                  style: {
                    label: 'data(label)',
                    'text-valign': 'top',
                    'text-halign': 'center',
                    'text-margin-y': '-10px',
                    shape: 'ellipse', // デフォルトのノード形状（丸形）
                    'border-width': 2,
                    'border-color': (ele) => ele.id() === currentNodeId ? 'green' : 'black', // 現在のノードのふちを緑に
                    'color': (ele) => noOutgoingEdges[ele.id()]
                        ? 'blue'
                        : nodeErrors[ele.id()]
                            ? 'red'
                            : 'black', // エラーやエッジがないノードのラベル色を変更
                  }
                },
                {
                  selector: 'node[id="special-node"]',
                  style: {
                    shape: 'rectangle', // 特別なノードの形状（四角形）
                    'background-color': '#f00', // 任意で色も変更可能
                  }
                },
                {
                  selector: 'edge',
                  style: {
                    'curve-style': 'bezier',
                    'target-arrow-shape': 'triangle',
                    'arrow-scale': 1.5,
                    'line-color': '#ccc',
                    'target-arrow-color': '#ccc',
                    'label': 'data(label)',
                    'font-size': '10px',
                    'text-margin-y': '-10px',
                    'text-rotation': 'autorotate',
                  }
                },
                {
                  selector: 'edge[source = target]', // 自己ループのエッジ
                  style: {
                    'curve-style': 'loop',
                    'control-point-step-size': 40, // ループの大きさを調整
                  }
                }
              ]}
              className="cyto-cytoscape-graph"
              cy={(cy) => (cyRef.current = cy)}
              layout={{ name: 'preset' }} // レイアウトをプリセットに設定
              userZoomingEnabled={!isRunning} // ズームを無効に
              userPanningEnabled={!isRunning} // パンを無効に
              boxSelectionEnabled={!isRunning} // ボックス選択を無効に
              wheelSensitivity={0.1} // マウスホイールでの拡大縮小を細かく
          />
        </div>

        <div className="cyto-sidebar">
          <div className="cyto-button-container">
            <button onClick={addNode} className="cyto-add-button" disabled={isRunning}>Add Node</button>
            <button onClick={startMarkovChain} className="cyto-start-button" disabled={isRunning}>Start</button>
            <button onClick={stopMarkovChain} className="cyto-stop-button">Stop</button>
            <div className="cyto-speed-container">
              <label htmlFor="transition-speed">Interval: </label>
              <input
                  type="number"
                  id="transition-speed"
                  value={transitionSpeed}
                  onChange={handleSpeedChange}
                  className="cyto-speed-input"
                  disabled={isRunning}
              />
              <span> ms</span>
            </div>
          </div>

          {selectedNode && (
              <div className="cyto-info-container">
                <h3>Selected Node</h3>
                <div className="cyto-info-header">
                  <label>
                    Node Label:
                    <input
                        type="text"
                        value={nodeLabel}
                        onChange={handleNodeLabelChange}
                        disabled={isRunning}
                    />
                  </label>
                  <button className="cyto-delete-button" onClick={() => deleteNode(selectedNode.id())} disabled={isRunning}>✖</button>
                </div>

                <h3>Connected Edges</h3>
                {selectedEdges.map(edge => (
                    <div key={edge.id} className="cyto-info-header">
                      <label>
                        Edge from <strong>{edge.sourceLabel}</strong> to <strong>{edge.targetLabel}</strong>:
                        <input
                            type="number"
                            step="0.01"
                            min="0.00"
                            max="1.00"
                            value={edgeLabels[edge.id]}
                            onChange={(e) => handleEdgeLabelChange(e, edge.id)}
                            disabled={isRunning}
                        />
                      </label>
                      <button className="cyto-delete-button" onClick={() => deleteEdge(edge.id)} disabled={isRunning}>✖</button>
                    </div>
                ))}
              </div>
          )}
        </div>

        <div className="cyto-log-container">
          <div className="cyto-log-header">
            <button onClick={clearLog} className="cyto-log-button">Clear</button>
            <label className="cyto-toggle-label">
              <input
                  type="checkbox"
                  checked={addSpace}
                  onChange={() => setAddSpace(!addSpace)}
              />
              Add Space
            </label>
            <button onClick={copyToClipboard} className="cyto-log-button">Copy</button>
            <button onClick={exportGraph} className="cyto-log-button">Export</button>
            <button onClick={() => setIsModalOpen(true)} className="cyto-log-button">Import</button>
          </div>
          <textarea
              ref={logTextareaRef}
              value={markovChainLog}
              readOnly
              className="cyto-log-textarea"
              placeholder="Markov Chain Log"
          />
        </div>

        {isModalOpen && (
            <div className="cyto-modal">
              <div className="cyto-modal-content">
            <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="Paste JSON here"
                className="cyto-import-textarea"
            />
                <button onClick={importGraph} className="cyto-modal-button">Import</button>
                <button onClick={() => setIsModalOpen(false)} className="cyto-modal-button">Cancel</button>
              </div>
            </div>
        )}
      </div>
  );
};

export default CytoscapeGraph;
