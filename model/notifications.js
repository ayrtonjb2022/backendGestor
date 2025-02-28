const db = require('../config/db')

const Notifications = {
    getNotifications:async (user) => {
        try {
            const [rows]=await db.query('SELECT notifications.id,notifications.created_at,notifications.message,notifications.type, notifications.sender_id, notifications.is_read, teams.name AS name_teams FROM notifications JOIN teams ON notifications.sender_id = teams.id WHERE notifications.user_id = ? AND notifications.is_read = 0',[user])
            return rows
        } catch (error) {
            console.error(error);
            
        }
    },
    getNotificationsById: async ({user,id}) => {
        const [rows] = await db.query('SELECT notifications.id,notifications.created_at,notifications.message,notifications.type, notifications.sender_id, notifications.is_read, teams.name AS name_teams FROM notifications JOIN teams ON notifications.sender_id = teams.id WHERE notifications.user_id = ? and notifications.id = ?', [user, id]);
        return rows
    },
    addNotification: async (data) => {
        try {
            const {user_id,type,message,sender_id} = data
            const [rows] = await db.query('INSERT INTO notifications (sender_id, user_id, message, type) VALUES (?,?,?,?)', [sender_id,user_id,message,type])
            return rows
        } catch (error) {
            console.error(error);
        }
    },
    updateNotification: async (data) => {
        try {
            const {id,user_id} = data
            const [rows] = await db.query('UPDATE notifications SET is_read = 1 WHERE id = ? and user_id = ?', [id,user_id])
            return rows
        } catch (error) {
            console.error(error);
        }
    },
    
}
module.exports = Notifications