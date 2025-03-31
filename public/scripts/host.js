let questionList = [];

$(document).ready(function () {
    getQuestions()

    $('#refreshBtn').click(function(){
        getQuestions()
    })
})

// gets the top 5 voted question and makes componets for each of them
function populateQuestionList(array) {
    questionList = []
    $('#hostBox').empty()
    for (let i = 0; i < array.length; i++) {
        questionList.push(array[i])
    }

    questionList.sort((a, b) => b.upvotes - a.upvotes);
    for (let i = 0; i < 5; i++) {
        makeComponents(questionList[i],i)
    }
}

// makes components for passed in questions
function makeComponents(question, i) {
    console.log("making components")
    const questionBox = $("<div class='hostQuestionBox'></div>");
    const rank = $('<h2>').text('Rank #'+String(i+1))
    const textBox = $("<div class='textBox'></div>");
    const questionText = $('<h2>').text(question.text);
    const authorText = $('<p>').text('asked by: ' + question.author)
    const votes = $('<p>').text('voted by '+question.upvotes+' people.')
  
    textBox.append(rank,questionText,authorText,votes);
    questionBox.append(textBox);
    $('#hostBox').append(questionBox);
}

/*ajax calls*/

//Retrievs questions from database.
function getQuestions() {
    $.ajax({
        type: 'GET',
        url: '/getQuestions',
        success: function (response) {
            populateQuestionList(response);
        },
        error: function (xhr, status, error) {
            console.error('Error:', error);
        }
    });
}
