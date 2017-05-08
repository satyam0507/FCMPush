self.addEventListener('push', function (evt) {
    console.log('push triggred');
    evt.waitUntil(self.registration.pushManager.getSubscription().then(function (subscription) {
        if (evt.data) {
            try {
                try {
                    var pushData = evt.data.json()
                } catch (error) {
                    throw Error("Invalid push : " + error.message);
                }
                console.log("Push data validated");
                return showNotification(pushData).then(function (response) {
                    console.log('notification displayed');
                })
            } catch (error) {
                console.log(error)
            }
        }
    }).catch(function (err) {
        console.log(err);
    }))
})


function showNotification(pushData) {
    return new Promise(function (resolve, reject) {
        var title = pushData.notification.title||'Title';
        self.registration.showNotification(title, {
            body: pushData.notification.body,
            requireInteraction: true,
            icon: pushData.notification.icon,
            tag: 'Unique Tag',
            image: pushData.notification.image
        })
        resolve(true);
    })
}