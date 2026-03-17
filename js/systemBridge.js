/**
 * PUENTE DE COMPATIBILIDAD - SYSTEM DATA MANAGER ↔ SYSTEM CORE
 * 
 * Este módulo actúa como puente entre el SystemDataManager existente
 * y el nuevo SystemCore para mantener compatibilidad con todos los módulos
 * mientras se migra gradualmente a la nueva arquitectura.
 */

(function(global) {
    'use strict';

    const NAMESPACE = 'SGEBridge';
    
    // Estado del puente
    let bridgeState = {
        initialized: false,
        coreAvailable: false,
        dataManagerAvailable: false,
        syncMode: 'dual' // 'dual', 'core-only', 'dm-only'
    };

    /**
     * Puente de compatibilidad
     */
    const SystemBridge = {
        
        /**
         * Inicializar puente
         */
        init() {
            if (bridgeState.initialized) {
                console.log('🔄 SystemBridge ya inicializado');
                return this;
            }

            console.log('🌉 Inicializando SystemBridge');
            
            // Verificar disponibilidad de componentes
            bridgeState.coreAvailable = typeof window.SGESystem !== 'undefined';
            bridgeState.dataManagerAvailable = typeof window.SystemDataManager !== 'undefined';
            
            if (bridgeState.coreAvailable) {
                console.log('✅ SystemCore disponible');
            }
            
            if (bridgeState.dataManagerAvailable) {
                console.log('✅ SystemDataManager disponible');
            }
            
            if (!bridgeState.coreAvailable && !bridgeState.dataManagerAvailable) {
                console.error('❌ Ni SystemCore ni SystemDataManager están disponibles');
                return this;
            }
            
            // Configurar modo de sincronización
            if (bridgeState.coreAvailable && bridgeState.dataManagerAvailable) {
                bridgeState.syncMode = 'dual';
                this.setupDualSync();
            } else if (bridgeState.coreAvailable) {
                bridgeState.syncMode = 'core-only';
            } else {
                bridgeState.syncMode = 'dm-only';
            }
            
            bridgeState.initialized = true;
            console.log(`🌉 SystemBridge inicializado en modo: ${bridgeState.syncMode}`);
            
            return this;
        },

        /**
         * Configurar sincronización dual
         */
        setupDualSync() {
            // Sincronizar datos iniciales
            this.syncDataFromDMToCore();
            
            // Escuchar eventos del SystemCore
            window.SGESystem.on('message:sent', (data) => {
                this.syncMessageToDM(data);
            });
            
            window.SGESystem.on('excuse:sent', (data) => {
                this.syncExcuseToDM(data);
            });
            
            window.SGESystem.on('file:sent', (data) => {
                this.syncFileToDM(data);
            });
            
            // Escuchar eventos del SystemDataManager
            if (window.systemDataManager) {
                // Interceptar métodos de SystemDataManager
                this.interceptDataManagerMethods();
            }
        },

        /**
         * Sincronizar datos desde DM a Core
         */
        syncDataFromDMToCore() {
            if (!bridgeState.coreAvailable || !bridgeState.dataManagerAvailable) {
                return;
            }
            
            try {
                const dmData = window.systemDataManager.getAllData();
                
                // Sincronizar mensajes
                if (dmData.mensajes && Array.isArray(dmData.mensajes)) {
                    dmData.mensajes.forEach(msg => {
                        if (!window.SGESystem.getMessages(msg.de).find(m => m.id === msg.id)) {
                            window.SGESystem.sendMessage(msg);
                        }
                    });
                }
                
                // Sincronizar excusas
                if (dmData.excusas && Array.isArray(dmData.excusas)) {
                    dmData.excusas.forEach(exc => {
                        if (!window.SGESystem.getExcuses(exc.psychologistUsername).find(e => e.id === exc.id)) {
                            window.SGESystem.sendExcuse(exc);
                        }
                    });
                }
                
                console.log('🔄 Datos sincronizados desde SystemDataManager a SystemCore');
            } catch (error) {
                console.error('❌ Error sincronizando datos:', error);
            }
        },

        /**
         * Sincronizar mensaje a DM
         */
        syncMessageToDM(message) {
            if (bridgeState.dataManagerAvailable && window.systemDataManager) {
                try {
                    window.systemDataManager.guardarMensaje(message);
                } catch (error) {
                    console.error('❌ Error sincronizando mensaje a DM:', error);
                }
            }
        },

        /**
         * Sincronizar excusa a DM
         */
        syncExcuseToDM(excuse) {
            if (bridgeState.dataManagerAvailable && window.systemDataManager) {
                try {
                    window.systemDataManager.guardarExcusa(excuse);
                } catch (error) {
                    console.error('❌ Error sincronizando excusa a DM:', error);
                }
            }
        },

        /**
         * Sincronizar archivo a DM
         */
        syncFileToDM(file) {
            if (bridgeState.dataManagerAvailable && window.systemDataManager) {
                try {
                    // SystemDataManager no tiene método para archivos, así que lo agregamos
                    if (!window.systemDataManager.guardarArchivo) {
                        window.systemDataManager.guardarArchivo = (fileData) => {
                            const data = window.systemDataManager.getAllData();
                            if (!data.archivos) {
                                data.archivos = [];
                            }
                            fileData.id = fileData.id || window.systemDataManager.generateId('file_');
                            data.archivos.push(fileData);
                            window.systemDataManager.saveAllData(data);
                            return fileData;
                        };
                    }
                    
                    window.systemDataManager.guardarArchivo(file);
                } catch (error) {
                    console.error('❌ Error sincronizando archivo a DM:', error);
                }
            }
        },

        /**
         * Interceptar métodos de SystemDataManager
         */
        interceptDataManagerMethods() {
            const dm = window.systemDataManager;
            const bridge = this;
            
            // Guardar métodos originales
            const originalGuardarMensaje = dm.guardarMensaje.bind(dm);
            const originalGuardarExcusa = dm.guardarExcusa.bind(dm);
            
            // Interceptar guardarMensaje
            dm.guardarMensaje = function(message) {
                const result = originalGuardarMensaje(message);
                
                // Sincronizar con SystemCore
                if (bridgeState.coreAvailable) {
                    try {
                        window.SGESystem.sendMessage(message);
                    } catch (error) {
                        console.error('❌ Error sincronizando mensaje con Core:', error);
                    }
                }
                
                return result;
            };
            
            // Interceptar guardarExcusa
            dm.guardarExcusa = function(excuse) {
                const result = originalGuardarExcusa(excuse);
                
                // Sincronizar con SystemCore
                if (bridgeState.coreAvailable) {
                    try {
                        window.SGESystem.sendExcuse(excuse);
                    } catch (error) {
                        console.error('❌ Error sincronizando excusa con Core:', error);
                    }
                }
                
                return result;
            };
        },

        /**
         * API UNIFICADA (compatible con ambos sistemas)
         */

        /**
         * Enviar mensaje (método unificado)
         */
        sendMessage(messageData) {
            if (bridgeState.syncMode === 'core-only' || bridgeState.syncMode === 'dual') {
                return window.SGESystem.sendMessage(messageData);
            } else {
                return window.systemDataManager.guardarMensaje(messageData);
            }
        },

        /**
         * Guardar asistencia (método unificado)
         */
        guardarAsistencia(attendanceData) {
            if (bridgeState.syncMode === 'core-only' || bridgeState.syncMode === 'dual') {
                // Intentar con SGESystem si está disponible
                if (typeof window.SGESystem !== 'undefined' && window.SGESystem.guardarAsistencia) {
                    return window.SGESystem.guardarAsistencia(attendanceData);
                }
            }
            // Fallback a SystemDataManager
            return window.systemDataManager.guardarAsistencia(attendanceData);
        },

        /**
         * Obtener mensajes (método unificado)
         */
        getMessages(username, type = 'todos') {
            if (bridgeState.syncMode === 'core-only' || bridgeState.syncMode === 'dual') {
                return window.SGESystem.getMessages(username, type);
            } else {
                return window.systemDataManager.obtenerMensajes(username, type);
            }
        },

        /**
         * Marcar mensaje como leído (método unificado)
         */
        markMessageAsRead(messageId) {
            if (bridgeState.syncMode === 'core-only' || bridgeState.syncMode === 'dual') {
                return window.SGESystem.markMessageAsRead(messageId);
            } else {
                return window.systemDataManager.marcarMensajeLeido(messageId);
            }
        },

        /**
         * Enviar excusa (método unificado)
         */
        sendExcuse(excuseData) {
            if (bridgeState.syncMode === 'core-only' || bridgeState.syncMode === 'dual') {
                return window.SGESystem.sendExcuse(excuseData);
            } else {
                return window.systemDataManager.guardarExcusa(excuseData);
            }
        },

        /**
         * Obtener excusas (método unificado)
         */
        getExcuses(psychologistUsername) {
            if (bridgeState.syncMode === 'core-only' || bridgeState.syncMode === 'dual') {
                return window.SGESystem.getExcuses(psychologistUsername);
            } else {
                return window.systemDataManager.obtenerExcusasPorPsicologa(psychologistUsername);
            }
        },

        /**
         * Enviar archivo (método unificado)
         */
        sendFile(fileData) {
            if (bridgeState.syncMode === 'core-only' || bridgeState.syncMode === 'dual') {
                return window.SGESystem.sendFile(fileData);
            } else {
                // Crear método en SystemDataManager si no existe
                if (!window.systemDataManager.guardarArchivo) {
                    window.systemDataManager.guardarArchivo = (file) => {
                        const data = window.systemDataManager.getAllData();
                        if (!data.archivos) {
                            data.archivos = [];
                        }
                        file.id = file.id || window.systemDataManager.generateId('file_');
                        data.archivos.push(file);
                        window.systemDataManager.saveAllData(data);
                        return file;
                    };
                }
                return window.systemDataManager.guardarArchivo(fileData);
            }
        },

        /**
         * Obtener archivos (método unificado)
         */
        getFiles(username, type = 'todos') {
            if (bridgeState.syncMode === 'core-only' || bridgeState.syncMode === 'dual') {
                return window.SGESystem.getFiles(username, type);
            } else {
                // SystemDataManager no tiene método para archivos, crearlo
                if (!window.systemDataManager.obtenerArchivos) {
                    window.systemDataManager.obtenerArchivos = (username, type = 'todos') => {
                        const data = window.systemDataManager.getAllData();
                        const archivos = data.archivos || [];
                        
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
                    };
                }
                return window.systemDataManager.obtenerArchivos(username, type);
            }
        },

        /**
         * Obtener usuario (método unificado)
         */
        getUser(username) {
            if (bridgeState.syncMode === 'core-only' || bridgeState.syncMode === 'dual') {
                return window.SGESystem.getUser(username);
            } else {
                return window.systemDataManager.getUser(username);
            }
        },

        /**
         * Obtener estadísticas (método unificado)
         */
        getUserStats(username) {
            if (bridgeState.syncMode === 'core-only' || bridgeState.syncMode === 'dual') {
                return window.SGESystem.getUserStats(username);
            } else {
                // SystemDataManager no tiene método de estadísticas, crearlo
                if (!window.systemDataManager.obtenerEstadisticasUsuario) {
                    window.systemDataManager.obtenerEstadisticasUsuario = (username) => {
                        const mensajes = window.systemDataManager.obtenerMensajes(username);
                        const excusas = username.startsWith('psi_') ? 
                            window.systemDataManager.obtenerExcusasPorPsicologa(username) : [];
                        
                        return {
                            mensajes: {
                                total: mensajes.length,
                                recibidos: mensajes.filter(m => m.para === username).length,
                                enviados: mensajes.filter(m => m.de === username).length,
                                noLeidos: mensajes.filter(m => m.para === username && !m.leido).length
                            },
                            excusas: {
                                total: excusas.length,
                                pendientes: excusas.filter(e => e.estado === 'pendiente').length
                            }
                        };
                    };
                }
                return window.systemDataManager.obtenerEstadisticasUsuario(username);
            }
        },

        /**
         * Utilidades
         */

        /**
         * Obtener estado del puente
         */
        getState() {
            return {
                initialized: bridgeState.initialized,
                syncMode: bridgeState.syncMode,
                coreAvailable: bridgeState.coreAvailable,
                dataManagerAvailable: bridgeState.dataManagerAvailable
            };
        },

        /**
         * Forzar sincronización completa
         */
        forceSync() {
            if (bridgeState.syncMode === 'dual') {
                this.syncDataFromDMToCore();
                
                // Forzar guardado en ambos sistemas
                if (bridgeState.coreAvailable) {
                    window.SGESystem.sync();
                }
                
                if (bridgeState.dataManagerAvailable) {
                    // SystemDataManager guarda automáticamente
                }
                
                console.log('🔄 Sincronización forzada completada');
            }
        },

        /**
         * Cambiar modo de sincronización
         */
        setSyncMode(mode) {
            if (['dual', 'core-only', 'dm-only'].includes(mode)) {
                bridgeState.syncMode = mode;
                console.log(`🔄 Modo de sincronización cambiado a: ${mode}`);
                return true;
            }
            return false;
        }
    };

    // Exportar puente
    const root = global || window;
    root[NAMESPACE] = SystemBridge;

    // También exportar como window.SystemBridge para compatibilidad
    if (typeof window !== 'undefined') {
        window.SystemBridge = SystemBridge;
    }

    // Auto-inicializar si estamos en navegador
    if (typeof window !== 'undefined') {
        // Esperar a que ambos sistemas estén listos
        const initializeBridge = () => {
            const coreReady = typeof window.SGESystem !== 'undefined';
            const dmReady = typeof window.SystemDataManager !== 'undefined';
            
            if (coreReady || dmReady) {
                SystemBridge.init();
            } else {
                // Reintentar en 100ms
                setTimeout(initializeBridge, 100);
            }
        };

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initializeBridge);
        } else {
            initializeBridge();
        }
    }

    console.log('🌉 SystemBridge cargado correctamente');

})(typeof window !== 'undefined' ? window : global);
