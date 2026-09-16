const url = "https://opentdb.com/api.php?amount=10&category=23&difficulty=easy&type=multiple";

let questions = [];
let currentQuestionIndex = 0;
let timer = 0;
let score = 0;
let timerLeft = 15;

const startScreen = document.getElementById("start-screen");
const quizScreen = document.getElementById("quiz-screen");
const resultScreen = document.getElementById("result-screen");
const startButton = document.getElementById("start-button");
const restartButton = document.getElementById("restart-btn");
const questionText = document.getElementById("question-text");
const answerButtons = document.getElementById("answers-buttons");
const timerDisplay = document.getElementById("timer");
const highscoreElement = document.getElementById("high-score-display");
const finalScoreElement = document.getElementById("final-score");
const questionNumber = document.getElementById("question-number");

let highScore = localStorage.getItem("highScore") || 0;
highscoreElement.innerHTML = highScore;

startButton.addEventListener("click", startGame);
restartButton.addEventListener("click", startGame);

async function fetchQuestions() {
    try {
        const response = await fetch(url);
        const data = await response.json();
        questions = data.results;
        showQuestion();
        startTimer();
    } catch (error) {
        console.error("Error:", error);
        questionText.innerHTML = "Soru yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.";
    }
}

async function startGame() {
    startScreen.classList.remove('active');
    resultScreen.classList.remove('active');
    quizScreen.classList.add('active');
    currentQuestionIndex = 0;
    score = 0;
    timerLeft = 15;
    questionText.innerHTML = "Yükleniyor...";
    timerDisplay.innerHTML = `Kalan Süre: ${timerLeft}s`;
    await fetchQuestions();
    showQuestion();
}

function decodeHtml(html) {
    const text = document.createElement("textarea");
    text.innerHTML = html;
    return text.value;
}

function showQuestion() {
    resetState();
    startTimer();
    const currentQuestion = questions[currentQuestionIndex];
    questionText.innerHTML = decodeHtml(currentQuestion.question);
    questionNumber.innerHTML = `Soru ${currentQuestionIndex + 1} / ${questions.length}`;

    const answers = [...currentQuestion.incorrect_answers, currentQuestion.correct_answer];
    const shuffledAnswers = answers.sort(() => Math.random() - 0.5);

    shuffledAnswers.forEach((answer) => {
        const button = document.createElement("button");
        button.innerHTML = decodeHtml(answer);
        button.classList.add('btn');

        if (answer === currentQuestion.correct_answer) {
            button.dataset.correct = true;
        }
        button.addEventListener("click", selectAnswer);
        answerButtons.appendChild(button);
    });

}

function selectAnswer(e) {
    clearInterval(timer);
    const selectedButton = e.target;
    const isCorrectBtn = selectedButton.dataset.correct === "true";

    if (isCorrectBtn) {
        score += 10;
        selectedButton.classList.add('correct');
    }
    else {
        selectedButton.classList.add('wrong');
    }
    Array.from(answerButtons.children).forEach(button => {
        if (button.dataset.correct === "true") {
            button.classList.add('correct');
        }
        button.classList.add('disabled');
    });
    setTimeout(() => {
        currentQuestionIndex++;
        if (currentQuestionIndex < questions.length) {
            showQuestion();
        } else {
            endResults();
        }
    }, 2000);
}

function resetState() {
    clearInterval(timer);
    timerLeft = 15;
    while (answerButtons.firstChild) {
        answerButtons.removeChild(answerButtons.firstChild);
    }
}

function endResults() {

    quizScreen.classList.remove('active');
    resultScreen.classList.add('active');
    finalScoreElement.innerHTML = `Score: ${score} / ${questions.length * 10}`;
    updateHighScore();
}

function updateHighScore() {
    if (score > highScore) {
        highScore = score;
        localStorage.setItem("highScore", highScore);
        highscoreElement.innerHTML = highScore;
        alert("Yeni yüksek skor! Tebrikler!");
    }
}

function startTimer() {
    timerLeft = 15;
    timerDisplay.innerHTML = `Kalan Süre: ${timerLeft}s`;

    timer = setInterval(() => {
        timerLeft--;
        timerDisplay.innerHTML = `Kalan Süre: ${timerLeft}s`;

        if (timerLeft <= 0) {
            clearInterval(timer);
            handleTimeOut();
        }
    }, 1000);
}

function handleTimeOut() {

    Array.from(answerButtons.children).forEach(button => {
        if (button.dataset.correct === "true") {
            button.classList.add('correct');
        }
        button.classList.add('disabled');
    });
    setTimeout(() => {
        currentQuestionIndex++;
        if (currentQuestionIndex < questions.length) {
            showQuestion();
        } else {
            endResults();
        }
    }, 1500);
}


