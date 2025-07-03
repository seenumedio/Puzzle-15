// data management
let records = [{
    "name": "Saiesh",
    "time": "00:35:45",
    "elapsedTime": 2145,
    "moves": 200
},
{
    "name": "Karthikeyan",
    "time": "00:30:45",
    "elapsedTime": 1845,
    "moves": 400
},
{
    "name": "Geetha",
    "time": "00:25:47",
    "elapsedTime": 1547,
    "moves": 200
},
{
    "name": "Yuva",
    "time": "00:40:45",
    "elapsedTime": 2445,
    "moves": 350
}];
// post scores
function postScores(data) {
    try {
        localStorage.setItem('records', JSON.stringify(data));
    } catch (err) {
        console.error("Couldn't save scores: ", err.message);
    }
}
postScores(JSON.stringify(records));
// fetch scores
function fetchScores() {
    try {
        const data = localStorage.getItem('records');
        records = data ? JSON.parse(data) : records;
        if (!Array.isArray(records)) records = [];
        records.sort((a, b) => (a.moves - b.moves) || (a.elapsedTime - b.elapsedTime));
    } catch (err) {
        console.error("Couldn't load scores: ", err.message);
        records = [];
    }
}
// render scores
function renderScores() {
    fetchScores();
    const scoresContainer = document.querySelector('.scoresContainer');
    scoresContainer.innerHTML = ``;

    if (!Array.isArray(records)) {
        console.error('Leaderboard data is corrupted or missing.');
        return;
    }

    records.forEach(score => {
        const scoreContainer = document.createElement('div');
        const player = document.createElement('div');
        const time = document.createElement('div');
        const moves = document.createElement('div');

        scoreContainer.className = 'score';
        player.className = 'player';
        time.className = 'time';
        moves.className = 'movesRecord';

        player.textContent = `${score.name}`;
        time.textContent = `${score.time}`;
        moves.textContent = `${score.moves}`;

        scoreContainer.appendChild(time);
        scoreContainer.appendChild(player);
        scoreContainer.appendChild(moves);

        scoresContainer.appendChild(scoreContainer);
    });
};
// update scores
function updateScores(score) {
    fetchScores();
    records.push(score);
    try {
        localStorage.setItem('records', JSON.stringify(records));
    } catch (err) {
        console.error("Couldn't save scores: ", err.message);
    }
    console.log(score);
}

const navBar = document.querySelector('.navbar');
const hambBtn = document.querySelector('.hambBtn');
const navMenu = document.querySelectorAll('.navbar-menu li a');

const timerDisplay = document.querySelector('.timer');
let timer = null;
let startTime = 0;
let elapsedTime = 0;
let isRunning = false;
let firstMove = false;

const puzzle = document.querySelector('.puzzle');
const puzzleContainer = document.querySelector('.puzzle .puzzle-container');

const moves = document.querySelector('#moves');

const pauseBtn = document.querySelector('#pauseGame');
const playBtn = document.querySelector('#play');
const resetBtn = document.querySelector('.reset');
const newGame = document.querySelector('#newGame');

const wonMsg = document.querySelector('.wonMsg');

const leaderBoard = document.querySelector('.leaderboard');
const closeScores = document.querySelector('.closeScores');
const recordsBtns = document.querySelectorAll('.records');

const form = document.forms['usernameForm'];
// navbar
navBar.addEventListener('click', (e) => {
    if (e.target == hambBtn || e.target.parentElement == hambBtn || Array.from(navMenu).includes(e.target)) {
        hambBtn.classList.toggle('active');
        hambBtn.nextElementSibling.classList.toggle('active');
    }
});

// timer
function start() {
    if (!isRunning) {
        startTime = Date.now() - elapsedTime;
        timer = setInterval(update, 10);
        isRunning = true;
    }
}

function stop() {
    if (isRunning) {
        clearInterval(timer);
        elapsedTime = Date.now() - startTime;
        isRunning = false;
    }
}

function resetTimer() {
    clearInterval(timer);
    startTime = 0;
    elapsedTime = 0;
    isRunning = false;
    timerDisplay.textContent = `00:00:00`;
}

