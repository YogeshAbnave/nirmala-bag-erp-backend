const FCM = require('fcm-node');
const serverKey = 'AAAAU-ZUZxU:APA91bFBdgOXIFY6QB1r4nFgv43sXaCY-1ZTlEGm3KF57Di4x88px_77kGXCL94uvtrgEpBp3nZtC2OqlR64IsMZLtU6RnniMuDynsWRqYmK3FFC-C4vTIl-uD1lAutYHWCu7KOgE0ZY';
const fcm = new FCM(serverKey);

function sendNotification(params, callback) {

    let { title, body, type, description, userId, deviceToken } = params;

    let notificationData = {
        "userId": userId,
        "title": title,
        "body": body,
        "type": type,
        "description": description
    }

    let message = {
        to: deviceToken, // It is a device based token
        priority: "high",
        show_in_foreground: true,
        content_available: true,
        notification: {
            title: title,
            body: body,
            //big_text: "Test Message",                        // Content of the notification
            sound: "default",
            icon: "ic_notification", // Default notification icon
            // badge: 1,
        },
        data: notificationData // Payload you want to send with your notification
    }

    fcm.send(message, (err, result) => {
        if (err) {
            console.log('Error while sending notification: ', err)
            if (callback) {
                callback({ status: 500, message: 'Error while sending notification' });
            }
        } else {
            console.log('Notification successful: ', result);
            if (callback) {
                callback({ status: 1, message: 'Notification successful' });
            }
        }
    });
}

module.exports = {
    sendNotification: sendNotification
}