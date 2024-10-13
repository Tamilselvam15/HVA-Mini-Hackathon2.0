
// Select elementsby id for handle the Dom
const setupSection = document.getElementById("setup");
const categorySection = document.getElementById("category-section");
const questionSection = document.getElementById("question-section");
const endSection = document.getElementById("end-section");

const player1Input = document.getElementById("player1");
const player2Input = document.getElementById("player2");

const categoriesDiv = document.getElementById("categories");
const currentPlayerDisplay = document.getElementById("current-player");
const questionDisplay = document.getElementById("question");
const answersDiv = document.getElementById("answers");
const finalScoresDisplay = document.getElementById("final-scores");
const WinnerName = document.getElementById("winner")

//declerations
let players = [];
let currentPlayerIndex = 0;
let scores = { player1: 0, player2: 0 };
let usedCategories = [];
let questions = [];
let currentQuestionIndex = 0;
let easyQuestions = [];
let hardQuestions = [];
let Categorydata ={}
let mediumQuestions = [];

// Start game setup when the users set their names.
document.getElementById("player-setup").addEventListener("submit", (e) => {
  e.preventDefault();
  if (player1Input.value !== '' && player2Input.value !== '') {
    players = [player1Input.value, player2Input.value];
  } else {
    return alert('Enter both players names!');
  }
  setupSection.classList.add("hidden");
  categorySection.classList.remove("hidden");
  loadCategories();
});

// Load categories
const loadCategories = async () => {
  try {
    const response = await fetch("https://the-trivia-api.com/v2/categories");
    Categorydata = await response.json();
    console.log(Categorydata);
  } catch (err) {
    console.error(`Error fetching categories: ${err.message}`);
    return;
  }

  // If the fetching process completed then iterate the Categorydata
  if (Categorydata) {
    for (let category in Categorydata) {
        const button = document.createElement("button");
        button.textContent = category;
        button.addEventListener('click', () => selectCategory(category));
        categoriesDiv.appendChild(button);
      }
    }
  }

// Select category and fetch questions
const selectCategory = async (category) => {
  if (usedCategories.includes(category)) {
    alert('You have already selected this category!!')
  } else {
    usedCategories.push(category);
    categorySection.classList.add("hidden");
    await fetchQuestions(category);
    currentQuestionIndex = 0; 
    loadQuestion();
  }
   
}

// API fetching function
const fetchQuestions = async (category) => {
  try {
    const response = await fetch(`https://the-trivia-api.com/v2/questions?limit=50&categories=${category}`);
    const data = await response.json();
    
    // Categorize questions based on difficulty
    data.forEach((question) => {
      if (question.difficulty === 'easy') {
        easyQuestions.push(question);
      } else if (question.difficulty === 'medium') {
        mediumQuestions.push(question);
      } else if (question.difficulty === 'hard') {
        hardQuestions.push(question);
      }
    });


    // Combine all questions for gameplay
    questions = [
       ...easyQuestions.slice(0, 2),
      ...mediumQuestions.slice(0, 2),
      ...hardQuestions.slice(0,2)];

  } catch (err) {
    console.error(`Error fetching Questions: ${err.message}`);
    return;
  }
}

// Load the current question and render the current player
const loadQuestion = () => {
  questionSection.classList.remove("hidden");
  questionSection.classList.add('question-section')
  // Alternate between players using modulo operation
  const currentPlayer = players[currentPlayerIndex % 2]; 
  const currentQuestion = questions[currentQuestionIndex]; 

  // Update the current player display
  currentPlayerDisplay.textContent = `${currentPlayer}'s Turn`; 
  questionDisplay.textContent = currentQuestion.question.text; 
  answersDiv.innerHTML = ""; // Clear previous answers

  // Shuffle and display answers (including correct and incorrect ones)
  const answers = shuffleArray([...currentQuestion.incorrectAnswers, currentQuestion.correctAnswer]);
  answers.forEach((answer) => {
    const button = document.createElement("button");
    button.textContent = answer;
    button.addEventListener("click", () => handleAnswer(answer));
    answersDiv.appendChild(button);
  });
};

// Shuffle answers for randomness
const shuffleArray = (array) =>{
  return array.sort(() => Math.random() - 0.5);
}

// Handle answer submission
const handleAnswer=(selectedAnswer) => {
  const currentQuestion = questions[currentQuestionIndex];
  const correctAnswer = currentQuestion.correctAnswer;
  const difficulty = currentQuestion.difficulty;
  const scoreMap = { easy: 10, medium: 15, hard: 20 };

  // Check if answer is correct and update score for the current player
  if (selectedAnswer === correctAnswer) {
    if (currentPlayerIndex % 2 === 0) {
      scores.player1 += scoreMap[difficulty];
    } else {
      scores.player2 += scoreMap[difficulty];
    }
  }

  // Move to the next question and switch player
  currentQuestionIndex++;
  currentPlayerIndex++;
  

  // Check if there are more questions, otherwise show final scores
  if (currentQuestionIndex < questions.length) {
    loadQuestion(); // Load the next question
  } else {
    questionSection.classList.remove("question-section");
    questionSection.classList.add("hidden");
    showFinalScores(); // If no more questions, show final scores
  }
}

// Show final scores and handle game end
const showFinalScores = () => {
  
  endSection.classList.remove("hidden");
  endSection.classList.add("final-section");

  finalScoresDisplay.innerHTML = `
    ${players[0]}: ${scores.player1} points<br>
    ${players[1]}: ${scores.player2} points
  `;
  if (scores.player1 === scores.player2) {
    WinnerName.innerHTML ='both are have same score ,can you play again ?'
  }else if (scores.player1 > scores.player2) {
     WinnerName.innerHTML = `The winner is ${players[0]}!!`
  } else {
     WinnerName.innerHTML = `The winner is ${players[1]}!!`
  }
 
}

// Play again button
document.getElementById("play-again").addEventListener("click", () => {
  scores = { player1: 0, player2: 0 };
  easyQuestions = [];
  mediumQuestions = [];
  hardQuestions = [];
  currentQuestionIndex = 0;
  endSection.classList.remove("final-section");
  endSection.classList.add("hidden");
  categorySection.classList.remove("hidden");
  
  
});

