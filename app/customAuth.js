'use strict';


var admin = require("firebase-admin"),
    serviceAccount = require("../static/private/serviceAccountKey.json"),
    uid = require("../static/private/keys.json").uid;

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://fcmpush-31f7a.firebaseio.com"
});

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

module.exports = {
    getToken:getToken
}