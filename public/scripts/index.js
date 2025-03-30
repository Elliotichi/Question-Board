let questionList = [];

let user;

$(document).ready(function () {
    console.log("index script launched loaded")
    getQuestions()
    getCurrentUser()

    $('#postBtn').click(function () {
        makePostWindow()
    })



})

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

function populateQuestionList(array) {
    questionList = []
    $('#postBox').empty()
    for (let i = 0; i < array.length; i++) {
        questionList.push(array[i])
        
    }
    console.table(questionList)
    displayComponents(questionList)
}

function displayComponents(array) {
    for (let i = 0; i < array.length; i++) {
        makeComponents(array[i])
    }
}

function makeComponents(question) {
    console.log("making components")
    const questionBox = $("<div class='questionBox'></div>");
    const textBox = $("<div class='textBox'></div>");
    const buttonBox = $("<div class='buttonBox'></div>");
    const questionText = $('<p>').text(question.text);
    const authorText = $('<p>').text('asked by: ' + question.author)
    const upvoteBtn = $("<button>").text("upvote").attr('id', 'upvoteBtn');

    textBox.append(questionText);
    buttonBox.append(authorText,upvoteBtn);
    questionBox.append(textBox, buttonBox);
    $('#postBox').append(questionBox);

    upvoteBtn.click( function(){
        if(!question.viewers.some(viewer => viewer.username == user)){
            question.viewers.push({'username':user,'upvote':true});
            question.upvotes++;
        }
        else{
            const viewer = question.viewers.find(viewer => viewer.username == user)
            switch(viewer.upvote){
                case true :
                    question.upvotes--;
                    viewer.upvote = false
                    break;

                default :
                    question.upvotes++
                    viewer.upvote = true
                    break;
            }
        }
    })

}

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
        let question = { 'author': user, 'text': text, 'upvotes': 0, 'viewers': [] }
        await updateDB(question)
        console.log("i resolved")
        getQuestions();

    })


}

function updateDB(question) {
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