function update() {
    const currentTime = Date.now();
    elapsedTime = currentTime - startTime;

    let hour = Math.floor(elapsedTime / (1000 * 3600));
    let minute = Math.floor(elapsedTime / (1000 * 60)) % 60;
    let second = Math.floor(elapsedTime / (1000)) % 60;

    hour = String(hour).padStart(2, '0');
    minute = String(minute).padStart(2, '0');
    second = String(second).padStart(2, '0');
    timerDisplay.textContent = `${hour}:${minute}:${second}`;
}
// creating tiles array
let tilesArray = [];
for (let i = 0; i <= 15; i++) {
    tilesArray.push(i);
}
let initialTiles = [];
/* puzzle grid */
function renderTiles() {
    const prevTiles = document.querySelectorAll('.tile, .blank');
    prevTiles.forEach(tile => {
        tile.remove();
    });
    tilesArray.forEach((val, index) => {
        const tile = document.createElement('div');
        tile.textContent = val === 0 ? '' : val;
        tile.className = val === 0 ? 'blank' : 'tile';
        puzzleContainer.appendChild(tile);
    });
    playBtn.classList.remove('show');
    moveTiles();
    if (firstMove) {
        start();
    }
}

function shuffleTiles() {
    const directions = [-4, 4, -1, 1];
    let emptyIndex = tilesArray.indexOf(0);
    for (let i = 0; i < 1000; i++) {
        const validMoves = directions.filter(d => {
            const newIndex = emptyIndex + d;
            return (
                newIndex >= 0 && newIndex < 16 &&
                !(d === 1 && emptyIndex % 4 === 3) &&
                !(d === -1 && emptyIndex % 4 === 0));
        });
        const newIndex = emptyIndex + validMoves[Math.floor(Math.random() * validMoves.length)];

        [tilesArray[newIndex], tilesArray[emptyIndex]] = [tilesArray[emptyIndex], tilesArray[newIndex]];
        emptyIndex = newIndex;
    }
    initialTiles = [...tilesArray];
    firstMove = false;
    renderTiles();
    resetTimer();
    moves.textContent = 0;

    wonMsg.classList.remove('show');
    puzzleContainer.classList.remove('gameOver');
    pauseBtn.classList.remove('gameOver');
}

function moveTiles() {
    let tiles = document.querySelectorAll('.puzzle-container div');
    const emptyIndex = tilesArray.indexOf(0);
    tiles.forEach((tile, index) => {
        tile.onclick = () => {
            if (Math.abs(index - emptyIndex) == 1 || Math.abs(index - emptyIndex) == 4) {
                [tilesArray[emptyIndex], tilesArray[index]] = [tilesArray[index], 0];
                firstMove = true;
                renderTiles();
                moves.textContent++;
            }
        };
    });
}

shuffleTiles();
// play&pause btns
pauseBtn.onclick = () => {
    stop();
    Array.from(puzzleContainer.children).forEach(child => {
        child.classList.add('paused');
    });
    playBtn.classList.add('show');
};

playBtn.onclick = () => {
    if (firstMove) {
        start();
    }
    Array.from(puzzleContainer.children).forEach(child => {
        child.classList.toggle('paused');
    });
    playBtn.classList.toggle('show');
}
// resetBtn btn
resetBtn.onclick = () => {
    const confirm = window.confirm('Do u want to resetBtn to initial state?')
    if (confirm) {
        tilesArray = [...initialTiles];
        firstMove = false;
        renderTiles();
        resetTimer();
        moves.textContent = 0;
    }
    return;
}
// newGame btn
newGame.onclick = () => {
    const confirm = window.confirm('Are u sure want to delete the current game?');
    if (confirm) {
        shuffleTiles();
    }
    return;
};
// check for win
function isSorted(arr) {
    return arr.every((v, i) => i === 0 || arr[i - 1] < v);
}
// showing winMsg
function showWinMsg() {
    confetti({
        particleCount: 120,
        spread: 100,
        origin: { y: 1 }
    });
    wonMsg.classList.add('show');
    puzzleContainer.classList.add('gameOver');
    pauseBtn.classList.add('gameOver');
}
if (isSorted(tilesArray)) {
    showWinMsg();
}
// submit username
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = form.querySelector('input[type="text"]').value;
    const score = `{"name":"${username}", "time":"${timerDisplay.textContent}", "elapsedTime":${elapsedTime}, "moves":${moves.textContent}}`
    updateScores(JSON.parse(score));
    showLeaderBoard();
    form.reset();
});
// leaderBoard
function showLeaderBoard() {
    puzzle.classList.toggle('showScores');
    leaderBoard.classList.toggle('showScores');
    renderScores();
}
recordsBtns.forEach(recordsBtn => {
    recordsBtn.onclick = () => {
        showLeaderBoard();
    }
});
closeScores.onclick = () => {
    showLeaderBoard();
};