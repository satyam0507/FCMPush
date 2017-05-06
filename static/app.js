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

function nvLog(msg, type) {
  var color = "color:#444"
  if (!(type && typeof type === 'string' && type.length > 0)) {
    type = 'log';
  }
  switch (type) {
    case 'info':
      color = "color:#2196f3";
      break;
    case 'warn':
      color = "color:#9c27b0";
      break;
    case 'error':
      color = "color:#f44336";
  }
  console[type]('%c[app.js] :: ' + msg, color);
}

function authenticateUser() {
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

function enableUI() {
  var subEl = document.getElementById('js-sub-button');
  if (subEl) {
    subEl.disabled = false;
  }
}

function disableUI() {
  var subEl = document.getElementById('js-sub-button');
  if (subEl) {
    subEl.disabled = true;
  }
}




function registerServiceWorker() {
  return navigator.serviceWorker.register('worker.js', {
    scope: '/'
  })
}

function pushSubProcess() {
  if (Notification.permission === 'granted') {
    disableUI();
    //check for the pushsubscription ????????
  } else {
    if (Notification.permission === 'denied') {
      disableUI();
    } else {
      enableUI();
      blindClick();
    }
  }
}


function blindClick(subEl) {
  var subEl = document.getElementById('js-sub-button');
  if (subEl) {
    subEl.addEventListener('click', requestPermission);
  }
}

function requestPermission() {
  // check if pushManager is supproted or not
  if ('PushManager' in window) {
    nvLog('push is supported in your browser', 'info');
    Notification.requestPermission().then(function (result) {
      if (result === 'granted') {
        nvLog('Permission for Notifications is granted', 'info');
        disableUI();
        subscribeUser();
      }
      if (result === 'denied') {
        disableUI();
        nvLog('Permission for Notifications was denied', 'warn');
      }
    }).catch(function (error) {
      enableUI();
      nvLog('error during push Request :: ' + error, 'error');
    })
  } else {
    disableUI();
    nvLog('push is not supported in your browser', 'error');
  }



}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function subscribeUser() {
  navigator.serviceWorker.ready.then(function (registration) {
    // registration.pushManager.getSubscription().then(function(subscription){
    //   console.log(subscription);
    // }).catch(function(error){
    //   console/log(error);
    // });
    registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        'BFDcwZy0c9JDqLHQYS7VWbgnr9jKRFIrRzDba2I3ZobQLUVqrIlidXgm9QUijowogGTkSY5mu0Ux_6YkOtc8XxY'
      )
    }).then(function (subscription) {
      nvLog('The subscription was successful', 'info');
      disableUI();
      sendOnServer(subscription).then(function (send) {
        nvLog('SaveEndPoint Process Completed', 'info');
      }).catch(function (error) {
        nvLog('SaveEndPoint Process failed', 'error');
      })
    }).catch(function (error) {
      nvLog('Unable to subscribe to push :: ' + error, 'error');
      enableUI();
    })
  })
}

function getEndPoint() {

}

function getUserId() {
  var userId = localStorage.getItem('_nvUser');
  if (userId && typeof userId === 'string' && userId.length > 0) {
    return userId;
  } else {
    return false;
  }
}

function setNewUserId(userId) {
  window.localStorage.setItem('_nvUser', userId);
  nvLog('localstore set', 'info');
}

function sendOnServer(subscription) {
  var subscriptionData = JSON.stringify(subscription);
  var userId = getUserId();
  if (userId) {
    // this is a old user
    var oldUserRef = firebase.database().ref('users/' + userId);
    oldUserRef.update(JSON.parse(subscriptionData)).then(function () {
      nvLog('Old user data updated', 'info');
    }).catch(function (error) {
      nvLog('error during updating new user :: ' + error, 'error');
    })
  } else {
    // new User ddetected

    var userListRef = firebase.database().ref('users');
    var newUserRef = userListRef.push();
    var newUserId = newUserRef.key;
    newUserRef.set(
      JSON.parse(subscriptionData)
    ).then(function () {
      nvLog('data Send To Server', 'info');
    }).catch(function (error) {
      nvLog('error during sending data to server :: ' + error, 'error');
    });
    setNewUserId(newUserId);
  }
  return new Promise(function (resolve, reject) {
    resolve();
  })
}




firebase.auth().onAuthStateChanged(function (user) {
  if (user) {
    // User is signed in.
    nvLog('user is authenticated', 'info');

    // check if service worker is supported or not

    if ('serviceWorker' in navigator) {
      nvLog('Service Worker is supported in your browser', 'info');
      registerServiceWorker().then((reg) => {
        nvLog('service worker registration successfull', 'info');
        pushSubProcess();
      }).catch((err) => {
        disableUI();
        nvLog('not able to register the service worker ::' + err, 'error');
      })

    } else {
      disableUI();
      nvLog('Service Worker is not supported in your browser this is not good ', 'error');
    }

  } else {
    // No user is signed in.
    nvLog('user is not authenticated', 'warn');
    disableUI();
    authenticateUser();
  }
});