/**
 * Sistema de Comunicación Inter-Módulos
 * Conecta dirección, secretaría, tesorería y otros departamentos
 */

class InterModuleCommunication {
    constructor() {
        this.initialized = false;
        this.currentUser = null;
        this.moduleType = null;
        this.listeners = [];
        
        this.init();
    }

    init() {
        // Determinar el tipo de módulo actual
        this.determineModuleType();
        
        // Cargar usuario actual
        this.loadCurrentUser();
        
        // Configurar listeners
        this.setupEventListeners();
        
        this.initialized = true;
        console.log(`✅ Comunicación inter-módulos inicializada para: ${this.moduleType}`);
    }

    determineModuleType() {
        const path = window.location.pathname;
        const url = window.location.href;
        
        if (url.includes('secretaria-dashboard')) {
            this.moduleType = 'secretaria';
        } else if (url.includes('tesoreria-dashboard')) {
            this.moduleType = 'tesoreria';
        } else if (url.includes('porteria-dashboard')) {
            this.moduleType = 'porteria';
        } else if (url.includes('direccion')) {
            this.moduleType = 'direccion';
        } else if (url.includes('psicologia-dashboard')) {
            this.moduleType = 'psicologia';
        } else if (url.includes('docente-dashboard')) {
            this.moduleType = 'docente';
        } else if (url.includes('inventario-cafeteria')) {
            this.moduleType = 'cafeteria';
        } else {
            this.moduleType = 'general';
        }
    }

    loadCurrentUser() {
        try {
            const userData = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
            if (userData) {
                this.currentUser = JSON.parse(userData);
            } else {
                // Usuario por defecto según el módulo
                this.currentUser = this.getDefaultUser();
            }
        } catch (error) {
            console.warn('⚠️ Error cargando usuario actual:', error);
            this.currentUser = this.getDefaultUser();
        }
    }

    getDefaultUser() {
        const defaultUsers = {
            'secretaria': { username: 'secretaria_general', name: 'Secretaría General', role: 'secretaria' },
            'tesoreria': { username: 'tesorero_principal', name: 'Tesorería', role: 'tesoreria' },
            'porteria': { username: 'porteria_principal', name: 'Portería', role: 'porteria' },
            'direccion': { username: 'direccion_principal', name: 'Dirección', role: 'direccion' },
            'psicologia': { username: 'psi_marta_rodriguez', name: 'Dra. Marta Rodríguez', role: 'psicologia' },
            'docente': { username: 'prof_starling', name: 'Prof. Starling Encarnación', role: 'docente' },
            'cafeteria': { username: 'cafeteria_admin', name: 'Administración Cafetería', role: 'cafeteria' }
        };
        
        return defaultUsers[this.moduleType] || { username: 'usuario_general', name: 'Usuario General', role: 'general' };
    }

    setupEventListeners() {
        // Escuchar cambios en localStorage
        window.addEventListener('storage', (e) => {
            if (e.key === 'sge_inter_module_messages') {
                this.handleNewMessage();
            }
        });

        // Escuchar eventos personalizados
        window.addEventListener('sge-inter-module-message', (e) => {
            this.handleCustomMessage(e.detail);
        });
    }

    // Enviar mensaje a otro módulo
    sendMessageToModule(targetModule, message, priority = 'normal') {
        const messageData = {
            id: this.generateId(),
            from: this.moduleType,
            to: targetModule,
            fromUser: this.currentUser,
            message: message,
            priority: priority,
            timestamp: new Date().toISOString(),
            read: false
        };

        try {
            // Usar SystemDataManager si está disponible
            if (window.systemDataManager) {
                const data = window.systemDataManager.getAllData();
                if (!data.interModuleMessages) {
                    data.interModuleMessages = [];
                }
                data.interModuleMessages.push(messageData);
                window.systemDataManager.saveAllData(data);
            } else {
                // Fallback a localStorage
                const messages = JSON.parse(localStorage.getItem('sge_inter_module_messages') || '[]');
                messages.push(messageData);
                localStorage.setItem('sge_inter_module_messages', JSON.stringify(messages));
            }

            // Emitir evento personalizado
            this.emitCustomEvent(messageData);

            console.log(`✅ Mensaje enviado de ${this.moduleType} a ${targetModule}:`, message);
            return messageData;

        } catch (error) {
            console.error('❌ Error enviando mensaje inter-módulo:', error);
            return null;
        }
    }

    // Obtener mensajes para este módulo
    getMessages(forModule = null) {
        const targetModule = forModule || this.moduleType;
        
        try {
            let messages = [];
            
            // Intentar cargar desde SystemDataManager
            if (window.systemDataManager) {
                const data = window.systemDataManager.getAllData();
                messages = data.interModuleMessages || [];
            } else {
                // Fallback a localStorage
                messages = JSON.parse(localStorage.getItem('sge_inter_module_messages') || '[]');
            }

            // Filtrar mensajes para este módulo
            return messages.filter(msg => msg.to === targetModule);

        } catch (error) {
            console.error('❌ Error obteniendo mensajes:', error);
            return [];
        }
    }

    // Marcar mensaje como leído
    markAsRead(messageId) {
        try {
            let messages = [];
            
            if (window.systemDataManager) {
                const data = window.systemDataManager.getAllData();
                messages = data.interModuleMessages || [];
                
                const message = messages.find(msg => msg.id === messageId);
                if (message) {
                    message.read = true;
                    window.systemDataManager.saveAllData(data);
                }
            } else {
                messages = JSON.parse(localStorage.getItem('sge_inter_module_messages') || '[]');
                const messageIndex = messages.findIndex(msg => msg.id === messageId);
                if (messageIndex !== -1) {
                    messages[messageIndex].read = true;
                    localStorage.setItem('sge_inter_module_messages', JSON.stringify(messages));
                }
            }

            console.log(`✅ Mensaje ${messageId} marcado como leído`);
        } catch (error) {
            console.error('❌ Error marcando mensaje como leído:', error);
        }
    }

