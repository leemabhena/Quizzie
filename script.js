"use strict";

// make sure to check results before printing

///////////////////////////////////////////////////////
/////////        Typewriter Effect       //////////////
const typewriter = document.querySelector(".typewriter");
const words = ["JS", "HTML", "PYTHON", "TRIVIA", "JAVA"];


// close remove the modal widow
const close = document.querySelector(".close");
const modal = document.querySelector(".trivia-modal");
const hero = document.querySelector(".hero");
const overlay = document.querySelector(".overlay");
const takeQuiz = document.querySelector(".take-quiz");
const quizBody = document.querySelector(".quiz-body");


// remove the modal window
close.addEventListener("click", ()=>{
    modal.classList.remove("visible");
    overlay.classList.remove("visible");
})

overlay.addEventListener("click", ()=> {
    modal.classList.remove("visible");
    overlay.classList.remove("visible");
})

// add the modal window
takeQuiz.addEventListener("click", ()=> {
    modal.classList.add("visible");
    overlay.classList.add("visible");
})

// keep track of results
let results = "";
let totalNumOfQuestions = 10;

//Create Quiz implementation
const createQuiz = document.querySelector(".create-btn");
createQuiz.addEventListener("click", (e)=>{
    // avoid reloading page
    e.preventDefault();
    // grab everything in the form on click
    const numQuestions = document.querySelector("#number").value;
    const category = document.querySelector("#category").value;
    const difficulty = document.querySelector("#difficulty").value;
    const type = document.querySelector("#type").value;
    
    // url to the database
    let url = "https://opentdb.com/api.php?";
    // if number is not set default to 10
    const numUrl = numQuestions ? `amount=${numQuestions}` : `amount=${10}`;
    // add that to the url
    url += numUrl;
    // check the category
    const categoryUrl = category ? `&category=${category}`: "" ;
    url += categoryUrl;
    
    // check difficulty
    const diffUrl = difficulty === "any-difficulty" ? "" : `&difficulty=${difficulty}`;
    url += diffUrl;

    // check type
    const typeUrl = type == "any-type"? "" : `&type=${type}`;
    url += typeUrl;

    // create an ajax call to grab the result
    $.ajax({
        url : url,
        type: "GET",
        beforeSend: function() {
            createQuiz.textContent = "Loading...";
        },
        success: function(data) {
            results = data.results;
            totalNumOfQuestions = results.length;
        }, 
        complete: function() {
            // hide input form and show questions
            modal.classList.remove("visible");
            // show questions
            quizBody.classList.add("visible");
            anyResults();
            displayQuiz();
        },
        error: function(error) {
            console.log('Error');
        }
    })

})


function getCategories() {
    const url = "https://opentdb.com/api_category.php";
    $.ajax({
        url : url,
        type: "GET",
        dataType: "json",
        beforeSend: function() {
            const loaderEl = document.querySelector(".main-loader");
            loaderEl.classList.add("visible");
        },
        complete: function() {
            // when everything is done hide loader
            const loaderEl = document.querySelector(".main-loader");
            loaderEl.classList.remove("visible");
        },
        success: function(data) {
            let name, id;
            let output = "";
            const categories = data.trivia_categories;
            for (let i = 0 ; i < categories.length; i++) {
                name = categories[i].name;
                id = categories[i].id;
                output += `<option value="${id}">${name}</option>`
            }
            // add that to the options
            const categoryEl = document.querySelector("#category");
            categoryEl.insertAdjacentHTML("beforeend", output);
        },
        error: function(error) {

        }
    })
}


getCategories();

// functionality to display quiz

let questionNum = 0;

