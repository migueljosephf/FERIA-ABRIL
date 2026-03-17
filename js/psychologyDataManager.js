/**
 * MIGRACIÓN A SYSTEMDATAMANAGER - PSICOLOGÍA
 * Este archivo reemplaza completamente el almacenamiento local por systemDataManager
 */

// Reemplazar todas las funciones de almacenamiento local por systemDataManager
class PsychologyDataManager {
    constructor() {
        this.psychologistUsername = 'maria_gomez';
        this.psychologistName = 'Dra. Maria Gomez';
    }

    /**
     * Guardar excusa usando systemDataManager
     */
    guardarExcusa(excuse) {
        if (typeof window.systemDataManager !== 'undefined') {
            const excuseData = {
                student: excuse.student,
                grade: excuse.grade,
                type: excuse.type,
                description: excuse.details || excuse.description,
                psychologist: this.psychologistName,
                psychologistUsername: this.psychologistUsername,
                timestamp: new Date().toISOString(),
                status: 'pending',
                files: excuse.files || []
            };
            
            return window.systemDataManager.guardarExcusa(excuseData);
        } else {
            console.error('systemDataManager no disponible');
            return null;
        }
    }

    /**
     * Obtener excusas asignadas a esta psicóloga
     */
    obtenerExcusas() {
        if (typeof window.systemDataManager !== 'undefined') {
            return window.systemDataManager.obtenerExcusasPorPsicologa(this.psychologistUsername);
        } else {
            console.error('systemDataManager no disponible');
            return [];
        }
    }

    /**
     * Enviar mensaje usando systemDataManager
     */
    enviarMensaje(message) {
        if (typeof window.systemDataManager !== 'undefined') {
            const messageData = {
                de: this.psychologistUsername,
                para: message.para,
                asunto: message.asunto || 'Mensaje de Psicología',
                contenido: message.contenido || message.mensaje || message.details,
                tipo: 'mensaje_psicologa',
                timestamp: new Date().toISOString(),
                leido: false,
                archivos: message.archivos || []
            };
            
            return window.systemDataManager.enviarMensaje(messageData);
        } else {
            console.error('systemDataManager no disponible');
            return null;
        }
    }

    /**
     * Obtener mensajes de esta psicóloga
     */
    obtenerMensajes(tipo = 'todos') {
        if (typeof window.systemDataManager !== 'undefined') {
            return window.systemDataManager.obtenerMensajes(this.psychologistUsername, tipo);
        } else {
            console.error('systemDataManager no disponible');
            return [];
        }
    }

    /**
     * Guardar transferencia a dirección
     */
    guardarTransferenciaDireccion(transfer) {
        if (typeof window.systemDataManager !== 'undefined') {
            const transferData = {
                de: this.psychologistUsername,
                para: 'direccion',
                asunto: transfer.asunto || 'Transferencia de Psicología',
                contenido: transfer.contenido || transfer.details,
                tipo: 'transferencia_direccion',
                timestamp: new Date().toISOString(),
                archivos: transfer.archivos || [],
                estado: 'transferred'
            };
            
            return window.systemDataManager.enviarMensaje(transferData);
        } else {
            console.error('systemDataManager no disponible');
            return null;
        }
    }
}

// Crear instancia global
window.psychologyDataManager = new PsychologyDataManager();
