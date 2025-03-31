let username;
let ishost;

// document ready function, just shoiws information to the user of rtheir login
$(document).ready(async function () {
    await getSession(); 

    $('#userInfo').text('logged in as: ' + username); 

    // Checks if user is host
    switch(ishost) {
        case true:
            $('#hostInfo').text("account type: Host account"); 
            break;

        default:
            $('#hostInfo').text("account type: User account"); 
            break;
    }
});

// getSession ajax call
function getSession() {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: '/getSession',
            method: 'GET',
            success: function (data) {
                console.log("server has returned: " + data.session.currentuser);
                username = data.session.currentuser; 
                ishost = data.session.ishost; 
                resolve(); 
            },
            error: function (error) {
                console.error('Error fetching session data:', error);
                reject(); 
            }
        });
    });
}