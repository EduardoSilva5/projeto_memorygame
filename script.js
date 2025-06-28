document.addEventListener('DOMContentLoaded', () => {
    const mainMenu = document.getElementById('main-menu');
    const difficultyMenu = document.getElementById('difficulty-menu');
    const gameBoard = document.getElementById('game-board');
    const cardsContainer = document.getElementById('cards-container');
    const timerDisplay = document.getElementById('timer');
    const movesDisplay = document.getElementById('moves');
    const restartBtn = document.getElementById('restart-btn');
    const gameOverScreen = document.getElementById('game-over-screen');
    const gameOverMessage = document.getElementById('game-over-message');
    const playAgainBtn = document.getElementById('play-again-btn');

    const noLimitBtn = document.getElementById('no-limit-btn');
    const timeLimitBtn = document.getElementById('time-limit-btn');
    const movesLimitBtn = document.getElementById('moves-limit-btn');

    const easyBtn = document.getElementById('easy-btn');
    const mediumBtn = document.getElementById('medium-btn');
    const hardBtn = document.getElementById('hard-btn');

    let gameType = 'no-limit'; // 'no-limit', 'time-limit', 'moves-limit'
    let difficulty = 'easy'; // 'easy', 'medium', 'hard'
    let cards = [];
    let flippedCards = [];
    let matchedPairs = 0;
    let moves = 0; // Continuará contando para cima para a mensagem final
    let remainingMoves = 0; // Contagem regressiva de movimentos
    let timer = 0; // Continuará contando para cima para a mensagem final
    let remainingTime = 0; // Contagem regressiva de tempo
    let timerInterval;
    let gameActive = false;

    // Imagens para o jogo da memória (temática espacial)
    const cardImages = [
        'alien.png', 'astronauta.png', 'terra.png', 'galaxy.png',
        'moon.png', 'rocket.png', 'satellite.png', 'star.png',
        'sun.png', 'ufo.png'
    ];

    // Configurações de jogo por dificuldade
    const gameSettings = {
        'easy': {
            pairs: 4, // 8 cartas (4x2)
            timeLimit: 60, // 60 segundos
            moveLimit: 25 // 25 movimentos
        },
        'medium': {
            pairs: 6, // 12 cartas (4x3)
            timeLimit: 90, // 90 segundos
            moveLimit: 40 // 40 movimentos
        },
        'hard': {
            pairs: 10, // 20 cartas (5x4)
            timeLimit: 110, // 120 segundos
            moveLimit: 50 // 60 movimentos
        }
    };

    // --- Funções de Menu ---
    noLimitBtn.addEventListener('click', () => {
        gameType = 'no-limit';
        showDifficultyMenu();
    });

    timeLimitBtn.addEventListener('click', () => {
        gameType = 'time-limit';
        showDifficultyMenu();
    });

    movesLimitBtn.addEventListener('click', () => {
        gameType = 'moves-limit';
        showDifficultyMenu();
    });

    easyBtn.addEventListener('click', () => {
        difficulty = 'easy';
        startGame();
    });

    mediumBtn.addEventListener('click', () => {
        difficulty = 'medium';
        startGame();
    });

    hardBtn.addEventListener('click', () => {
        difficulty = 'hard';
        startGame();
    });

    restartBtn.addEventListener('click', resetGame);
    playAgainBtn.addEventListener('click', resetGame);

    function showMainMenu() {
        mainMenu.classList.remove('hidden');
        difficultyMenu.classList.add('hidden');
        gameBoard.classList.add('hidden');
        gameOverScreen.classList.add('hidden');
    }

    function showDifficultyMenu() {
        mainMenu.classList.add('hidden');
        difficultyMenu.classList.remove('hidden');
    }

    function showGameBoard() {
        difficultyMenu.classList.add('hidden');
        gameBoard.classList.remove('hidden');
        restartBtn.classList.remove('hidden');
    }

    // --- Funções do Jogo ---

    function startGame() {
        showGameBoard();
        resetGameState();
        generateCards();
        setupGameLimits();
        gameActive = true;
    }

    function resetGameState() {
        clearInterval(timerInterval);
        flippedCards = [];
        matchedPairs = 0;
        moves = 0; // Reseta a contagem crescente de movimentos
        timer = 0; // Reseta a contagem crescente de tempo
        remainingMoves = 0; // Reseta a contagem decrescente de movimentos
        remainingTime = 0; // Reseta a contagem decrescente de tempo

        timerDisplay.textContent = `Tempo: 0s`;
        movesDisplay.textContent = `Movimentos: 0`;
        timerDisplay.classList.add('hidden');
        movesDisplay.classList.add('hidden');
        cardsContainer.innerHTML = ''; // Limpa as cartas existentes
        cardsContainer.classList.remove('easy', 'medium', 'hard'); // Limpa classes de grid
    }

    function setupGameLimits() {
        if (gameType === 'time-limit') {
            remainingTime = gameSettings[difficulty].timeLimit;
            timerDisplay.textContent = `Tempo: ${remainingTime}s`;
            timerDisplay.classList.remove('hidden');
            startTimer();
        } else if (gameType === 'moves-limit') {
            remainingMoves = gameSettings[difficulty].moveLimit;
            movesDisplay.textContent = `Movimentos: ${remainingMoves}`;
            movesDisplay.classList.remove('hidden');
        }
    }

    function generateCards() {
        const numPairs = gameSettings[difficulty].pairs;
        let selectedImages = [];
        for (let i = 0; i < numPairs; i++) {
            selectedImages.push(cardImages[i % cardImages.length]); // Garante que não falte imagens
        }

        cards = [...selectedImages, ...selectedImages]; // Duplica para ter pares
        shuffleCards(cards);

        cardsContainer.classList.add(difficulty); // Adiciona classe para o grid CSS

        cards.forEach((imageName, index) => {
            const cardElement = document.createElement('div');
            cardElement.classList.add('card');
            cardElement.dataset.index = index;

            const cardInner = document.createElement('div');
            cardInner.classList.add('card-inner');

            const cardFront = document.createElement('div');
            cardFront.classList.add('card-face', 'card-front');
            const img = document.createElement('img');
            img.src = `cards/${imageName}`; // Certifique-se de ter uma pasta 'images'
            img.alt = `Imagem de ${imageName.split('.')[0]}`;
            cardFront.appendChild(img);

            const cardBack = document.createElement('div');
            cardBack.classList.add('card-face', 'card-back');
            // Você pode colocar um ícone ou um design genérico no verso da carta
            cardBack.innerHTML = '🚀'; // Exemplo de ícone de foguete

            cardInner.appendChild(cardFront);
            cardInner.appendChild(cardBack);
            cardElement.appendChild(cardInner);

            cardElement.addEventListener('click', flipCard);
            cardsContainer.appendChild(cardElement);
        });
    }

    function shuffleCards(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function flipCard() {
        if (!gameActive) return;
        if (flippedCards.length < 2 && !this.classList.contains('flipped') && !this.classList.contains('matched')) {
            this.classList.add('flipped');
            flippedCards.push(this);

            if (flippedCards.length === 2) {
                // Apenas incrementa "moves" para a contagem final
                moves++;

                // Decrementa "remainingMoves" se for o tipo de jogo
                if (gameType === 'moves-limit') {
                    remainingMoves--;
                    movesDisplay.textContent = `Movimentos: ${remainingMoves}`;
                }

                checkMatch();
            }
        }
    }

    function checkMatch() {
        const [card1, card2] = flippedCards;
        const img1 = card1.querySelector('.card-front img').src;
        const img2 = card2.querySelector('.card-front img').src;

        if (img1 === img2) {
            // Par encontrado
            setTimeout(() => {
                card1.classList.add('matched');
                card2.classList.add('matched');
                matchedPairs++;
                flippedCards = [];
                checkWinCondition();
            }, 800);
        } else {
            // Não é um par, vira de volta
            setTimeout(() => {
                card1.classList.remove('flipped');
                card2.classList.remove('flipped');
                flippedCards = [];
                checkLossCondition(); // Verifica se perdeu por limite de movimentos
            }, 1000);
        }
    }

    function startTimer() {
        clearInterval(timerInterval); // Garante que não há múltiplos timers
        timer = 0; // Reseta a contagem crescente
        remainingTime = gameSettings[difficulty].timeLimit; // Inicializa com o tempo máximo
        timerDisplay.textContent = `Tempo: ${remainingTime}s`;

        timerInterval = setInterval(() => {
            timer++; // Incrementa para a contagem final
            remainingTime--; // Decrementa para a contagem regressiva
            timerDisplay.textContent = `Tempo: ${remainingTime}s`;

            if (remainingTime <= 0) {
                clearInterval(timerInterval);
                endGame(false, 'Tempo esgotado!');
            }
        }, 1000);
    }

    function checkWinCondition() {
        if (matchedPairs === gameSettings[difficulty].pairs) {
            endGame(true, 'Parabéns, você encontrou todos os pares!');
        }
    }

    function checkLossCondition() {
        if (gameType === 'moves-limit' && remainingMoves <= 0 && flippedCards.length === 0) {
            // Só perde por movimentos se não houver cartas viradas
            endGame(false, 'Você atingiu o limite de movimentos!');
        }
    }

    function endGame(win, message) {
        gameActive = false;
        clearInterval(timerInterval);
        gameOverScreen.classList.remove('hidden');
        gameOverMessage.textContent = message;
        if (win) {
            gameOverMessage.innerHTML += `<br>Seus movimentos: ${moves} | Tempo: ${timer}s`;
        }
    }

    function resetGame() {
        gameOverScreen.classList.add('hidden');
        showMainMenu();
    }

    // Inicializa o jogo mostrando o menu principal
    showMainMenu();
});