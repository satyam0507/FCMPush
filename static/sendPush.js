'use strict';

firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        // User is signed in.
        var refToUsers = firebase.database().ref('users/');
        refToUsers.once('value').then(function (snapshot) {
            nvLog('snapshot from database is returned', 'info');
            var usersData = snapshot.val();
            for (var key in usersData) {
                var userKey = key;
                var userEndPoint = usersData[key].endpoint;
                addToDOM(userKey, userEndPoint);
            }

        }).catch(function (err) {
            nvLog('Error during getting users data from database :: ' + err, 'error');
        });
    } else {
        // No user is signed in.
    }
});


function addToDOM(userKeyText, userEndPointText) {
    var el = document.querySelector('.js-list-group .user.js-empty');
    if (el) {
        var userKeyEl = el.querySelector('span.user-key');
        if (userKeyEl) {
            userKeyEl.textContent = userKeyText;
        }
        var userEndPointEl = el.querySelector('span.user-endPoint');
        if (userEndPointEl) {
            userEndPointEl.textContent = userEndPointText;
        }
        el.classList.remove('js-empty');
    } else {
        var newEl = document.createElement('li');
        newEl.setAttribute('class', 'list-group-item user');

        var newUserKeyEl = document.createElement('span');
        newUserKeyEl.setAttribute('class', 'user-key');
        newUserKeyEl.textContent = userKeyText;
        newEl.appendChild(newUserKeyEl);

        var newUserEndPint = document.createElement('span');
        newUserEndPint.setAttribute('class', 'user-endPoint');
        newUserEndPint.textContent = userEndPointText;
        newEl.appendChild(newUserEndPint);

        var parentEl = document.querySelector('.js-list-group');
        parentEl.appendChild(newEl);
    }
}

var sendPushBtn = document.getElementById('sendPushBtn');
if (sendPushBtn) {
    sendPushBtn.addEventListener('click', function (evt) {
        var title = document.getElementById('title').value;
        var message = document.getElementById('message').value;
        var icon = document.getElementById('icon').value;
        var image = document.getElementById('richIcon').value;
        var obj = {
            notification: {
                title: title || 'This Is Title',
                body: message || 'This Is Message',
                icon: icon || '',
                image:image||''
            }
        }
        fetch('/sendPush', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(obj)
        }).then(function(res){
            return res.json();
        }).then(function(resData){
            console.log(resData);
           $('#successModal').modal();
        }).catch(function(err){
            console.log(err);
        })
    })
}