const db = require('../config/db');

const TeamMembers = {
    getDataTeamMembers: async (user) => {
        try {
            const [rows] = await db.query(
                `SELECT 
                    tm.id, 
                    tm.team_id, 
                    users.name,
                    users.email, 
                    teams.name AS name_team, 
                    tm.role 
                FROM team_members AS tm 
                JOIN users ON tm.user_id = users.id 
                JOIN teams ON tm.team_id = teams.id 
                WHERE users.email = ?`, 
                [user]
            );
            //("fila:",rows);
            return rows;
        } catch (error) {
            console.error(error);
        }
    },

    getTeamDetails: async (teamId) => {
        try {
            const [rows] = await db.query(
                `SELECT 
                    t.name AS team_name,
                    u.id AS user_id,
                    u.name AS user_name,
                    COALESCE(tsk.title, 'Este usuario no tiene task') AS task_title,
                    COALESCE(tsk.status, 'N/A') AS task_status,
                    COALESCE(ta.id, 'N/A') AS task_assignment_id,
                    tm.role AS rol_member,
                    tm.team_id,
                    u.email AS email_user
                FROM team_members tm
                JOIN teams t ON tm.team_id = t.id
                JOIN users u ON tm.user_id = u.id
                LEFT JOIN task_assignments ta ON tm.user_id = ta.user_id AND tm.team_id = ta.team_id
                LEFT JOIN tasks tsk ON ta.task_id = tsk.id
                WHERE tm.team_id = ?`,
                [teamId]
            );

            if (rows.length === 0) {
                return { message: "No se encontraron miembros para este equipo." };
            }

            // Formatear los datos en un objeto estructurado
            const result = {
                team_name: rows[0].team_name,
                members: []
            };

            // Crear un mapa de integrantes y sus tareas
            const membersMap = new Map();
            rows.forEach((row) => {
                if (!membersMap.has(row.user_id)) {
                    membersMap.set(row.user_id, {
                        name: row.user_name,
                        rol_user: row.rol_member,
                        email_user: row.email_user,
                        team_id: row.team_id,
                        tasks: []
                    });
                }

                // Agregar la tarea si existe
                if (row.task_assignment_id !== 'N/A') {
                    membersMap.get(row.user_id).tasks.push({
                        task_id: row.task_assignment_id,
                        title: row.task_title,
                        status: row.task_status
                    });
                }
            });

            // Agregar los miembros al resultado final
            result.members = Array.from(membersMap.values());

            return result;
        } catch (error) {
            console.error("Error fetching team details:", error);
            throw error;
        }
    },

    postTeam: async (data) => {
        const {name,description} = data
        try {
            const [rows] = await db.query(
                `INSERT INTO teams (name, description) VALUES (?, ?)`,
                [name, description]
            );
            return rows;
        } catch (error) {
            console.error(error);
        }
    },
    postTeamMembers: async (data) => {
        try {
            const [rows] = await db.query(
                `INSERT INTO team_members (team_id, user_id, role) VALUES (?, ?, ?)`,
                [data.team_id, data.user_id, data.role]
            );
            return rows;
        } catch (error) {
            console.error(error);
        }
    },
    //delete team
    deleteTeamMembers: async (data) => {
        const { user_id, team_id } = data;
        const connection = await db.getConnection(); // Obtener conexión
        try {
            await connection.beginTransaction(); // Iniciar transacción
    
            const [response] = await connection.query(
                "DELETE FROM team_members WHERE user_id = ? AND team_id = ?;",
                [user_id, team_id]
            );
            
            await connection.commit(); // Confirmar cambios
            connection.release(); // Liberar conexión
    
            return { response };
        } catch (error) {
            await connection.rollback(); // Revertir cambios en caso de error
            connection.release(); // Liberar conexión
            console.error(error);
            throw error;
        }
    },
    //put
    putTeamMember: async (data) => {
        try {
            const {user_id,team_id,user_role} = data;
            const [rows] = await db.query(
                `UPDATE team_members SET role = ? WHERE user_id = ? AND team_id = ?`,
                [user_role,user_id,team_id]
            );
            return rows
            
        } catch (error) {
            return error
        }
    }
    
    
}

module.exports = TeamMembers;
