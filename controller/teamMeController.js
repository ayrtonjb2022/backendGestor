const modelTeam = require('../model/team_members');
const User = require('../model/User');
const UserModel = require('../model/User');

const getTeamMembers = async (req, res) => {
    try {
        const user = req.user.email

        const result = await modelTeam.getDataTeamMembers(user);
        if(result.length === 0) {
            return res.status(200).json({ message: "Equipo no encontrado o no hay un equipo asociado al usuario", result: []});
        }
        return res.send({result: result});
    } catch (error) {
        return res.status(500).json({
            message: "Error al obtener los datos",
            redirectToLogin: true
        });
    }
}

const getDataMembersByid = async (req, res) => {
    try {
        const user = req.user.email;
        const { id } = req.params;
        const teamId = Number(id);

        const dataTeam = await modelTeam.getDataTeamMembers(user);
        //("Equipos del usuario:", dataTeam);

        // Verifica si el usuario pertenece al equipo
        const belongsToTeam = dataTeam.some(team => team.team_id === teamId);
        if (!belongsToTeam) {
            return res.status(404).json({ message: "Equipo no encontrado o no hay un equipo asociado al usuario" });
        }

        // Obtiene detalles del equipo
        const result = await modelTeam.getTeamDetails(teamId);

        const userStatus = result.members.filter(member => member.email_user === user);
        const us_email = userStatus[0].email_user;
        (us_email);


        return res.status(200).json({ result, "you": us_email });
    } catch (error) {
        return res.status(500).json({
            message: "Error al obtener los datos",
            redirectToLogin: true
        });
    }
};



const createNewTeam = async (req, res) => {
    try {
        const user_email = req.user.email;
        const { name, description, role } = req.body;
        const resultTeam = await modelTeam.postTeam({ name, description });
        const resultUserInfo = await UserModel.findUserByEmail(user_email);
        if (resultTeam.affectedRows === 0 || !resultUserInfo) {
            return res.status(500).json({ message: 'Error al crear el equipo' });
        }
        const user_id = resultUserInfo.id;
        const team_id = resultTeam.insertId
        const resultTeamAssign = await modelTeam.postTeamMembers({ team_id, user_id, role });
        const team_assign_id = resultTeamAssign.insertId
        res.send({ message: "Equipo creado con exito", team_assign_id, team_id });
    } catch (error) {
        return res.status(500).json({
            message: "Error al obtener los datos",
            redirectToLogin: true
        });
    }
}

const deleteTeam = async (req, res) => {
    try {
        const user = req.user.email;
        const { team_id, user_email } = req.body;
        let emailValido = user_email ? user_email : user;

        // Verificar si el usuario (o el usuario a eliminar) existe en la base de datos
        const usuarioAEliminar = await UserModel.findUserByEmail(emailValido);
        if (!usuarioAEliminar) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }


        // Verificar si el usuario que hace la petición es admin
        const usuarioSolicitante = await modelTeam.getDataTeamMembers(user);
        (usuarioSolicitante[0].role);
        const usuarioEsAdmin = usuarioSolicitante[0].role === "admin";

        if (emailValido == user) {
            const datosTeam = await modelTeam.getTeamDetails(team_id);
            const newDatos = datosTeam.members.filter((member) => member.email_user !== emailValido);
            if (newDatos.length > 0) {

                const newAdmin = await UserModel.findUserByEmail(newDatos[0].email_user);
                const newAdminId = newAdmin.id;
                await modelTeam.putTeamMember({ user_id: newAdminId, team_id, user_role: "admin" });
            }

        }


        // Verificar si el usuario a eliminar es parte del equipo
        const miembroAEliminar = await modelTeam.getDataTeamMembers(emailValido);
        if (!miembroAEliminar) {
            return res.status(404).json({ message: "El usuario no es parte del equipo" });
        }

        // Si el usuario es admin, puede eliminar a cualquiera.
        // Si no es admin, solo puede eliminarse a sí mismo.
        if (!usuarioEsAdmin && user !== emailValido) {
            return res.status(403).json({ message: "No tienes permisos para eliminar a otro usuario" });
        }

        // Eliminar usuario del equipo
        const { response } = await modelTeam.deleteTeamMembers({ user_id: usuarioAEliminar.id, team_id });

        if (response.affectedRows === 0) {
            return res.status(500).json({ message: "Error al eliminar el usuario o usuario no encontrado en el equipo." });
        }

        res.json({ message: "Usuario eliminado con éxito" });

    } catch (error) {
        return res.status(500).json({
            message: "Error al obtener los datos",
            redirectToLogin: true
        });
    }
};


const updateTeam = async (req, res) => {
    try {
        const { team_id, user_role, user_email } = req.body;
        const user = req.user.email;

        // Verificar que los datos estén presentes
        if (!team_id || !user_role || !user_email) {
            return res.status(400).json({ message: "Faltan datos obligatorios" });
        }

        ("user", user, team_id, user_role, user_email);

        // Buscar usuario por email
        const verify = await UserModel.findUserByEmail(user_email);
        if (!verify) {
            return res.status(400).json({ message: "Usuario no encontrado" });
        }

        if (user_email === user) {
            return res.status(400).json({ message: "No puedes cambiar tu propio rol" });
        }

        // Obtener la lista de miembros del equipo
        const teamMembers = await modelTeam.getDataTeamMembers(user_email) || [];
        const teamMembersUser = await modelTeam.getDataTeamMembers(user) || [];

        // Verificar si el usuario pertenece al equipo
        const belongsToTeam = teamMembers.length > 0 && teamMembers.some(member => member.team_id === team_id);
        const belongsToTeamUser = teamMembersUser.length > 0 && teamMembersUser.some(member => member.team_id === team_id);
        
        if (!belongsToTeam || !belongsToTeamUser) {
            return res.status(400).json({ message: "No pertenece al Grupo de Trabajo" });
        }

        ("Usuario pertenece al equipo");

        // Obtener el ID del usuario
        const user_id = verify.id;
        ("data: ", user_id, team_id, user_role);

        // Actualizar el rol del usuario en el equipo
        await modelTeam.putTeamMember({ user_id, team_id, user_role });

        return res.status(200).json({ message: "Rol actualizado con éxito" });
    } catch (error) {
        return res.status(500).json({
            message: "Error al obtener los datos",
            redirectToLogin: true
        });
    }
};



module.exports = { getTeamMembers, getDataMembersByid, createNewTeam, deleteTeam, updateTeam };