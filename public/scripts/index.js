let questionList = [];
let user;

// doc ready fuction
$(document).ready(function () {
    console.log("index script launched loaded")
    getQuestions()
    getCurrentUser()

    $('#postBtn').click(function () {
        makePostWindow()
    })

})

// populates question list so it can be sorted in order of Highest upvote total
function populateQuestionList(array) {
    questionList = []
    $('#postBox').empty()
    for (let i = 0; i < array.length; i++) {
        questionList.push(array[i])
    }

    questionList.sort((a, b) => b.upvotes - a.upvotes);
    for (let i = 0; i < questionList.length; i++) {
        makeComponents(questionList[i])
    }
}

// makes components for each question fetched from the Database
function makeComponents(question) {
    console.log("making components")
    const questionBox = $("<div class='questionBox'></div>");
    const textBox = $("<div class='textBox'></div>");
    const buttonBox = $("<div class='buttonBox'></div>");
    const questionText = $('<p>').text(question.text);
    const authorText = $('<p>').text('asked by: ' + question.author)
    const numberUpvotes = $('<p>').text(question.upvotes);
    const upvoteBtn = $("<button>").attr('id', 'upvoteBtn');
    const icon = $('<i>').attr('class','fa-solid fa-heart')

    upvoteBtn.append(icon)
    textBox.append(questionText);
    buttonBox.append(authorText, upvoteBtn, numberUpvotes);
    questionBox.append(textBox, buttonBox);
    $('#postBox').append(questionBox);

    if (question.viewers.some(viewer => viewer.username == user)) {
        const viewer = question.viewers.find(viewer => viewer.username == user)
        if(viewer.upvote == true){
            upvoteBtn.addClass('active')
        }
    }

    upvoteBtn.click(function () {

        // checks if current user has reacted to the post before.
        if (!question.viewers.some(viewer => viewer.username == user)) {
            console.log("not reacted to this post before")
            question.viewers.push({ 'username': user, 'upvote': true });
            console.log(question.viewers)
            question.upvotes++;
            console.log(question.upvotes)
        }

        // toggles upvote and downvote.
        else {
            const viewer = question.viewers.find(viewer => viewer.username == user)
            switch (viewer.upvote) {
                case true:
                    question.upvotes--;
                    viewer.upvote = false
                    console.log("Removing downvote from: ", question._id)
                    upvoteBtn.removeClass('active')
                    break;

                default:
                    question.upvotes++
                    viewer.upvote = true
                    console.log("upvoting ", question._id)
                    upvoteBtn.addClass('active')
                    break;
            }
        }
        numberUpvotes.text(question.upvotes)
        console.table(question)
        UpdateQuestion(question)
    })

}

// makes window for creating a new question post.
function makePostWindow() {
    const postWindow = $("<div class='postWindow'></div>");
    const textField = $('<input>').attr('id', 'questionTextField').attr('placeholder', 'Write a question..');
    const cancelBtn = $("<button>").text("Cancel").attr('id', 'cancelBtn');
    const submitBtn = $("<button>").text("Submit").attr('id', 'subMitBtn');


    postWindow.append(textField, cancelBtn, submitBtn);
    $('body').append(postWindow);

    cancelBtn.click(function () {
        postWindow.remove()
    })

    submitBtn.click(async function () {
        let text = $('#questionTextField').val()
        if (text.trim() === "") {
            alert("please enter a question.");
            return;
        }

        let question = { 'author': user, 'text': text, 'upvotes': 0, 'viewers': [] }
        await postQuestion(question)
        console.log("i resolved")
        getQuestions();
        postWindow.remove()
    })

}


/* ajax calls */

// Retrieves sessions current user from the server
function getCurrentUser() {
    $.ajax({
        url: '/getCurrentUser',
        method: 'GET',
        success: function (data) {
            console.log("server has returned: " + data.currentuser)
            user = data.currentuser;

        },
        error: function (error) {
            console.error('Error fetching session data:', error);
        }
    });
}

// retrieves questions from the DB
function getQuestions() {
    console.log("getting questions")

    $.ajax({
        type: 'GET',
        url: '/getQuestions',
        success: function (response) {
            console.log('Questions Retrieved');
            populateQuestionList(response);
        },
        error: function (xhr, status, error) {
            console.error('Error:', error);
        }
    });

}

// posts new questions to the DB
function postQuestion(question) {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: 'POST',
            url: '/postQuestion',
            data: JSON.stringify(question),
            contentType: 'application/json',
            success: function (response) {
                console.log("request successful resolving")
                resolve();
            },
            error: function (xhr, status, error) {
                console.error('Error:', error);
                reject(error)
            }
        })
    })
};

// updates questions in the DB
function UpdateQuestion(question) {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: 'POST',
            url: '/updateQuestion',
            data: JSON.stringify(question),
            contentType: 'application/json',
            success: function (response) {
                console.log("request successful resolving")
                resolve();
            },
            error: function (xhr, status, error) {
                console.error('Error:', error);
                reject(error)
            }
        })
    })
}

/* ajax calls */