    // Enviar notificación de sistema
    sendSystemNotification(title, message, type = 'info', targetModules = null) {
        const notification = {
            id: this.generateId(),
            type: 'system_notification',
            title: title,
            message: message,
            notificationType: type,
            from: this.moduleType,
            to: targetModules || 'all',
            timestamp: new Date().toISOString(),
            read: false
        };

        this.sendMessageToModule('system', notification, 'high');
        
        // Mostrar notificación inmediata si es para el módulo actual
        if (!targetModules || targetModules === 'all' || targetModules.includes(this.moduleType)) {
            this.showNotification(notification);
        }
    }

    // Mostrar notificación
    showNotification(notification) {
        if (window.Swal) {
            const iconMap = {
                'success': 'success',
                'error': 'error',
                'warning': 'warning',
                'info': 'info'
            };

            Swal.fire({
                icon: iconMap[notification.notificationType] || 'info',
                title: notification.title,
                text: notification.message,
                timer: 5000,
                showConfirmButton: false,
                position: 'top-end',
                toast: true
            });
        } else {
            // Fallback a alert
            alert(`${notification.title}: ${notification.message}`);
        }
    }

    // Obtener estadísticas de comunicación
    getCommunicationStats() {
        try {
            let allMessages = [];
            
            if (window.systemDataManager) {
                const data = window.systemDataManager.getAllData();
                allMessages = data.interModuleMessages || [];
            } else {
                allMessages = JSON.parse(localStorage.getItem('sge_inter_module_messages') || '[]');
            }

            const stats = {
                totalMessages: allMessages.length,
                unreadMessages: allMessages.filter(msg => msg.to === this.moduleType && !msg.read).length,
                sentMessages: allMessages.filter(msg => msg.from === this.moduleType).length,
                receivedMessages: allMessages.filter(msg => msg.to === this.moduleType).length,
                byModule: {}
            };

            // Estadísticas por módulo
            const modules = ['secretaria', 'tesoreria', 'porteria', 'direccion', 'psicologia', 'docente', 'cafeteria'];
            modules.forEach(module => {
                stats.byModule[module] = {
                    sent: allMessages.filter(msg => msg.from === module).length,
                    received: allMessages.filter(msg => msg.to === module).length
                };
            });

            return stats;

        } catch (error) {
            console.error('❌ Error obteniendo estadísticas:', error);
            return {
                totalMessages: 0,
                unreadMessages: 0,
                sentMessages: 0,
                receivedMessages: 0,
                byModule: {}
            };
        }
    }

    // Event handlers
    handleNewMessage() {
        console.log('🔔 Nuevo mensaje inter-módulo recibido');
        this.emitCustomEvent({ type: 'new_message', module: this.moduleType });
    }

    handleCustomMessage(detail) {
        console.log('📨 Mensaje personalizado recibido:', detail);
        
        // Si es para este módulo, mostrar notificación
        if (detail.to === this.moduleType || detail.to === 'all') {
            this.showNotification(detail);
        }
    }

    emitCustomEvent(data) {
        const event = new CustomEvent('sge-inter-module-message', { detail: data });
        window.dispatchEvent(event);
    }

    // Utilidades
    generateId() {
        return 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Obtener conexión con otros módulos
    getConnectedModules() {
        return [
            { id: 'secretaria', name: 'Secretaría', status: 'active' },
            { id: 'tesoreria', name: 'Tesorería', status: 'active' },
            { id: 'porteria', name: 'Portería', status: 'active' },
            { id: 'direccion', name: 'Dirección', status: 'active' },
            { id: 'psicologia', name: 'Psicología', status: 'active' },
            { id: 'docente', name: 'Docentes', status: 'active' },
            { id: 'cafeteria', name: 'Cafetería', status: 'active' }
        ];
    }

    // Enviar reporte a dirección
    sendReportToDirection(reportType, reportData) {
        const report = {
            type: 'report',
            reportType: reportType,
            data: reportData,
            from: this.moduleType,
            fromUser: this.currentUser,
            timestamp: new Date().toISOString()
        };

        return this.sendMessageToModule('direccion', report, 'high');
    }

    // Solicitar aprobación a dirección
    requestApproval(requestType, requestData) {
        const request = {
            type: 'approval_request',
            requestType: requestType,
            data: requestData,
            from: this.moduleType,
            fromUser: this.currentUser,
            timestamp: new Date().toISOString(),
            status: 'pending'
        };

        return this.sendMessageToModule('direccion', request, 'high');
    }
}

// Auto-inicialización
let interModuleComm;

document.addEventListener('DOMContentLoaded', () => {
    // Esperar a que otros sistemas estén listos
    setTimeout(() => {
        interModuleComm = new InterModuleCommunication();
        window.interModuleComm = interModuleComm;
        
        console.log('🌐 Sistema de comunicación inter-módulos disponible globalmente');
    }, 1000);
});

// También inicializar inmediatamente si el DOM ya está cargado
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            interModuleComm = new InterModuleCommunication();
            window.interModuleComm = interModuleComm;
        }, 1000);
    });
} else {
    setTimeout(() => {
        interModuleComm = new InterModuleCommunication();
        window.interModuleComm = interModuleComm;
    }, 1000);
}
