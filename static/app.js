//    Copyright 2017 Satyam Singh (satyam0507@gmail.com) All Rights Reserved.
// 
//    Licensed under the Apache License, Version 2.0 (the "License");
//    you may not use this file except in compliance with the License.
//    You may obtain a copy of the License at
// 
//        http://www.apache.org/licenses/LICENSE-2.0
// 
//    Unless required by applicable law or agreed to in writing, software
//    distributed under the License is distributed on an "AS IS" BASIS,
//    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//    See the License for the specific language governing permissions and
//    limitations under the License.

function nvLog(msg) {
  console.log('[app.js] :: ' + msg);
}

function registerUser() {
  fetch('/auth').then((res) => {
    return res.json();
  }).then((jsonRes) => {
    if (jsonRes.token) {
      var token = jsonRes.token;
      firebase.auth().signInWithCustomToken(token).catch(function (error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
      });
    }
  }).catch((err) => {
    nvLog(err);
  })
}


firebase.auth().onAuthStateChanged(function (user) {
  if (user) {
    // User is signed in.
    nvLog('user : ' + user);

  } else {
    // No user is signed in.
    nvLog('no user');
    registerUser();
  }
});


if (navigator.serviceWorker) {
  navigator.serviceWorker.register('worker.js', {
    scope: '/'
  }).then((reg) => {
    nvLog('service worker registration successfull');
  }).catch((err) => {
    nvLog('not able to register the service worker ::' + err);
  })
}