function displayQuiz(){
    // if all the quizes have been exhausted
    if (questionNum === results.length) {
        // display final score and ability to retake the quiz
        return;
    }

    const currentQuiz = results[questionNum];
    let correctAnswer = currentQuiz.correct_answer;
    let incorrectAnswers = currentQuiz.incorrect_answers;
    let category = currentQuiz.category;
    let question = currentQuiz.question;

    // before adding empty the contents
    const questionEl = document.querySelector("#question");
    questionEl.textContent = "";
    const questionCatEl = document.querySelector(".qsn-cat");
    questionCatEl.textContent = "";
    const answersEl = document.querySelector(".answers");
    answersEl.textContent = "";

    questionEl.insertAdjacentHTML("beforeend", question);
    questionCatEl.insertAdjacentHTML("beforeend", 
    `category <i class="fa-solid fa-caret-right"></i> ${category} | Question: ${questionNum + 1} / ${totalNumOfQuestions}`);

    incorrectAnswers.push(correctAnswer);
    // shuffle array
    incorrectAnswers = incorrectAnswers.sort((a, b) => 0.5 - Math.random());

    // send the correct answer
    let output = `<input class="correct-answer" type="hidden" value="${correctAnswer}" />`;
    for (let i = 0; i < incorrectAnswers.length; i++){
       output +=  `
                <input type="radio" name="answer" value="${incorrectAnswers[i]}">
                <label>${incorrectAnswers[i]}</label>
                <br>
                 `
    }
    answersEl.insertAdjacentHTML("beforeend", output);
    
    // scroll to top
    document.querySelector("nav").scrollIntoView({behavior:"smooth"});

    questionNum ++;


}

let score = 0;

function checkAnswers() {
    
    const selectedAnswer = document.querySelector('input[name="answer"]:checked').value;
    const correctAnswer = document.querySelector(".correct-answer").value;
    console.log(selectedAnswer, correctAnswer);
    // check if answers are the same 
    if (selectedAnswer === correctAnswer) {
        // display congrats message
        document.querySelector(".correct").classList.add("displayBlock");
        score ++;
    } else {
        // display a try again message
        document.querySelector(".wrong").textContent = "";
        document.querySelector(".wrong").classList.add("displayBlock");
        document.querySelector(".wrong").insertAdjacentHTML("beforeend",
        `   Wrong Answer <i class="fa-regular fa-circle-xmark"></i>
            <br> The correct answer is ${correctAnswer}.
        `
        )
    }

     // check if at the end of all questions
     if (questionNum === totalNumOfQuestions) {
        // prompt to start the game
        document.querySelector(".start-new-quiz").classList.add("visible");
        document.querySelector(".wrong").insertAdjacentHTML("beforeend",
        `<br> <span class="score">Score ${score} / ${totalNumOfQuestions} </span>`);
        document.querySelector(".correct").insertAdjacentHTML("beforeend",
        `<br> <span class="score">Score ${score} / ${totalNumOfQuestions} </span>`);
        // make the above visible
        document.querySelector(".score").classList.add("visible");
    } else {
        // prompt for next
        document.querySelector(".next-question").classList.add("visible");
    }
}

const checkAnswerBtn = document.querySelector(".check-answer");
checkAnswerBtn.addEventListener("click", checkAnswers);

// next question
document.querySelector(".next-question").addEventListener("click", ()=>{
    // update the progress bar
    const quizContainer = document.querySelector(".main-container");
    const progress = document.querySelector(".progress");
    const quizWidth = quizContainer.getBoundingClientRect().width;
    const progressWidth = progress.getBoundingClientRect().width;
    progress.style.width = `${ progressWidth + (quizWidth / (totalNumOfQuestions - 1))}px`;

    // hide the answer bar
    document.querySelector(".correct").classList.remove("displayBlock");
    document.querySelector(".wrong").classList.remove("displayBlock");
    
    // display new quiz
    displayQuiz();

    // hide next button
    document.querySelector(".next-question").classList.remove("visible");
})


document.querySelector(".start-new-quiz").addEventListener("click", ()=> {
    // initialize Quiz
    initinializeQuiz();

    // hide create button
    document.querySelector(".start-new-quiz").classList.remove('visible');
})


function initinializeQuiz() {
    // hide the quiz bar
    quizBody.classList.remove("visible");
    // reveal modal
    modal.classList.add("visible");
    createQuiz.textContent = "Create Quiz";
    questionNum = 0;

     // hide the answer bar
     document.querySelector(".correct").classList.remove("displayBlock");
     document.querySelector(".wrong").classList.remove("displayBlock");

    // initialize fields
    document.querySelector("#number").value = "";

    // clear the previous  score
    document.querySelector(".score")?.remove();

    // set score to zero
    score = 0;
    
    // return progress to zero
    document.querySelector(".progress").style.width = "0px";

}


function anyResults() {
    // check if there are any results
    if (results.length === 0) {
        // hide check answer

        // show next Quiz
        document.querySelector(".start-new-quiz").classList.add("visible");
        // display error message
        document.querySelector("#question").textContent = "Sorry there are no quizzes matching your search, try adjusting your preferences!!!!!!!";
    }
}