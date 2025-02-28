const User = require('../model/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const getInfoUser = async (req, res) => {
    try {
        const user = req.user.email;
        const result = await User.findUser(user);        
        res.send(result);
    } catch (error) {
        return res.status(500).json({
            message: "Error al obtener los datos",
            redirectToLogin: true
        });
    }
}

const upDateUser = async (req, res) => {
    try {
        const { name, email } = req.body;
        const user_email = req.user.email;

        // Verificar si el email ya está en uso por otro usuario
        const existingUser = await User.findUserByEmail(email);
        const infoCurrentEmail = await User.findUserByEmail(user_email);
        const id = infoCurrentEmail.id;
        const currentEmail = infoCurrentEmail.email;

        //verificar si solo quierre cambiar el email o el nombre 
        if(email == user_email && name == infoCurrentEmail.name) {
            return res.status(200).json({ success: false, message: 'No hay cambios' });
        }
        

        ("controller-email-todo", existingUser);

        if (existingUser && existingUser.id !== id) {
            return res.status(409).json({ success: false, message: 'El email ya está en uso por otro usuario' });
        }

        // Actualizar usuario
        const [result] = await User.updateUser(name, email, id, currentEmail);

        if (!result || result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado o sin cambios' });
        }

        // Generar token JWT
        const token = jwt.sign(
            { email: email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES }
        );

        return res.status(200).json({ success: true, message: 'Usuario actualizado correctamente', newEmail: email, newToken: token });

    } catch (error) {
        return res.status(500).json({
            message: "Error al obtener los datos",
            redirectToLogin: true
        });
    }
};

const updateUserPassword = async (req, res) => {
    try {
        const { password, newPassword } = req.body;
        const user_email = req.user.email;

        // Validaciones de entrada
        if (typeof password !== "string" || !password.trim()) {
            return res.status(400).json({ message: "Contraseña actual inválida" });
        }
        if (typeof newPassword !== "string" || !newPassword.trim()) {
            return res.status(400).json({ message: "Nueva contraseña inválida" });
        }
        if (password === newPassword) {
            return res.status(400).json({ message: "La nueva contraseña no puede ser igual a la anterior" });
        }
        if (newPassword.length < 8) {
            return res.status(400).json({ message: "La nueva contraseña debe tener al menos 8 caracteres" });
        }

        const foundUser = await User.findUserByEmail(user_email);
        if (!foundUser) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        // Comparar contraseñas
        const isMatch = await bcrypt.compare(password, foundUser.password);
        if (!isMatch) {
            return res.status(401).json({ message: "La contraseña actual es incorrecta" });
        }

        // Encriptar nueva contraseña
        const saltRounds = Number(process.env.SALT_ROUNDS) || 10;
        const salt = await bcrypt.genSalt(saltRounds);
        const hash = await bcrypt.hash(newPassword, salt);

        // Actualizar la contraseña en la base de datos
        const response = await User.updateUserPassword(user_email, hash);
        if (!response || response.affectedRows === 0) {
            return res.status(409).json({ message: "No se pudo actualizar la contraseña" });
        }

        
        return res.status(200).json({ message: "Contraseña actualizada con éxito" });

    } catch (error) {
        return res.status(500).json({
            message: "Error al obtener los datos",
            redirectToLogin: true
        });
    }
};



module.exports = { getInfoUser, upDateUser, updateUserPassword };