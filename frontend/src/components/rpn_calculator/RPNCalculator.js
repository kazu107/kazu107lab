import React, { useState } from 'react';
import html2canvas from 'html2canvas'; // Added import
import './RPNCalculator.css';

// Operator precedence and associativity
const precedence = {
    '+': 1, '-': 1,
    '*': 2, '/': 2,
    'u-': 3, // Unary minus
    // Functions will be handled by pushing them onto the stack and popping when a ')' or ',' is encountered
};

const associativity = {
    '+': 'L', '-': 'L',
    '*': 'L', '/': 'L',
    'u-': 'R', // Unary minus is right-associative
};

const functions = ['sin', 'max']; // Add other functions like cos, tan, log, sqrt as needed

function tokenize(expression) {
    // Remove whitespace
    expression = expression.replace(/\s+/g, '');
    const tokens = [];
    let i = 0;
    while (i < expression.length) {
        const char = expression[i];
        if (/[0-9.]/.test(char)) { // Number
            let numStr = '';
            while (i < expression.length && /[0-9.]/.test(expression[i])) {
                numStr += expression[i];
                i++;
            }
            tokens.push(parseFloat(numStr));
            continue;
        } else if (/[a-zA-Z_][a-zA-Z0-9_]*/.test(char)) { // Function or variable (for now, assume function)
            let funcName = '';
            while (i < expression.length && /[a-zA-Z0-9_]/.test(expression[i])) {
                funcName += expression[i];
                i++;
            }
            if (functions.includes(funcName)) {
                tokens.push(funcName);
            } else {
                throw new Error(`Unknown function or variable: ${funcName}`);
            }
            continue;
        } else if (['+', '*', '/', '(', ')', ','].includes(char)) {
            tokens.push(char);
        } else if (char === '-') {
            // Handle unary minus:
            // If '-' is at the start of the expression or after '(', ',', or another operator, it's unary.
            if (tokens.length === 0 || ['(', ',', '+', '-', '*', '/'].includes(tokens[tokens.length - 1])) {
                tokens.push('u-'); // Represent unary minus differently
            } else {
                tokens.push('-'); // Binary minus
            }
        } else {
            throw new Error(`Invalid character: ${char}`);
        }
        i++;
    }
    return tokens;
}

function infixToRpn(expression) {
    if (!expression) return [];
    let tokens;
    try {
        tokens = tokenize(expression);
    } catch (e) {
        console.error("Tokenization error:", e.message);
        throw e; // Re-throw to be caught by handleConvert
    }

    const outputQueue = [];
    const operatorStack = [];

    tokens.forEach(token => {
        if (typeof token === 'number') {
            outputQueue.push(token);
        } else if (functions.includes(token)) {
            operatorStack.push(token);
        } else if (token === '(') {
            operatorStack.push(token);
        } else if (token === ')') {
            while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1] !== '(') {
                outputQueue.push(operatorStack.pop());
            }
            if (operatorStack.length === 0 || operatorStack[operatorStack.length - 1] !== '(') {
                throw new Error("Mismatched parentheses: missing '('");
            }
            operatorStack.pop(); // Pop '('
            // If the token before '(' was a function, pop it to output
            if (operatorStack.length > 0 && functions.includes(operatorStack[operatorStack.length - 1])) {
                outputQueue.push(operatorStack.pop());
            }
        } else if (token === ',') { // Argument separator for functions
            while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1] !== '(') {
                outputQueue.push(operatorStack.pop());
            }
            if (operatorStack.length === 0 || operatorStack[operatorStack.length - 1] !== '(') {
                throw new Error("Syntax error with comma or mismatched parentheses");
            }
        } else { // Operator
            const op1 = token;
            while (
                operatorStack.length > 0 &&
                operatorStack[operatorStack.length - 1] !== '(' &&
                (
                    precedence[operatorStack[operatorStack.length - 1]] > precedence[op1] ||
                    (precedence[operatorStack[operatorStack.length - 1]] === precedence[op1] && associativity[op1] === 'L')
                )
            ) {
                outputQueue.push(operatorStack.pop());
            }
            operatorStack.push(op1);
        }
    });

    while (operatorStack.length > 0) {
        const op = operatorStack.pop();
        if (op === '(') {
            throw new Error("Mismatched parentheses: missing ')'");
        }
        outputQueue.push(op);
    }

    return outputQueue;
}

