const Notifications = require('../model/notifications');
const User = require('../model/User');
const {postTeamMembers,getTeamDetails,getDataTeamMembers} = require('../model/team_members');
const {getNotifications,addNotification} = Notifications

const allNotifications = async (req,res) => {
    const user_email = req.user.email;
    const userIfo = await User.findUserByEmail(user_email);
    try {
        if (!user_email) {
            return res.status(400).json({ message: 'El usuario es requerido' });
        } 
        (userIfo.id);
        const result = await getNotifications(userIfo.id);
        
        return res.status(200).json(result);
        
    } catch (error) {
        (error);
        return res.status(500).json({ 
            message: 'Error al obtener las notificaciones' ,
            redirectToLogin: true
        });
    }
}

const postNotificationC = async (req, res) => {
    try {
        const { user_email, type, message, team_id} = req.body;
        const user = req.user.email;
        //validar que no se envie a si mismo
        if(user_email == user){
            return res.status(400).json({ message: 'No puedes enviar una invitación a ti mismo' });
        }

        // Validar que todos los campos están presentes
        if (!user_email || !type || !message || !team_id) {
            return res.status(400).json({ message: 'Todos los campos son obligatorios' });
        }

        // Validar que el usuario exista y tenga relacion con el equipo
        const infoTeam = await getDataTeamMembers(user);
       (infoTeam);
       const teamExists = infoTeam.some(team => Number(team.team_id) === Number(team_id));
        if (!teamExists) {
            return res.status(404).json({ message: 'Hubo un error' });
        }

        // Obtener los miembros del equipo
        const teamMembers = await getTeamDetails(team_id);

        // Si el equipo no tiene miembros, asumimos que el team_id no es válido
        
        if (!teamMembers || teamMembers.length === 0) {
            return res.status(404).json({ message: 'El equipo no existe o no tiene miembros' });
        }
        
        
        // Filtrar los miembros para verificar si el usuario ya está en el equipo invitation
        const userExists = teamMembers.members.some(member => member.email_user === user_email);
        if (type == 'invitation' && userExists) {
            return res.status(409).json({ message: 'El usuario ya pertenece al equipo' });
        }

        // Buscar usuario por email
        const user_info = await User.findUserByEmail(user_email);
        if (!user_info) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        if (user_info.status !== 'active') {
            return res.status(403).json({ message: 'El usuario no está activo' });
        }

        // Crear la invitación como notificación
        const user_id = user_info.id;
        const sender_id = req.user?.id || team_id;

        const result = await addNotification({ user_id, type, message, sender_id });

        if (!result) {
            console.error('Error al crear la notificación:', result);
            return res.status(500).json({ message: 'No se pudo enviar la invitación' });
        }

        return res.status(201).json({ message: 'Invitación enviada correctamente', data: result });

    } catch (error) {
        console.error('Error en postNotificationC:', error);
        return res.status(500).json({ 
            message: 'Error interno del servidor' ,
            redirectToLogin: true
        });
    }
};



const acceptInvitation = async (req, res) => {
    try {
        const user = req.user.email;
        const userInfo = await User.findUserByEmail(user);
        const user_id = userInfo.id;
        const {sender_id,notifications_id, acept} = req.body;

        if (!user_id || !sender_id || !notifications_id) {
            return res.status(400).json({ message: 'Todos los campos son obligatorios' });
        }

        const verifyNotifications = await Notifications.getNotificationsById({user: user_id, id: notifications_id});
        if (!verifyNotifications) {
            return res.status(404).json({ message: 'Notificación no encontrada' });
        }

        const resultNot =  await Notifications.updateNotification({id: notifications_id, user_id: user_id});

        if(acept){
            const result = await postTeamMembers({team_id: sender_id, user_id: user_id, role: 'member'});
            if (!result) {
                return res.status(500).json({ message: 'No se pudo crear el equipo' });
            }
            return res.status(200).json({ message: 'Invitación aceptada' });
        }else{
            return res.status(200).json({ message: 'Invitación rechazada' });
        }

        

    } catch (error) {
        return res.status(500).json({ 
            message: 'Error al aceptar la invitación' ,
            redirectToLogin: true
        });
    }
}



module.exports = {allNotifications,postNotificationC,acceptInvitation}