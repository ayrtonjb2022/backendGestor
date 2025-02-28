const  db = require('../config/db');

const Tasks = {
    allTasks: async (user) => {
        const [rows] = await db.query('SELECT tasks.id AS id_tasks, task_assignments.id, tasks.title, tasks.description, tasks.status, teams.name FROM tasks JOIN task_assignments ON tasks.id = task_assignments.task_id JOIN users ON task_assignments.user_id = users.id JOIN teams ON teams.id = task_assignments.team_id WHERE users.email = ?', [user]);

        return rows;
    },
    allTaskbyId: async (taskData) => {
        const { user_id, id_team } = taskData;
        (taskData);
        
        const [rows] = await db.query(`
            SELECT 
                task_assignments.id, 
                tasks.title, 
                tasks.description, 
                tasks.status, 
                teams.name AS name_team, 
                tasks.id AS id_tasks 
            FROM tasks 
            JOIN task_assignments ON tasks.id = task_assignments.task_id  
            JOIN users ON task_assignments.user_id = users.id  
            JOIN teams ON teams.id = task_assignments.team_id  
            WHERE users.id = ? AND task_assignments.team_id = ?;
        `, [user_id, id_team]);
    
        return rows;
    },
    
    addTask: async (task) => {
        const { title, description} = task;
        const [rows] = await db.query('INSERT INTO tasks (title, description) VALUES (?,?)', [title, description]);
        return rows;
    },
    task_assignments: async (task, user, id_team) => {
        const [rows] = await db.query('INSERT INTO task_assignments (task_id,user_id,team_id) VALUES (?,?,?)', [task, user, id_team]);
        return rows;
    },

    updateTask: async (task) => {
        try {
            const { status, id_tasks, user } = task;
            
            // Verificamos si la tarea asignada coincide con el usuario:
            const [rows] = await db.query(
                'SELECT ta.*, u.* FROM task_assignments ta JOIN users u ON ta.user_id = u.id WHERE ta.task_id = ? AND u.email = ?',
                [id_tasks, user]
            );
    
            if (rows.length === 0) {
                return { message: "No se encontró la tarea para actualizar" };
            }
    
            // Actualizamos el estado de la tarea:
            const [rowsUpdate] = await db.query(
                'UPDATE tasks SET status = ? WHERE id = ?',
                [status, id_tasks]
            );
    
            // Devolvemos un mensaje de éxito y los resultados de la actualización
            return { message: "Tarea actualizada correctamente", rowsUpdate };
        } catch (error) {
            console.error("Error al actualizar la tarea:", error);
            return { message: "Hubo un error al actualizar la tarea." }; // En caso de error, devolvemos un mensaje de error
        }
        
    },
    deleteTask: async (task) => {
        try {
            const { id_tasks, user } = task;
    
            // Eliminar la asignación de la tarea
            const [rowsAssignments] = await db.query('DELETE FROM task_assignments WHERE task_id = ? AND user_id = ?', [id_tasks, user]);
    
            // Verificar si la asignación fue eliminada correctamente
            if (rowsAssignments.affectedRows > 0) {
                // Eliminar la tarea
                const [rowsTasks] = await db.query('DELETE FROM tasks WHERE id = ?', [id_tasks]);
    
                // Verificar si la tarea fue eliminada
                if (rowsTasks.affectedRows > 0) {
                    return { message: "Tarea eliminada correctamente", rowsAssignments, rowsTasks };
                } else {
                    ("No se eliminó la tarea con id:", id_tasks);
                    return { message: "No se encontró la tarea para eliminar", rowsAssignments, rowsTasks };
                }
            } else {
                ("No se encontró la asignación de tarea con task_id:", id_tasks, "y user_id:", user);
                return { message: "No se encontró la asignación de tarea", rowsAssignments };
            }
    
        } catch (error) {
            console.error("Error al eliminar tarea:", error);
            throw error;  // Lanza el error para ser manejado por el controlador
        }
    }
    
    
}

module.exports = Tasks;