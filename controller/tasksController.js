const taskModel = require('../model/tasks');
const User = require('../model/User');
const getTaskC = async (req, res) => {
    try {
        const user = req.user.email;
        ("task", user);
        
        const result = await taskModel.allTasks(user)
        return res.status(201).json(result)
    } catch (error) {
        return res.status(500).json({
            message: "Error al obtener las tareas",
            redirectToLogin: true
        });
    }
}
const getTaskByIdC = async (req, res) => {
    try {
        const {user_id, team_id} = req.params;
        ("User ID:", user_id, "Team ID:", team_id);

        if (!user_id || !team_id) {
            return res.status(400).json("Todos los campos son obligatorios");
        }

        const result = await taskModel.allTaskbyId({ user_id, id_team: team_id });
        
        if (result.length === 0) {
            return res.status(404).json("No se encontraron tareas para este usuario en este equipo");
        }

        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({
            message: "Error al obtener los datos",
            redirectToLogin: true
        });
    }
};

//post


const postTaskC = async (req, res) => {
    try {
        const { title, description, team_id, user_email } = req.body;
        let assignedUser = req.user.email; // Usuario autenticado por defecto

        // Función para verificar si un usuario existe en la BD
        const findUserByEmail = async (email) => {
            if (!email || typeof email !== "string" || email.trim() === "") return null;
            return await User.findUserByEmail(email.trim());
        };

        // Verifica si user_email es válido y cambia assignedUser si el usuario existe
        const userVerify = await findUserByEmail(user_email);
        if (userVerify) {
            assignedUser = user_email;
        } else if (user_email) {
            return res.status(400).json({ error: "El usuario asignado no existe" });
        }

        // Verificación de campos obligatorios
        if (!title || !description) {
            return res.status(400).json({ error: "Todos los campos son obligatorios" });
        }

        // Verificar la existencia del usuario asignado
        const assignedUserVerify = await findUserByEmail(assignedUser);
        if (!assignedUserVerify) {
            return res.status(400).json({ error: "El usuario no existe" });
        }

        const user_id = assignedUserVerify.id;

        // Crear la tarea y asignarla en paralelo para mayor eficiencia
        const [task] = await Promise.all([
            taskModel.addTask({ title, description })
        ]);

        if (!task.insertId) {
            return res.status(400).json({ error: "Error al crear la tarea" });
        }

        const id_task = task.insertId;

        // Asignar la tarea al usuario
        await taskModel.task_assignments(id_task, user_id, team_id);

        return res.status(201).json({
            message: "Tarea creada",
            id_task: id_task
        });

    } catch (error) {
        return res.status(500).json({
            message: "Error al obtener los datos",
            redirectToLogin: true
        });
    }
};



const updateStatusTasks = async (req, res) => { 
    try {
        const { id_tasks, status } = req.body; // Obtenemos los parámetros de la solicitud
        const user = req.user.email; // Obtenemos el email del usuario desde el token

        // Verificación de parámetros faltantes
        if (!user || !id_tasks || !status) {
            return res.status(400).json({ message: "Faltan parámetros para la actualización de la tarea." });
        }
        
        // Llamamos al model para actualizar la tarea
        const response = await taskModel.updateTask({ status, id_tasks, user });

        // Verificamos si hubo cambios
        if (response.affectedRows === 0) {
            return res.status(200).json({ message: "No hubo cambios, el estado ya estaba actualizado." });
        } 
        
        return res.status(200).json({ message: "Tarea actualizada con éxito" });

    } catch (error) {
        return res.status(500).json({
            message: "Error al obtener los datos",
            redirectToLogin: true
        });
    }
};


//dellete

const deleteTaskC = async (req, res) => {
    try {
        const { id_tasks} = req.params;
        const user = req.user.email;

        const veryfi = await User.findUserByEmail(user);
        const userId = veryfi.id;
        (id_tasks);
        
        // Llamar al modelo para eliminar la tarea
        const result = await taskModel.deleteTask({ id_tasks, user:userId });

        // Verificar si se realizó la eliminación correctamente
        if (result.rowsAssignments.affectedRows > 0 && result.rowsTasks.affectedRows > 0) {
            return res.status(200).json({ message: "Tarea eliminada con éxito." });
        } else {
            return res.status(404).json({ message: "No se encontró la tarea o la asignación para eliminar." });
        }
    } catch (error) {
        return res.status(500).json({
            message: "Error al obtener los datos",
            redirectToLogin: true
        });
    }
};



module.exports = {getTaskC, postTaskC, getTaskByIdC,updateStatusTasks,deleteTaskC};