// Helper function to be added to RPNCalculator.js (similar to infixToRpn)
function generateTreeFromRpn(rpnArray) {
    if (!rpnArray || rpnArray.length === 0) return null;

    const stack = [];

    rpnArray.forEach(token => {
        if (typeof token === 'number') {
            stack.push({ value: token, type: 'operand', children: [] });
        } else { // Operator or Function
            let node;
            if (token === 'u-') { // Unary minus
                if (stack.length < 1) throw new Error("Invalid RPN expression for unary operator.");
                const operand = stack.pop();
                node = { value: '-', type: 'operator', children: [operand] }; // Or a special 'unary-' type
            } else if (functions.includes(token)) {
                // For simplicity, assuming functions take a fixed number of arguments or handle it based on name
                // 'sin' takes 1 argument, 'max' takes 2.
                let argCount = 0;
                if (token === 'sin') argCount = 1;
                else if (token === 'max') argCount = 2;
                // Add more functions here if needed

                if (stack.length < argCount) throw new Error(`Invalid RPN expression for function ${token}. Not enough arguments.`);
                const args = [];
                for (let i = 0; i < argCount; i++) {
                    args.unshift(stack.pop()); // Pop in reverse order of appearance
                }
                node = { value: token, type: 'function', children: args };
            } else { // Binary operator (+, -, *, /)
                if (stack.length < 2) throw new Error("Invalid RPN expression for binary operator.");
                const right = stack.pop();
                const left = stack.pop();
                node = { value: token, type: 'operator', children: [left, right] };
            }
            stack.push(node);
        }
    });

    if (stack.length !== 1) {
        // This can happen if the RPN expression is malformed,
        // e.g. too many operands or not enough operators.
        // The infixToRpn should ideally prevent this for valid infix.
        console.error("Malformed RPN resulted in stack size:", stack.length, stack);
        throw new Error("Invalid RPN expression: tree construction failed.");
    }
    return stack[0];
}

// --- Add this new component within RPNCalculator.js or as an import ---

// ExpressionTreeView.js (Simplified SVG Tree Renderer)
const ExpressionTreeView = ({ tree }) => {
    if (!tree) return <p>Enter an expression and click Convert to see the tree.</p>;

    const nodeRadius = 20;
    const levelHeight = 80;
    const siblingGap = 30; // Min gap between nodes at the same level
    const padding = 20;

    // Function to calculate positions and collect nodes/edges
    // This is a very basic layout algorithm.
    const getTreeLayout = (node, depth = 0, xOffset = 0) => {
        if (!node) return { nodes: [], edges: [], width: 0, x: xOffset };

        const elements = { nodes: [], edges: [] };
        let currentX = xOffset;
        let subtreeWidth = 0;

        if (node.children && node.children.length > 0) {
            const childrenLayouts = node.children.map(child => {
                const childLayout = getTreeLayout(child, depth + 1, currentX);
                currentX += childLayout.width + siblingGap;
                return childLayout;
            });

            // Combine children elements
            childrenLayouts.forEach(layout => {
                elements.nodes.push(...layout.nodes);
                elements.edges.push(...layout.edges);
            });
            
            // Calculate parent position (center above children)
            const firstChildX = childrenLayouts[0].x;
            const lastChildX = childrenLayouts[childrenLayouts.length - 1].x;
            const parentX = (firstChildX + lastChildX) / 2;
            
            elements.nodes.push({ ...node, x: parentX, y: depth * levelHeight + nodeRadius + padding, depth });
            
            // Add edges from parent to children
            childrenLayouts.forEach(childLayout => {
                elements.edges.push({
                    x1: parentX,
                    y1: depth * levelHeight + nodeRadius + padding,
                    x2: childLayout.x, // x position of the child's root node
                    y2: (depth + 1) * levelHeight + nodeRadius + padding,
                });
            });
            subtreeWidth = currentX - xOffset - siblingGap; // Total width of this subtree
            return { ...elements, width: Math.max(nodeRadius * 2, subtreeWidth), x: parentX };

        } else { // Leaf node
            const leafX = xOffset + nodeRadius;
            elements.nodes.push({ ...node, x: leafX, y: depth * levelHeight + nodeRadius + padding, depth });
            return { ...elements, width: nodeRadius * 2, x: leafX };
        }
    };
    
    const layout = getTreeLayout(tree);

    // Calculate SVG dimensions
    let maxX = 0;
    let maxY = 0;
    layout.nodes.forEach(n => {
        if (n.x > maxX) maxX = n.x;
        if (n.y > maxY) maxY = n.y;
    });
    const svgWidth = maxX + nodeRadius + padding;
    const svgHeight = maxY + nodeRadius + padding;


    return (
        <svg width={svgWidth > 0 ? svgWidth : 200} height={svgHeight > 0 ? svgHeight : 100} style={{ border: '1px solid #ccc' }}>
            {layout.edges.map((edge, i) => (
                <line key={`edge-${i}`} x1={edge.x1} y1={edge.y1} x2={edge.x2} y2={edge.y2} stroke="black" />
            ))}
            {layout.nodes.map((node, i) => (
                <g key={`node-group-${i}`} transform={`translate(${node.x},${node.y})`}>
                    <circle r={nodeRadius} fill={node.type === 'operand' ? '#lightgreen' : (node.type === 'function' ? '#lightblue' : '#f0f0f0')} stroke="black" />
                    <text textAnchor="middle" y="5" fontSize="12px">{String(node.value)}</text>
                </g>
            ))}
        </svg>
    );
};


