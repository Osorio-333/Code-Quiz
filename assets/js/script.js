//html elements that frequently get grabbed
var timerTag = document.querySelector(`#timerTag`); 
var timerPTag  = document.querySelector(`header`).children[1]; 
var submitHighscoreBtn = document.querySelector(`#submitHighscoreBtn`); 
var viewHighscoresBtn = document.querySelector(`#viewHighscoresBtn`); 
var clearHighscoreBtn = document.querySelector(`#clearHighscoreBtn`); 
var answerButtonLst = document.body.querySelector(`ul`); 
var goBackHighscoreBtn = document.querySelector(`#goBackBtn`); 
var startBtn = document.querySelector(`#startBtn`); 
var titleTag = document.querySelector(`#title`) 

//question and answer object with arrays
var questionObj = {
    questions: [
        `What does HTML stand for?`,
        `Which tag is used to define an unordered list?`,
        `What is the correct way to comment out multiple lines of code in JavaScript?`,
        `What is the purpose of CSS?`,
        `Which event occurs when the user clicks on an HTML element?`
    ],
    answers: [
        [`correct:Hyper Text Markup Language`, `Hyperlinks and Text Markup Language`, `Home Tool Markup Language`, `Hyperlinks Text Manipulation Language`],
        [`<ul>`, `<list>`, `<ol>`, `correct:<ul>`],
        [`/* This is a comment`, `<!-- This is a comment -->`, `// This is a comment`, `correct:// This is a comment`],
        [`correct:To style HTML elements`, `To add interactivity to a webpage`, `To define the structure of a webpage`, `To store data on the client-side`],
        [`onmouseover`, `onclick`, `onchange`, `correct:onclick`]
    ]
};


var globalTimerPreset = 75; // game presets to be easily accessed for balancing

//global quiz/game variables
var questionIndexNumber = 0; 
var timeLeft = globalTimerPreset; 
var score = 0; 
var gameEnded = true; 

//intial setup for the game shows all the "main menu" type items like instructions and start button
function setUpGame() {
    timeLeft = globalTimerPreset; 
    timerTag.textContent = globalTimerPreset; 

    //hide elements that may be visible after a previous round
    document.querySelector(`#display-highscore-div`).style.display = `none`; 

    //fills back content that gets reused for quiz questions
    titleTag.textContent = `Coding Quiz Challenge`; 

    //display items that are needed for the "main menu"
    titleTag.style.display = `block`;
    document.querySelector(`#instructions`).style.display = `block`; 
    viewHighscoresBtn.style.display = `block`; 
    startBtn.style.display = `block`; 

    return;
}

//gets triggered if the start button at "main menu" gets clicked
function startGame() {
    gameEnded = false; 
    questionIndexNumber = 0;

    //when game starts clean up the main div
    viewHighscoresBtn.style.display = `none` 
    startBtn.style.display = `none`; 
    document.querySelector(`#instructions`).style.display = `none`; 
    timerPTag.style.display = `block`; 

    //functions that create the user experience
    showQuestions(questionIndexNumber); 
    startTimer(); 

    return;
}

//timer interval that runs while user takes quiz
function startTimer() {
    var timerInterval = setInterval(function() {
        if(gameEnded === true) { 
            clearInterval(timerInterval); 
            return;
        }
        if(timeLeft < 1) { 
            clearInterval(timerInterval); 
            endGame(); 
        }

        timerTag.textContent = timeLeft; 
        timeLeft--; 
    }, 1000);

    return;
}

//uses the questionIndexNumber to show the question of the current index and its answers
function showQuestions(currentQuestionIndex) {
    titleTag.textContent = questionObj.questions[currentQuestionIndex]; 
    createAnswerElements(currentQuestionIndex); 

    return;
}

//creates new answer elements in the answer list will clear out previous answers
function createAnswerElements(currentQuestionIndex) {
    answerButtonLst.innerHTML = ''; 

    for (let answerIndex = 0; answerIndex < questionObj.answers[currentQuestionIndex].length; answerIndex++) { 
        var currentAnswerListItem = document.createElement(`li`); 
        var tempStr = questionObj.answers[currentQuestionIndex][answerIndex];

        //if the string contains `correct:` pull it out and set it as id so they cant see it on the <button>/<li>
        if (questionObj.answers[currentQuestionIndex][answerIndex].includes(`correct:`)){
            tempStr = questionObj.answers[currentQuestionIndex][answerIndex].substring(8, questionObj.answers[currentQuestionIndex][answerIndex].length); 
            currentAnswerListItem.id = `correct`; 
        }

        currentAnswerListItem.textContent = tempStr; 
        answerButtonLst.appendChild(currentAnswerListItem); 
    }

    return;
}

