'use strict';


var admin = require("firebase-admin"),
    serviceAccount = require("../static/private/serviceAccountKey.json"),
    keys = require("../static/private/keys.json"),
    webpush = require('web-push');
var uid = keys.uid;

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://fcmpush-31f7a.firebaseio.com"
});

const vapidKeys = {
  publicKey:
keys.serverPublicKey,
  privateKey: keys.serverPrivateKey
};

webpush.setVapidDetails(
  'mailto:satyam0507@gmail.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

function getToken() {
    return admin.auth().createCustomToken(uid)
        .then(function (customToken) {
            // Send token back to client
            return customToken;
        })
        .catch(function (error) {
            console.log(error);
            return;
        });
}

function sendPush(data) {
    return getSubscriptionsFromDatabase()
        .then(function (subscriptions) {
            let promiseChain = Promise.resolve();

            for (let i = 0; i < subscriptions.length; i++) {
                const subscription = subscriptions[i];
                promiseChain = promiseChain.then(() => {
                    return triggerPushMsg(subscription, data);
                });
            }

            return promiseChain;
        })
}

function getSubscriptionsFromDatabase() {
    return new Promise(function (resolve, reject) {
        var ref = admin.database().ref("users/");
        ref.once("value")
            .then(function (snapshot) {
                var data = snapshot.val();
                var subscriptionArray = [];
                for (let key in data) {
                    subscriptionArray.push(data[key]);
                }
                resolve(subscriptionArray);
            });
    })
}

function triggerPushMsg(subscription, dataToSend) {
    return webpush.sendNotification(subscription, JSON.stringify(dataToSend))
        .catch((err) => {
            if (err.statusCode === 410) {
                return deleteSubscriptionFromDatabase(subscription._id);
            } else {
                console.log('Subscription is no longer valid: ', err);
            }
        });
};

function deleteSubscriptionFromDatabase(subscription_id){
    return new Promise(function(resolve,reject){
        console.log(subscription_id);
        resolve();
    })
}

module.exports = {
    getToken: getToken,
    sendPush: sendPush
}