// data management
let records = [];
// post scores
function postScores() {
    try {
        localStorage.setItem('records', records);
    } catch (err) {
        console.error("Couldn't save records: ", err);
    }
}
// fetch scores
function fetchScores() {
    try {
        const data = JSON.parse(localStorage.getItem('records'));
        if (data) {
            records = data.sort((a, b) => (a.moves - b.moves) || (a.elapsedTime - b.elapsedTime));
        }
    } catch (err) {
        console.error('Error fetching scores: ', err.message);
    }
}
// render scores
function renderScores() {
    fetchScores();
    const scoresContainer = document.querySelector('.scoresContainer');
    scoresContainer.innerHTML = ``;

    records.forEach((score, index) => {
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

        if (index < 3) {
            player.classList.add(`player${index + 1}`);
            player.textContent += ` ${index + 1}`;
        }

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
}

const navBar = document.querySelector('.navbar');
const hambBtn = document.querySelector('.hambBtn');
const navMenu = document.querySelectorAll('.navbar-menu li a');
const gridSize = document.querySelector('.mode select');

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
function showNavMenu() {
    hambBtn.classList.toggle('active');
    hambBtn.nextElementSibling.classList.toggle('active');
}
navBar.onclick = (e) => {
    if (e.target == hambBtn || e.target.parentElement == hambBtn || Array.from(navMenu).includes(e.target)) {
        showNavMenu();
    }
};
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
// mode grid size
let size = 4;
gridSize.onchange = (e) => {
    showNavMenu();
    switch (e.target.value) {
        case 'three': size = 3;
            break;
        case 'four': size = 4;
            break;
        case 'five': size = 5;
    }
    createArray(size);
    shuffleTiles();
};
// creating tiles array
let tilesArray = [];

function createArray(size) {
    tilesArray = [];
    for (let i = 0; i < size ** 2; i++) {
        tilesArray.push(i);
    }
}
createArray(size);
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
    puzzleContainer.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    puzzleContainer.style.gridTemplateRows = `repeat(${size}, 1fr)`;

    playBtn.classList.remove('show');
    moveTiles();
    if (firstMove) {
        start();
    }

    if (isSorted(tilesArray)) {
        showWinMsg();
    }
}

function shuffleTiles() {
    const directions = [-size, +size, -1, 1];
    let emptyIndex = tilesArray.indexOf(0);
    for (let i = 0; i < 1000; i++) {
        const validMoves = directions.filter(d => {
            const newIndex = emptyIndex + d;
            return (
                newIndex >= 0 && newIndex < size**2 &&
                !(d === 1 && emptyIndex % size === size-1) &&
                !(d === -1 && emptyIndex % size === 0));
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
            if (Math.abs(index - emptyIndex) === 1 || Math.abs(index - emptyIndex) === size) {
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
    if (arr[arr.length-1] !== 0) return false;
    for (let i = 1; i < arr.length-1; i++) {
        if (arr[i - 1] > arr[i]) return false;
    }
    return true;
}
// showing winMsg
function showWinMsg() {
    stop();
    confetti({
        particleCount: 120,
        spread: 100,
        origin: { y: 1 }
    });
    wonMsg.classList.add('show');
    puzzleContainer.classList.add('gameOver');
    pauseBtn.classList.add('gameOver');
}
// submit username
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = form.querySelector('input[type="text"]').value;
    const score = `{"name":"${username}", "time":"${timerDisplay.textContent}", "elapsedTime":${elapsedTime}, "moves":${moves.textContent}}`
    updateScores(JSON.parse(score));
    showLeaderBoard();
    form.reset();
    shuffleTiles();
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