//when called will iterate to the next question and show the next question content
function nextQuestion() {
    questionIndexNumber++; 
    if (questionIndexNumber >= questionObj.questions.length){ 
        endGame(); 
    } else { 
        showQuestions(questionIndexNumber);
    } 

    return;
}

//its function is only to end the game that simple
function endGame() { 
    gameEnded = true; 
    score = timeLeft; 

    //hide necessary elements
    timerPTag.style.display = `none`; 
    titleTag.style.display = `none`; 
    answerButtonLst.innerHTML = ''; 

    //show endscreen score and form to enter name for highscore storage
    document.querySelector(`#scoreSpan`).textContent = score; 
    document.querySelector(`#submit-highscore-div`).style.display = `block`; 

    return;
}


//Triggered when a <li> tag inside answerButtonLst <ul> is clicked
function checkAnswer(event) {
    if (event.target != answerButtonLst){ 

        if (!(event.target.id.includes('correct'))){ 
            timeLeft -= 10; 
        }

        nextQuestion(); 
    }

    return;
}

//Triggered when highscoreBtn is clicked (the button at the end of the game to submit your name with score)
function storeScoreAndName() {
    var highscoreTextbox = document.querySelector(`input`); 
    var tempArrayOfObjects = []; 

    if (highscoreTextbox.value != `` || highscoreTextbox.value != null) {
        var tempObject = { 
            names: highscoreTextbox.value, 
            scores: score,
        }

        if(window.localStorage.getItem(`highscores`) == null) {
            tempArrayOfObjects.push(tempObject); 
            window.localStorage.setItem(`highscores`, JSON.stringify(tempArrayOfObjects)); 

        } else {
            tempArrayOfObjects = JSON.parse(window.localStorage.getItem(`highscores`)); 

            for (let index = 0; index <= tempArrayOfObjects.length; index++) { 
                if (index == tempArrayOfObjects.length) { 
                    tempArrayOfObjects.push(tempObject) 
                    break; 
                } else if (tempArrayOfObjects[index].scores < score) { 
                    tempArrayOfObjects.splice(index, 0, tempObject); 
                    break; 
                }
            }
            window.localStorage.setItem(`highscores`, JSON.stringify(tempArrayOfObjects))
        }
        document.querySelector(`input`).value = ``; 
        score = 0; 

        showHighscores(); 
    }

    return;
}

//triggered when viewHighscoresBtn is clicked hides all elements and displays the highscore board filled with localstorage values
function showHighscores() {
    //elements needed to hide
    titleTag.style.display = `none`;
    startBtn.style.display = `none`; 
    document.querySelector(`header`).children[0].style.display = `none`; 
    document.querySelector(`#instructions`).style.display = `none`; 
    document.querySelector(`#submit-highscore-div`).style.display = `none`; 

    
    document.querySelector(`#display-highscore-div`).style.display = `block`; 

    tempOrderedList = document.querySelector(`ol`); 
    tempOrderedList.innerHTML = `` 

    tempArrayOfObjects = JSON.parse(window.localStorage.getItem(`highscores`)); 
    if (tempArrayOfObjects != null) { 
        for (let index = 0; index < tempArrayOfObjects.length; index++) { 
            var newLi = document.createElement(`li`) 
            newLi.textContent = tempArrayOfObjects[index].names + ` - ` + tempArrayOfObjects[index].scores;
            tempOrderedList.appendChild(newLi)
        }

    } else { 
        var newLi = document.createElement(`p`) 
        newLi.textContent = `No Highscores` 
        tempOrderedList.appendChild(newLi); 
    }

    return;
}


function clearHighscores() {
    document.querySelector(`ol`).innerHTML = ``; 
    window.localStorage.clear();

    setUpGame(); 

    return;
}

function init() {
    //elements on DOM which are going to need an event listener
    startBtn.addEventListener(`click`, startGame); 
    answerButtonLst.addEventListener(`click`, checkAnswer); 
    viewHighscoresBtn.addEventListener(`click`, showHighscores); 
    submitHighscoreBtn.addEventListener(`click`, storeScoreAndName);
    clearHighscoreBtn.addEventListener(`click`, clearHighscores); 
    goBackHighscoreBtn.addEventListener(`click`, setUpGame); 

    setUpGame(); //prepare the screen for and display the appropriate items to get ready for quiz

    return;
}

init(); //initialize all my buttons and interactable elements