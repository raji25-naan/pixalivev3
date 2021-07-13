const { updateNotification } = require("../controllers/User/Notification");
const Users = require("../models/User/Users");
global.admin = require("firebase-admin");
const serviceAccount = require("../serviceAccountkey.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://pixalive-fa208-default-rtdb.firebaseio.com/",
});


module.exports.verifyGCMToken = function (fcmToken) {
    console.log(1);
    return admin.messaging().send({
        token: fcmToken
    }, true)
}

module.exports.sendNotification = async function (sender, receiver, type) {
    var message;
    var title;

    if (type == 0) {
        title = 'New like';
        message = ' liked your post';
        message1 = ' others liked your Post'

    }
    else if (type == 1) {
        title = 'New comment';
        message = ' commented on your post';
        message1 = ' others commented on  your Post'
    }
    else if (type == 2) {
        title = 'New follow';
        message = '  started following you';
        message1 = ' Others started following you'
    }
    else if (type == 3) {
        title = 'Follow Request';
        message = ' Request to follow you';
        message1 = ' Others  Request to follow you'
    }
    else if (type == 4) {
        title = 'Accepted';
        message = '  Accepted your Request';
        message1 = ' Others  Accepted your Request '
    }
    else if (type == 5) {
        title = 'Received New Message';
        message = '  New Message';
        message1 = ' New Message '
    }
    //getUserInfo
    const array = [];
    const receiverInfo = await Users.findOne({ _id: receiver });
    const senderDetails = await Users.find({ _id: sender }, { _id: 0, username: 1 })
    senderDetails.forEach((datas) => {
        array.push(datas.username)
    })
    if (receiverInfo && array)
        var registrationTokens = [
            receiverInfo.gcm_token
        ];
    if (senderDetails.length > 2) {
        const group = array.length - 2;
        const group1 = array[array.length - 1] + "," + array[array.length - 2]
        const grouping = group1 + " + " + group;
        var payload = {
            notification: {
                title: title,
                body: grouping + message1,
            }
        };

        admin.messaging().sendToDevice(registrationTokens, payload)
            .then((response) => {
                console.log(registrationTokens, payload);

            })
            .catch((error) => {
                console.log('Notification failed! ' + error);

            });
        //updateNotification
        updateNotification(sender, receiver, message1, title);
    }
    else {
        var payload = {
            notification: {
                title: title,
                body: array + message,
            }
        };
        admin.messaging().sendToDevice(registrationTokens, payload)
            .then((response) => {
                console.log(registrationTokens, payload);

            })
            .catch((error) => {
                console.log('Notification failed! ' + error);

            });
        //updateNotification
        updateNotification(sender, receiver, message, title);
    }

}
