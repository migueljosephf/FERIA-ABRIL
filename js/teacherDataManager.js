/**
 * CONECTOR UNIVERSAL PARA MÓDULOS DE DOCENTES - SGE
 * Este archivo proporciona funciones estandarizadas para conectar todos los módulos de docentes a systemDataManager
 */

class TeacherDataManager {
    constructor() {
        this.currentUser = null;
        this.attachedFiles = [];
        this.initializeDataManager();
    }

    /**
     * Inicializar conexión con systemDataManager
     */
    initializeDataManager() {
        if (typeof window.systemDataManager === 'undefined') {
            console.error('systemDataManager no disponible');
            return false;
        }
        return true;
    }

    /**
     * Cargar usuario actual desde sessionStorage/localStorage
     */
    loadCurrentUser() {
        try {
            const userData = sessionStorage.getItem('currentUser') || localStorage.getItem('currentUser');
            if (userData) {
                this.currentUser = JSON.parse(userData);
                return this.currentUser;
            }
        } catch (error) {
            console.error('Error cargando usuario:', error);
            return null;
        }
    }

    /**
     * Guardar excusa usando systemDataManager
     */
    guardarExcusa(excusaData) {
        if (!this.initializeDataManager()) return null;

        const excusa = {
            studentName: excusaData.studentName,
            studentGrade: excusaData.studentGrade,
            excuseType: excusaData.excuseType,
            description: excusaData.description,
            teacherName: this.currentUser?.name || 'Profesor',
            teacherUsername: this.currentUser?.username || 'profesor',
            timestamp: new Date().toISOString(),
            status: 'pendiente',
            files: excusaData.files || [],
            psychologistName: null, // Se asignará cuando una psicóloga la tome
            psychologistUsername: null
        };

        return window.systemDataManager.guardarExcusa(excusa);
    }

    /**
     * Guardar asistencia usando systemDataManager
     */
    guardarAsistencia(asistenciaData) {
        if (!this.initializeDataManager()) return null;

        const asistencia = {
            teacherName: this.currentUser?.name || 'Profesor',
            teacherUsername: this.currentUser?.username || 'profesor',
            course: asistenciaData.course,
            date: asistenciaData.date || new Date().toISOString().split('T')[0],
            presentStudents: asistenciaData.presentStudents || 0,
            absentStudents: asistenciaData.absentStudents || 0,
            totalStudents: asistenciaData.totalStudents || 0,
            timestamp: new Date().toISOString(),
            details: asistenciaData.details || ''
        };

        return window.systemDataManager.guardarAsistenciaProfesor(asistencia);
    }

    /**
     * Enviar mensaje a psicóloga
     */
    enviarMensaje(mensajeData) {
        if (!this.initializeDataManager()) return null;

        const mensaje = {
            de: this.currentUser?.username || 'profesor',
            nombreRemitente: this.currentUser?.name || 'Profesor',
            para: mensajeData.para,
            asunto: mensajeData.asunto || 'Mensaje de Profesor',
            contenido: mensajeData.contenido,
            tipo: 'mensaje_profesor',
            timestamp: new Date().toISOString(),
            leido: false,
            archivos: mensajeData.archivos || []
        };

        return window.systemDataManager.enviarMensaje(mensaje);
    }

    /**
     * Obtener mensajes del profesor actual
     */
    obtenerMensajes(tipo = 'todos') {
        if (!this.initializeDataManager()) return [];

        const username = this.currentUser?.username;
        if (!username) return [];

        return window.systemDataManager.obtenerMensajes(username, tipo);
    }

    /**
     * Obtener excusas del profesor actual
     */
    obtenerExcusas() {
        if (!this.initializeDataManager()) return [];

        const username = this.currentUser?.username;
        if (!username) return [];

        return window.systemDataManager.obtenerExcusasProfesor(username);
    }

    /**
     * Obtener lista de psicólogas disponibles
     */
    obtenerPsicologas() {
        // Lista de psicólogas registradas en el sistema
        return [
            { username: 'maria_gomez', name: 'Dra. Maria Gomez' },
            { username: 'ana_martinez', name: 'Dra. Ana Martínez' },
            { username: 'carolina_gomez', name: 'Dra. Carolina Gómez' },
            { username: 'claudia_hernandez', name: 'Dra. Claudia Hernández' },
            { username: 'laura_perez', name: 'Dra. Laura Pérez' },
            { username: 'patricia_lopez', name: 'Dra. Patricia López' },
            { username: 'sofia_garcia', name: 'Dra. Sofía García' },
            { username: 'valentina_diaz', name: 'Dra. Valentina Díaz' },
            { username: 'camila_fernandez', name: 'Dra. Camila Fernández' },
            { username: 'isabella_torres', name: 'Dra. Isabella Torres' },
            { username: 'marta_rodriguez', name: 'Dra. Marta Rodríguez' },
            { username: 'maria_gonzalez', name: 'Dra. María González' },
            { username: 'elena_ramirez', name: 'Dra. Elena Ramírez' },
            { username: 'carmen_sanchez', name: 'Dra. Carmen Sánchez' }
        ];
    }

    /**
     * Obtener estadísticas del profesor
     */
    obtenerEstadisticas() {
        if (!this.initializeDataManager()) return {};

        const username = this.currentUser?.username;
        if (!username) return {};

        return window.systemDataManager.obtenerEstadisticasProfesor(username);
    }

    /**
     * Marcar mensaje como leído
     */
    marcarMensajeLeido(mensajeId) {
        if (!this.initializeDataManager()) return false;

        return window.systemDataManager.marcarMensajeLeido(mensajeId);
    }

    /**
     * Guardar archivo compartido
     */
    guardarArchivo(archivoData) {
        if (!this.initializeDataManager()) return null;

        const archivo = {
            de: this.currentUser?.username || 'profesor',
            nombreRemitente: this.currentUser?.name || 'Profesor',
            para: archivoData.para,
            nombre: archivoData.nombre,
            tamaño: archivoData.tamaño,
            tipo: archivoData.tipo,
            timestamp: new Date().toISOString(),
            descripcion: archivoData.descripcion || ''
        };

        return window.systemDataManager.guardarArchivo(archivo);
    }

    /**
     * Mostrar notificación toast
     */
    showToast(message, type = 'success') {
        // Usar SweetAlert2 si está disponible, sino alert simple
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
                icon: type === 'success' ? 'success' : type === 'error' ? 'error' : 'info',
                title: message
            });
        } else {
            alert(message);
        }
    }
}

// Hacer disponible la clase para instanciación
window.TeacherDataManager = TeacherDataManager;

// Crear instancia global para todos los módulos
window.teacherDataManager = new TeacherDataManager();
