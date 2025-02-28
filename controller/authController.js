const User = require('../model/User');
const { validationResult } = require('express-validator');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const { findUserByEmail, addUser } = User;

const Register = async (req, res) => {
    try {

        // Validar errores antes de procesar la solicitud
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password, name } = req.body;

        // Validaciones
        if (!email || !password || !name) {
            return res.status(400).json({ message: "Todos los campos son obligatorios" });
        }

        // ¿Usuario ya existe?
        const existingUser = await findUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: "El usuario ya existe" });
        }

        // Encriptar contraseña
        const salt = await bcrypt.genSalt(parseInt(process.env.SALT_ROUNDS, 10));
        const hash = await bcrypt.hash(password, salt);

        // Crear usuario
        await addUser({ name, email, password: hash });
        return res.status(201).json({ message: "Usuario creado exitosamente" });

    } catch (error) {
        console.error("Error al intentar registrar:", error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        (email, password);

        // Validaciones
        if (!email || !password) {
            return res.status(400).json({ message: "Todos los campos son obligatorios" });
        }

        // Buscar usuario
        const foundUser = await findUserByEmail(email);
        if (!foundUser) {
            return res.status(404).json({ message: "Usuario no encontrado o registrado" });
        }

        // Comparar contraseñas
        const isMatch = await bcrypt.compare(password, foundUser.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Contraseña incorrecta" });
        }

        // Generar token JWT
        const token = jwt.sign(
            { email: foundUser.email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES }
        );
        const user = { email: foundUser.email, name: foundUser.name }

        return res.status(200).json({ token, user }); //coregir posible error a porque esta enviando datos sencibles como la password


    } catch (error) {
        console.error("Error al intentar logearse:", error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

module.exports = { Register, login };