function RPNCalculator() {
    const [expression, setExpression] = useState('');
    const [rpn, setRpn] = useState('');
    const [tree, setTree] = useState(null);
    const [error, setError] = useState(''); // For displaying errors

    const handleSaveAsImage = () => {
        const treeContainer = document.querySelector('.tree-visualization svg'); // Target the SVG element directly

        if (!treeContainer) {
            alert("No tree to save!");
            return;
        }

        const originalBackground = treeContainer.style.backgroundColor;
        treeContainer.style.backgroundColor = 'white'; // Temporarily set background for capture

        html2canvas(treeContainer, {
            onclone: (documentClone) => {
                const svgElement = documentClone.querySelector('.tree-visualization svg');
                if (svgElement) {
                    const rect = svgElement.getBoundingClientRect();
                    svgElement.setAttribute('width', String(rect.width));
                    svgElement.setAttribute('height', String(rect.height));
                }
            }
        }).then(canvas => {
            treeContainer.style.backgroundColor = originalBackground; // Restore original background
            const image = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = image;
            link.download = 'expression-tree.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }).catch(err => {
            console.error("Error saving image: ", err);
            alert("Sorry, there was an error saving the image.");
            treeContainer.style.backgroundColor = originalBackground; // Restore original background on error
        });
    };

    const handleConvert = () => {
        setError(''); // Clear previous errors
        setRpn('');
        setTree(null); // Clear previous tree

        if (!expression.trim()) {
            setError("Please enter an expression.");
            return;
        }

        try {
            const rpnResultArray = infixToRpn(expression); 
            setRpn(rpnResultArray.join(' '));

            const treeData = generateTreeFromRpn(rpnResultArray);
            setTree(treeData); 

        } catch (e) {
            console.error("Conversion or Tree generation error:", e.message);
            setError(`Error: ${e.message}`);
            setRpn('');
            setTree(null);
        }
    };

    return (
        <div className="rpn-calculator">
            <h2>RPN Calculator and Tree Visualizer</h2>
            {error && <div className="error-message" style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
            <div className="input-section">
                <input
                    type="text"
                    value={expression}
                    onChange={(e) => setExpression(e.target.value)}
                    placeholder="Enter infix expression (e.g., 5 + 3 * (4 - 1))"
                />
                <button onClick={handleConvert}>Convert</button>
                <button onClick={handleSaveAsImage} style={{marginLeft: '10px'}}>Save as Image</button> {/* Added button */}
            </div>
            <div className="output-section">
                <div className="rpn-output">
                    <h3>Reverse Polish Notation (RPN):</h3>
                    <pre>{rpn}</pre>
                </div>
                <div className="tree-visualization">
                    <h3>Expression Tree:</h3>
                    <ExpressionTreeView tree={tree} />
                </div>
            </div>
        </div>
    );
}

export default RPNCalculator;
