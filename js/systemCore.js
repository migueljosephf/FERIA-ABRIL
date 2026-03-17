/**
 * SISTEMA DE GESTIÓN ESCOLAR - NÚCLEO CENTRAL DE COMUNICACIÓN
 * 
 * Este es el cerebro del sistema que coordina toda la comunicación
 * entre módulos sin depender del DOM o interfaces específicas.
 * 
 * Arquitectura:
 * - Centraliza el almacenamiento de datos
 * - Proporciona API unificada para todos los módulos
 * - Gestiona eventos de comunicación en tiempo real
 * - Mantiene persistencia de datos
 */

(function(global) {
    'use strict';

    const NAMESPACE = 'SGESystem';
    const VERSION = '2.0.0';
    const STORAGE_KEY = 'sge_system_data_v2';

    // Estado global del sistema
    let systemState = {
        initialized: false,
        modules: new Map(),
        eventListeners: new Map(),
        dataCache: null,
        lastSync: null
    };

    /**
     * Núcleo central del sistema
     */
    const SystemCore = {
        
        /**
         * Inicializar el núcleo del sistema
         */
        init() {
            if (systemState.initialized) {
                console.log(`🔄 ${NAMESPACE} ya inicializado (v${VERSION})`);
                return this;
            }

            console.log(`🚀 Inicializando ${NAMESPACE} v${VERSION}`);
            
            // Cargar datos persistentes
            this.loadData();
            
            // Configurar eventos globales
            this.setupGlobalEvents();
            
            // Marcar como inicializado
            systemState.initialized = true;
            systemState.lastSync = new Date();
            
            console.log('✅ Núcleo del sistema inicializado correctamente');
            return this;
        },

        /**
         * Cargar datos desde almacenamiento persistente
         */
        loadData() {
            try {
                const stored = localStorage.getItem(STORAGE_KEY);
                if (stored) {
                    systemState.dataCache = JSON.parse(stored);
                    console.log('📂 Datos cargados desde localStorage');
                } else {
                    systemState.dataCache = this.getDefaultDataStructure();
                    console.log('📝 Estructura de datos por defecto creada');
                }
            } catch (error) {
                console.error('❌ Error cargando datos:', error);
                systemState.dataCache = this.getDefaultDataStructure();
            }
        },

        /**
         * Guardar datos en almacenamiento persistente
         */
        saveData() {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(systemState.dataCache));
                systemState.lastSync = new Date();
                this.emit('data:saved', { timestamp: systemState.lastSync });
                console.log('💾 Datos guardados en localStorage');
            } catch (error) {
                console.error('❌ Error guardando datos:', error);
            }
        },

        /**
         * Estructura de datos por defecto
         */
        getDefaultDataStructure() {
            return {
                version: VERSION,
                created: new Date().toISOString(),
                lastUpdate: new Date().toISOString(),
                
                // Usuarios del sistema
                usuarios: [
                    // Administradores
                    { username: 'admin', name: 'Administrador Principal', role: 'administrador' },
                    { username: 'admin2', name: 'Administrador Secundario', role: 'administrador' },
                    { username: 'admin3', name: 'Administrador Terciario', role: 'administrador' },
                    
                    // Dirección
                    { username: 'direccion', name: 'Director General', role: 'direccion' },
                    
                    // Psicólogas (13 registradas)
                    { username: 'psi_marta_rodriguez', name: 'Dra. Marta Rodríguez', role: 'psicologa' },
                    { username: 'psi_carolina_gomez', name: 'Dra. Carolina Gómez', role: 'psicologa' },
                    { username: 'psi_ana_martinez', name: 'Dra. Ana Martínez', role: 'psicologa' },
                    { username: 'psi_laura_perez', name: 'Dra. Laura Pérez', role: 'psicologa' },
                    { username: 'psi_claudia_hernandez', name: 'Dra. Claudia Hernández', role: 'psicologa' },
                    { username: 'psi_patricia_lopez', name: 'Dra. Patricia López', role: 'psicologa' },
                    { username: 'psi_sofia_garcia', name: 'Dra. Sofía García', role: 'psicologa' },
                    { username: 'psi_valentina_diaz', name: 'Dra. Valentina Díaz', role: 'psicologa' },
                    { username: 'psi_camila_fernandez', name: 'Dra. Camila Fernández', role: 'psicologa' },
                    { username: 'psi_isabella_torres', name: 'Dra. Isabella Torres', role: 'psicologa' },
                    { username: 'psi_maria_gonzalez', name: 'Dra. María González', role: 'psicologa' },
                    { username: 'psi_elena_ramirez', name: 'Dra. Elena Ramírez', role: 'psicologa' },
                    { username: 'psi_carmen_sanchez', name: 'Dra. Carmen Sánchez', role: 'psicologa' },
                    { username: 'psi_maria', name: 'Dra. María Gómez', role: 'psicologa' },
                    
                    // Docentes (ejemplos)
                    { username: 'prof_starling', name: 'Starling Encarnación', role: 'docente', subject: 'Matemáticas' },
                    { username: 'prof_belkis', name: 'Belkis Batista', role: 'docente', subject: 'Historia' },
                    { username: 'prof_adrian', name: 'Adrian Ramirez', role: 'docente', subject: 'Ciencias' },
                    { username: 'r_ledesma', name: 'Prof. Raymond Ledesma', role: 'docente', subject: 'Informática' }
                ],
                
                // Comunicaciones
                mensajes: [],
                excusas: [],
                archivos: [],
                notificaciones: [],
                
                // Reportes y estadísticas
                reportes: [],
                asistencia: [],
                calificaciones: [],
                
                // Actividad del sistema
                actividadSistema: []
            };
        },

        /**
         * Configurar eventos globales
         */
        setupGlobalEvents() {
            // Auto-guardar cada 30 segundos
            setInterval(() => {
                this.saveData();
            }, 30000);

            // Guardar antes de cerrar la ventana
            window.addEventListener('beforeunload', () => {
                this.saveData();
            });

            // Sincronización entre pestañas
            window.addEventListener('storage', (e) => {
                if (e.key === STORAGE_KEY) {
                    this.loadData();
                    this.emit('data:synced', { source: 'cross-tab' });
                }
            });
        },

        /**
         * API DE COMUNICACIÓN ENTRE MÓDULOS
         */

        /**
         * Enviar mensaje entre módulos
         */
        sendMessage(messageData) {
            const message = {
                id: this.generateId('msg_'),
                timestamp: new Date().toISOString(),
                leido: false,
                ...messageData
            };

            // Validar mensaje
            if (!message.de || !message.para || !message.contenido) {
                throw new Error('Mensaje inválido: falta de, para, o contenido');
            }

            // Guardar mensaje
            systemState.dataCache.mensajes.push(message);
            this.saveData();

            // Emitir eventos
            this.emit('message:sent', message);
            this.emit('message:received', { 
                recipient: message.para, 
                message 
            });

            console.log('📤 Mensaje enviado:', message);
            return message;
        },

        /**
         * Obtener mensajes de un usuario
         */
        getMessages(username, type = 'todos') {
            const mensajes = systemState.dataCache.mensajes || [];
            
            let filtered = mensajes.filter(m => 
                m.de === username || m.para === username
            );

            if (type === 'recibidos') {
                filtered = filtered.filter(m => m.para === username);
            } else if (type === 'enviados') {
                filtered = filtered.filter(m => m.de === username);
            }

            return filtered.sort((a, b) => 
                new Date(b.timestamp) - new Date(a.timestamp)
            );
        },

        /**
         * Marcar mensaje como leído
         */
        markMessageAsRead(messageId) {
            const message = systemState.dataCache.mensajes.find(m => m.id === messageId);
            if (message && !message.leido) {
                message.leido = true;
                this.saveData();
                this.emit('message:read', { messageId, message });
                return true;
            }
            return false;
        },

        /**
         * Enviar excusa
         */
        sendExcuse(excuseData) {
            const excuse = {
                id: this.generateId('exc_'),
                timestamp: new Date().toISOString(),
                estado: 'pendiente',
                ...excuseData
            };

            // Validar excusa
            if (!excuse.profesor || !excuse.psychologistUsername || !excuse.estudiante) {
                throw new Error('Excusa inválida: faltan campos requeridos');
            }

            // Guardar excusa
            systemState.dataCache.excusas.push(excuse);
            this.saveData();

            // Emitir eventos
            this.emit('excuse:sent', excuse);
            this.emit('excuse:received', { 
                recipient: excuse.psychologistUsername, 
                excuse 
            });

            console.log('📄 Excusa enviada:', excuse);
            return excuse;
        },

        /**
         * Obtener excusas de una psicóloga
         */
        getExcuses(psychologistUsername) {
            const excusas = systemState.dataCache.excusas || [];
            return excusas
                .filter(e => e.psychologistUsername === psychologistUsername)
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        },

        /**
         * Enviar archivo
         */
        sendFile(fileData) {
            const file = {
                id: this.generateId('file_'),
                timestamp: new Date().toISOString(),
                ...fileData
            };

            // Validar archivo
            if (!file.de || !file.para || !file.nombre) {
                throw new Error('Archivo inválido: faltan campos requeridos');
            }

            // Guardar archivo
            systemState.dataCache.archivos.push(file);
            this.saveData();

            // Emitir eventos
            this.emit('file:sent', file);
            this.emit('file:received', { 
                recipient: file.para, 
                file 
            });

            console.log('📎 Archivo enviado:', file);
            return file;
        },

        /**
         * Obtener archivos de un usuario
         */
        getFiles(username, type = 'todos') {
            const archivos = systemState.dataCache.archivos || [];
            
            let filtered = archivos.filter(f => 
                f.de === username || f.para === username
            );

            if (type === 'recibidos') {
                filtered = filtered.filter(f => f.para === username);
            } else if (type === 'enviados') {
                filtered = filtered.filter(f => f.de === username);
            }

            return filtered.sort((a, b) => 
                new Date(b.timestamp) - new Date(a.timestamp)
            );
        },

        /**
         * Enviar notificación
         */
        sendNotification(notificationData) {
            const notification = {
                id: this.generateId('notif_'),
                timestamp: new Date().toISOString(),
                leida: false,
                ...notificationData
            };

            systemState.dataCache.notificaciones.push(notification);
            this.saveData();

            this.emit('notification:sent', notification);
            this.emit('notification:received', { 
                recipient: notification.para, 
                notification 
            });

            console.log('🔔 Notificación enviada:', notification);
            return notification;
        },

        /**
         * Obtener notificaciones de un usuario
         */
        getNotifications(username, unreadOnly = false) {
            const notificaciones = systemState.dataCache.notificaciones || [];
            let filtered = notificaciones.filter(n => n.para === username);
            
            if (unreadOnly) {
                filtered = filtered.filter(n => !n.leida);
            }

            return filtered.sort((a, b) => 
                new Date(b.timestamp) - new Date(a.timestamp)
            );
        },

        /**
         * Marcar notificación como leída
         */
        markNotificationAsRead(notificationId) {
            const notification = systemState.dataCache.notificaciones.find(n => n.id === notificationId);
            if (notification && !notification.leida) {
                notification.leida = true;
                this.saveData();
                this.emit('notification:read', { notificationId, notification });
                return true;
            }
            return false;
        },

        /**
         * API DE USUARIOS
         */

        /**
         * Obtener usuario por username
         */
        getUser(username) {
            return systemState.dataCache.usuarios.find(u => u.username === username) || null;
        },

        /**
         * Obtener usuarios por rol
         */
        getUsersByRole(role) {
            return systemState.dataCache.usuarios.filter(u => u.role === role);
        },

        /**
         * Obtener todos los usuarios
         */
        getAllUsers() {
            return [...systemState.dataCache.usuarios];
        },

        /**
         * API DE ESTADÍSTICAS
         */

        /**
         * Obtener estadísticas de un usuario
         */
        getUserStats(username) {
            const mensajes = this.getMessages(username);
            const excusas = username.startsWith('psi_') ? this.getExcuses(username) : [];
            const archivos = this.getFiles(username);
            const notificaciones = this.getNotifications(username);

            return {
                mensajes: {
                    total: mensajes.length,
                    recibidos: mensajes.filter(m => m.para === username).length,
                    enviados: mensajes.filter(m => m.de === username).length,
                    noLeidos: mensajes.filter(m => m.para === username && !m.leido).length
                },
                excusas: {
                    total: excusas.length,
                    pendientes: excusas.filter(e => e.estado === 'pendiente').length,
                    aprobadas: excusas.filter(e => e.estado === 'aprobada').length,
                    rechazadas: excusas.filter(e => e.estado === 'rechazada').length
                },
                archivos: {
                    total: archivos.length,
                    recibidos: archivos.filter(f => f.para === username).length,
                    enviados: archivos.filter(f => f.de === username).length
                },
                notificaciones: {
                    total: notificaciones.length,
                    noLeidas: notificaciones.filter(n => !n.leida).length
                }
            };
        },

        /**
         * Obtener estadísticas generales del sistema
         */
        getSystemStats() {
            return {
                usuarios: systemState.dataCache.usuarios.length,
                mensajes: systemState.dataCache.mensajes.length,
                excusas: systemState.dataCache.excusas.length,
                archivos: systemState.dataCache.archivos.length,
                notificaciones: systemState.dataCache.notificaciones.length,
                ultimaActualizacion: systemState.lastSync
            };
        },

        /**
         * SISTEMA DE EVENTOS
         */

        /**
         * Emitir evento
         */
        emit(eventName, data = null) {
            const listeners = systemState.eventListeners.get(eventName) || [];
            
            listeners.forEach(listener => {
                try {
                    listener(data);
                } catch (error) {
                    console.error(`❌ Error en listener del evento ${eventName}:`, error);
                }
            });

            // Log de eventos importantes
            if (['message:sent', 'message:received', 'excuse:sent', 'excuse:received'].includes(eventName)) {
                console.log(`📡 Evento: ${eventName}`, data);
            }
        },

        /**
         * Suscribirse a evento
         */
        on(eventName, listener) {
            if (typeof listener !== 'function') {
                throw new Error('Listener debe ser una función');
            }

            if (!systemState.eventListeners.has(eventName)) {
                systemState.eventListeners.set(eventName, []);
            }

            systemState.eventListeners.get(eventName).push(listener);

            // Retornar función para unsuscribir
            return () => {
                const listeners = systemState.eventListeners.get(eventName);
                if (listeners) {
                    const index = listeners.indexOf(listener);
                    if (index > -1) {
                        listeners.splice(index, 1);
                    }
                }
            };
        },

        /**
         * Suscribirse a evento una sola vez
         */
        once(eventName, listener) {
            const onceWrapper = (data) => {
                listener(data);
                this.off(eventName, onceWrapper);
            };
            
            return this.on(eventName, onceWrapper);
        },

        /**
         * Eliminar suscripción a evento
         */
        off(eventName, listener) {
            const listeners = systemState.eventListeners.get(eventName);
            if (listeners) {
                const index = listeners.indexOf(listener);
                if (index > -1) {
                    listeners.splice(index, 1);
                }
            }
        },

        /**
         * UTILIDADES
         */

        /**
         * Generar ID único
         */
        generateId(prefix = '') {
            const timestamp = Date.now().toString(36);
            const random = Math.random().toString(36).substr(2, 9);
            return `${prefix}${timestamp}_${random}`;
        },

        /**
         * Formatear fecha
         */
        formatDate(date, format = 'short') {
            const d = new Date(date);
            
            if (format === 'short') {
                return d.toLocaleDateString();
            } else if (format === 'long') {
                return d.toLocaleString();
            } else if (format === 'time') {
                return d.toLocaleTimeString();
            }
            
            return d.toISOString();
        },

        /**
         * Validar usuario actual
         */
        getCurrentUser() {
            const userData = sessionStorage.getItem('currentUser') || localStorage.getItem('currentUser');
            return userData ? JSON.parse(userData) : null;
        },

        /**
         * Obtener estado del sistema
         */
        getState() {
            return {
                initialized: systemState.initialized,
                version: VERSION,
                lastSync: systemState.lastSync,
                modules: Array.from(systemState.modules.keys()),
                eventListeners: Array.from(systemState.eventListeners.keys())
            };
        },

        /**
         * Forzar sincronización de datos
         */
        sync() {
            this.saveData();
            this.emit('system:sync', { timestamp: new Date() });
        },

        /**
         * Limpiar datos del sistema (cuidado!)
         */
        clear() {
            if (confirm('⚠️ ¿Está seguro de que desea eliminar todos los datos del sistema? Esta acción no se puede deshacer.')) {
                systemState.dataCache = this.getDefaultDataStructure();
                this.saveData();
                this.emit('system:cleared', { timestamp: new Date() });
                console.log('🧹 Datos del sistema eliminados');
            }
        }
    };

    // Exportar núcleo del sistema
    const root = global || window;
    root[NAMESPACE] = SystemCore;

    // También exportar como window.SGESystem para compatibilidad
    if (typeof window !== 'undefined') {
        window.SGESystem = SystemCore;
    }

    // Auto-inicializar si estamos en navegador
    if (typeof window !== 'undefined') {
        // Esperar a que el DOM esté listo
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                SystemCore.init();
            });
        } else {
            SystemCore.init();
        }
    }

    console.log(`📦 ${NAMESPACE} v${VERSION} cargado correctamente`);

})(typeof window !== 'undefined' ? window : global);
