// サンプルの都市座標データ（ランダム生成などで用意可能）
const cities = [
    {x: 565, y: 575}, {x: 25, y: 185}, {x: 345, y: 750}, {x: 945, y: 685}, {x: 845, y: 655},
    {x: 880, y: 660}, {x: 25, y: 230}, {x: 525, y: 1000}, {x: 580, y: 1175}, {x: 650, y: 1130},
    {x: 1605, y: 620}, {x: 1220, y: 580}, {x: 1465, y: 200}, {x: 1530, y: 5}, {x: 845, y: 680},
    {x: 725, y: 370}, {x: 145, y: 665}, {x: 415, y: 635}, {x: 510, y: 875}, {x: 560, y: 365},
    {x: 300, y: 465}, {x: 520, y: 585}, {x: 480, y: 415}, {x: 835, y: 625}, {x: 975, y: 580},
    {x: 1215, y: 245}, {x: 1320, y: 315}, {x: 1250, y: 400}, {x: 660, y: 180}, {x: 410, y: 250},
    {x: 420, y: 555}, {x: 575, y: 665}, {x: 1150, y: 1160}, {x: 700, y: 580}, {x: 685, y: 595},
    {x: 685, y: 610}, {x: 770, y: 610}, {x: 795, y: 645}, {x: 720, y: 635}, {x: 760, y: 650},
    {x: 475, y: 960}, {x: 95, y: 260}, {x: 875, y: 920}, {x: 700, y: 500}, {x: 555, y: 815},
    {x: 830, y: 485}, {x: 1170, y: 65}, {x: 830, y: 610}, {x: 605, y: 625}, {x: 595, y: 360},
];

// パラメータ
const POP_SIZE = 20;     // 集団サイズ
const ELITE_COUNT = 4;    // エリート保存数
const MUTATION_RATE = 0.2;// 突然変異率
const MAX_GEN = 10000000;      // 最大世代

// 距離計算（ユークリッド距離）
function distance(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}

// 経路の総距離を計算
function totalDistance(route) {
    let dist = 0;
    for (let i = 0; i < route.length; i++) {
        const from = cities[route[i]];
        const to = cities[route[(i + 1) % route.length]];
        dist += distance(from, to);
    }
    return dist;
}

// 初期個体生成
function createIndividual() {
    const route = [];
    for (let i = 0; i < cities.length; i++) {
        route.push(i);
    }
    // シャッフル
    for (let i = route.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [route[i], route[j]] = [route[j], route[i]];
    }
    return route;
}

// 初期集団生成
function initialPopulation() {
    const population = [];
    for (let i = 0; i < POP_SIZE; i++) {
        population.push(createIndividual());
    }
    return population;
}

// 評価（距離を計算し適合度を返す：距離が小さいほど適合度が高いとしたいが、GAでは大きい方が適合度が有利）
// よって適合度は1 / distanceとする。
function fitness(individual) {
    return 1 / totalDistance(individual);
}

// 集団を適合度でソート（小さい距離＝高い適合度）
function sortByFitness(population) {
    return population.slice().sort((a, b) => {
        return totalDistance(a) - totalDistance(b);
    });
}

// ランキング選択
// 個体を適合度が高い順に並べて順位付けし、順位に応じた確率で選択する。
// ここでは単純に、ランク1に最も高い確率、ランクNに最も低い確率を与える方式とする。
function rankingSelection(population) {
    const sorted = sortByFitness(population);
    const ranks = sorted.map((_, i) => i + 1);
    const totalRankSum = ranks.reduce((acc, r) => acc + r, 0);
    const pick = Math.random() * totalRankSum;
    let runningSum = 0;
    for (let i = 0; i < ranks.length; i++) {
        runningSum += ranks[i];
        if (runningSum >= pick) {
            return sorted[i];
        }
    }
    return sorted[sorted.length - 1];
}

// サイクル交叉（Cycle Crossover: CX）
// 親P1, P2から子C1, C2を生成
function cycleCrossover(parent1, parent2) {
    const size = parent1.length;
    const child1 = new Array(size).fill(-1);
    const child2 = new Array(size).fill(-1);

    let start = 0;
    let index = start;
    do {
        child1[index] = parent1[index];
        child2[index] = parent2[index];
        const value = parent2[index];
        index = parent1.indexOf(value);
    } while (index !== start);

    for (let i = 0; i < size; i++) {
        if (child1[i] === -1) {
            child1[i] = parent2[i];
        }
        if (child2[i] === -1) {
            child2[i] = parent1[i];
        }
    }

    return [child1, child2];
}

// スワップ突然変異（2点をランダムに選んで入れ替える）
function swapMutation(individual) {
    const mutated = individual.slice();
    const i = Math.floor(Math.random() * mutated.length);
    const j = Math.floor(Math.random() * mutated.length);
    [mutated[i], mutated[j]] = [mutated[j], mutated[i]];
    return mutated;
}

// GA実行
function runGA() {
    let population = initialPopulation();
    let bestSolution = null;
    let bestDistance = Infinity;

    for (let gen = 0; gen < MAX_GEN; gen++) {
        // 評価とソート
        const sortedPop = sortByFitness(population);

        // エリート保存
        const newPopulation = sortedPop.slice(0, ELITE_COUNT);

        // ベスト更新チェック
        const currentBestDist = totalDistance(sortedPop[0]);
        if (currentBestDist < bestDistance) {
            bestDistance = currentBestDist;
            bestSolution = sortedPop[0];
        }

        // 途中経過出力（世代ごとの最良距離）
        console.log(`Generation ${gen}: Best Distance = ${bestDistance}, current Best = ${currentBestDist}`);

        // 次世代生成
        while (newPopulation.length < POP_SIZE) {
            const parent1 = rankingSelection(population);
            const parent2 = rankingSelection(population);
            const [child1, child2] = cycleCrossover(parent1, parent2);

            // 突然変異
            let offspring1 = (Math.random() < MUTATION_RATE) ? swapMutation(child1) : child1;
            let offspring2 = (Math.random() < MUTATION_RATE) ? swapMutation(child2) : child2;

            newPopulation.push(offspring1);
            if (newPopulation.length < POP_SIZE) {
                newPopulation.push(offspring2);
            }
        }
        population = newPopulation;
    }

    console.log("Final Best distance found: " + bestDistance);
    console.log("Final Route: " + bestSolution);
    return {bestSolution, bestDistance};
}


// 実行
runGA();
