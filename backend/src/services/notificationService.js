const { Expo } = require('expo-server-sdk');

const expo = new Expo();

/**
 * Send push notifications to multiple users
 * @param {Array} pushTokens - Array of Expo push tokens
 * @param {Object} notification - { title, body, data }
 */
const sendPushNotifications = async (pushTokens, notification) => {
    if (!pushTokens || pushTokens.length === 0) {
        console.log('No push tokens to send to');
        return;
    }

    // Filter out invalid tokens
    const validTokens = pushTokens.filter(token => Expo.isExpoPushToken(token));

    if (validTokens.length === 0) {
        console.log('No valid Expo push tokens');
        return;
    }

    // Create messages
    const messages = validTokens.map(token => ({
        to: token,
        sound: 'default',
        title: notification.title,
        body: notification.body,
        data: notification.data || {},
    }));

    // Chunk messages (Expo recommends max 100 per request)
    const chunks = expo.chunkPushNotifications(messages);
    const tickets = [];

    for (const chunk of chunks) {
        try {
            const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
            tickets.push(...ticketChunk);
        } catch (error) {
            console.error('Error sending push notification chunk:', error);
        }
    }

    // Log results
    tickets.forEach((ticket, index) => {
        if (ticket.status === 'error') {
            console.error(`Push notification error for token ${validTokens[index]}:`, ticket.message);
        }
    });

    return tickets;
};

module.exports = { sendPushNotifications };
