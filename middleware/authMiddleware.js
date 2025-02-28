const jwt = require('jsonwebtoken');
require('dotenv').config();

const authenticate = (req, res, next) => {
  const authHeader = req.header('Authorization'); // Leer el encabezado Authorization
  
  if (!authHeader) {
    return res.status(401).json({ message: 'Acceso denegado. Token no proporcionado.' });
  }

  // Dividir el encabezado para separar el prefijo 'Bearer' y el token
  const parts = authHeader.split(' ');

  // Validar que el encabezado tenga el formato correcto
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(400).json({ 
      message: 'Formato de token no válido. Debe incluir "Bearer <token>".' 
    });
  }

  const token = parts[1]; // Extraer el token puro

  try {
    // Verificar el token
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    if (!verified) {
      return res.status(401).json({ message: 'Token no válido.' });
    }
    req.user = verified; // Almacenar la información del usuario en la solicitud
    next(); // Continuar con el siguiente middleware o controlador
  } catch (err) {
    return res.status(401).json({ 
      message: 'Token no válido.', 
      error: err.message // Mostrar mensaje de error para depuración
    });
  }
};

module.exports = { authenticate };