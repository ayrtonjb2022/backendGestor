const db = require('../config/db');

const User = {
    //verificar user 
    findUserByEmail: async (email)=>{
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0];
    },

    findUser: async (email)=>{
        const [rows] = await db.query('SELECT name,email FROM users where email = ?',[email])
        return rows[0];
    },


    addUser: async (User) => {
        try {
            const {name,email,password} = User;
            const [rows] = await db.query('INSERT INTO users (name,email,password,role) VALUES (?,?,?,"user")', [name,email,password]);
            return rows;
        } catch (error) {
            console.error(error, "aqui");
        }
    },

    updateUser: async (name, email, id, currentEmail) => {
        return await db.query(
            'UPDATE users SET name = ?, email = ? WHERE email = ? AND id = ?', 
            [name, email, currentEmail, id]
        );
    },
    updateUserPassword: async (email,password) => {
        const [rows] = await db.query('UPDATE users SET password = ? WHERE email = ?', [password, email]);
        return rows
    }


}

module.exports = User;