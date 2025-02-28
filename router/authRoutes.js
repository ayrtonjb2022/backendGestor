const express = require('express');
const router = express.Router();
const { Register, login } = require('../controller/authController')
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');

// Limitar las solicitudes de login (5 intentos cada 15 minutos)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // Máximo 5 intentos de login
  message: "Demasiados intentos de inicio de sesión. Intenta de nuevo más tarde."
});

router.post('/register', [
  body('email').isEmail().withMessage('Formato de email inválido'),
  body('password').isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres'),
  body('name').notEmpty().withMessage('El nombre es obligatorio')
],
  Register);
router.post('/login', loginLimiter, login);

module.exports = router;