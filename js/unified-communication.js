/**
 * SISTEMA UNIFICADO DE COMUNICACIÓN ENTRE DASHBOARDS
 * Conecta docente-dashboard.html y psicologia-dashboard.html
 * usando claves de almacenamiento compartidas y sincronización en tiempo real
 */

class UnifiedCommunicationSystem {
    constructor() {
        this.initialized = false;
        this.currentModule = null;
        this.currentUser = null;
        this.syncListeners = [];
        
        // Claves unificadas de almacenamiento
        this.storageKeys = {
            MENSAJES: 'sge_mensajes_sistema',
            ARCHIVOS: 'sge_archivos_sistema', 
            EXCUSAS: 'sge_excusas_sistema',
            ACTIVIDAD: 'sge_actividad_sistema',
            ESTADISTICAS: 'sge_estadisticas_sistema'
        };
        
        this.init();
    }

    /**
     * Inicializar sistema de comunicación
     */
    init() {
        if (this.initialized) {
            console.log('🔄 Sistema de comunicación ya inicializado');
            return;
        }

        console.log('🌐 Inicializando Sistema Unificado de Comunicación');
        
        // Detectar módulo actual
        this.detectCurrentModule();
        
        // Cargar usuario actual
        this.loadCurrentUser();
        
        // Inicializar almacenamiento
        this.initializeStorage();
        
        // Configurar sincronización
        this.setupSyncListeners();
        
        // Migrar datos existentes
        this.migrateExistingData();
        
        this.initialized = true;
        console.log('✅ Sistema Unificado de Comunicación inicializado');
        console.log(`📍 Módulo detectado: ${this.currentModule}`);
        console.log(`👤 Usuario actual: ${this.currentUser?.username || 'No definido'}`);
    }

    /**
     * Detectar módulo actual basado en la URL
     */
    detectCurrentModule() {
        const url = window.location.pathname.toLowerCase();
        
        if (url.includes('docente-dashboard')) {
            this.currentModule = 'docente';
        } else if (url.includes('psicologia')) {
            this.currentModule = 'psicologia';
        } else {
            this.currentModule = 'desconocido';
        }
    }

    /**
     * Cargar usuario actual
     */
    loadCurrentUser() {
        try {
            const userData = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
            if (userData) {
                this.currentUser = JSON.parse(userData);
            }
        } catch (error) {
            console.warn('⚠️ Error cargando usuario:', error);
            this.currentUser = null;
        }
    }

    /**
     * Inicializar almacenamiento si no existe
     */
    initializeStorage() {
        Object.values(this.storageKeys).forEach(key => {
            if (!localStorage.getItem(key)) {
                localStorage.setItem(key, JSON.stringify([]));
                console.log(`📁 Inicializada clave: ${key}`);
            }
        });
    }

    /**
     * Configurar listeners de sincronización
     */
    setupSyncListeners() {
        // Escuchar cambios en localStorage (para otras pestañas)
        window.addEventListener('storage', (e) => {
            if (Object.values(this.storageKeys).includes(e.key)) {
                this.handleStorageChange(e.key, e.newValue);
            }
        });

        // Escuchar eventos personalizados
        window.addEventListener('sge-data-updated', (e) => {
            this.handleDataUpdate(e.detail);
        });

        // Configurar sincronización periódica
        setInterval(() => {
            this.performAutoSync();
        }, 30000); // Cada 30 segundos
    }

    /**
     * Migrar datos existentes desde claves antiguas
     */
    migrateExistingData() {
        console.log('🔄 Iniciando migración de datos existentes');
        
        // Migrar mensajes de docentes
        this.migrateKey('teacher_messages', this.storageKeys.MENSAJES, 'mensajes');
        
        // Migrar archivos de docentes  
        this.migrateKey('teacher_files', this.storageKeys.ARCHIVOS, 'archivos');
        
        // Migrar excusas de docentes
        this.migrateKey('teacher_excuses', this.storageKeys.EXCUSAS, 'excusas');
        
        // Migrar desde SystemDataManager si existe
        this.migrateFromSystemDataManager();
        
        console.log('✅ Migración de datos completada');
    }

    /**
     * Migrar clave específica
     */
    migrateKey(oldKey, newKey, dataType) {
        try {
            const oldData = localStorage.getItem(oldKey);
            if (oldData) {
                const existingData = JSON.parse(localStorage.getItem(newKey) || '[]');
                const dataToMigrate = JSON.parse(oldData);
                
                // Combinar datos sin duplicados
                const combinedData = this.combineData(existingData, dataToMigrate, dataType);
                
                localStorage.setItem(newKey, JSON.stringify(combinedData));
                
                // Opcional: eliminar clave antigua
                // localStorage.removeItem(oldKey);
                
                console.log(`📦 Migrados ${dataToMigrate.length} ${dataType} desde ${oldKey}`);
            }
        } catch (error) {
            console.warn(`⚠️ Error migrando ${oldKey}:`, error);
        }
    }

    /**
     * Migrar desde SystemDataManager
     */
    migrateFromSystemDataManager() {
        try {
            const systemData = localStorage.getItem('sge_system_data');
            if (systemData) {
                const data = JSON.parse(systemData);
                
                // Migrar mensajes
                if (data.mensajes && Array.isArray(data.mensajes)) {
                    this.migrateSystemData('mensajes', data.mensajes);
                }
                
                // Migrar archivos
                if (data.archivos && Array.isArray(data.archivos)) {
                    this.migrateSystemData('archivos', data.archivos);
                }
                
                // Migrar excusas
                if (data.excusas && Array.isArray(data.excusas)) {
                    this.migrateSystemData('excusas', data.excusas);
                }
                
                console.log('📦 Datos migrados desde SystemDataManager');
            }
        } catch (error) {
            console.warn('⚠️ Error migrando desde SystemDataManager:', error);
        }
    }

    /**
     * Migrar datos del sistema
     */
    migrateSystemData(type, data) {
        const targetKey = type === 'mensajes' ? this.storageKeys.MENSAJES :
                         type === 'archivos' ? this.storageKeys.ARCHIVOS :
                         type === 'excusas' ? this.storageKeys.EXCUSAS : null;
        
        if (!targetKey) return;
        
        try {
            const existingData = JSON.parse(localStorage.getItem(targetKey) || '[]');
            const combinedData = this.combineData(existingData, data, type);
            
            localStorage.setItem(targetKey, JSON.stringify(combinedData));
            console.log(`📦 Migrados ${data.length} ${type} desde SystemDataManager`);
        } catch (error) {
            console.warn(`⚠️ Error migrando ${type}:`, error);
        }
    }

    /**
     * Combinar datos sin duplicados
     */
    combineData(existing, newData, type) {
        const combined = [...existing];
        const existingIds = new Set(existing.map(item => item.id));
        
        newData.forEach(item => {
            if (!existingIds.has(item.id)) {
                combined.push(item);
            }
        });
        
        return combined.sort((a, b) => new Date(b.timestamp || b.date) - new Date(a.timestamp || a.date));
    }

    /**
     * ==================== FUNCIONES UNIFICADAS ====================
     */

    /**
     * Guardar mensaje (método unificado)
     */
    guardarMensaje(messageData) {
        try {
            // Validar datos mínimos
            if (!messageData.de || !messageData.para || !messageData.contenido) {
                throw new Error('Datos de mensaje incompletos');
            }

            // Estructurar mensaje
            const mensaje = {
                id: this.generateId('msg_'),
                de: messageData.de,
                para: messageData.para,
                contenido: messageData.contenido,
                asunto: messageData.asunto || 'Sin asunto',
                timestamp: new Date().toISOString(),
                leido: false,
                moduloOrigen: this.currentModule,
                tipo: messageData.tipo || 'mensaje'
            };

            // Guardar en almacenamiento unificado
            const mensajes = this.obtenerMensajes();
            mensajes.push(mensaje);
            localStorage.setItem(this.storageKeys.MENSAJES, JSON.stringify(mensajes));

            // Actualizar estadísticas
            this.actualizarEstadisticas('mensajes_enviados', 1);

            // Emitir evento de actualización
            this.emitDataUpdate('mensajes', mensaje);

            console.log('✅ Mensaje guardado:', mensaje);
            return mensaje;

        } catch (error) {
            console.error('❌ Error guardando mensaje:', error);
            return null;
        }
    }

    /**
     * Obtener mensajes (método unificado)
     */
    obtenerMensajes(usuario = null, tipo = 'todos') {
        try {
            const mensajes = JSON.parse(localStorage.getItem(this.storageKeys.MENSAJES) || '[]');
            let filtrados = mensajes;

            // Filtrar por usuario
            if (usuario) {
                filtrados = mensajes.filter(m => m.de === usuario || m.para === usuario);
            }

            // Filtrar por tipo
            if (tipo === 'recibidos') {
                filtrados = filtrados.filter(m => m.para === usuario);
            } else if (tipo === 'enviados') {
                filtrados = filtrados.filter(m => m.de === usuario);
            }

            return filtrados.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        } catch (error) {
            console.error('❌ Error obteniendo mensajes:', error);
            return [];
        }
    }

    /**
     * Guardar archivo (método unificado)
     */
    guardarArchivo(fileData) {
        try {
            // Validar datos mínimos
            if (!fileData.de || !fileData.para || !fileData.nombre) {
                throw new Error('Datos de archivo incompletos');
            }

            // Estructurar archivo
            const archivo = {
                id: this.generateId('file_'),
                de: fileData.de,
                para: fileData.para,
                nombre: fileData.nombre,
                contenido: fileData.contenido || fileData.data,
                tamaño: fileData.tamaño || fileData.size || 0,
                tipo: fileData.tipo || fileData.type || 'application/octet-stream',
                timestamp: new Date().toISOString(),
                moduloOrigen: this.currentModule,
                estado: 'enviado'
            };

            // Guardar en almacenamiento unificado
            const archivos = this.obtenerArchivos();
            archivos.push(archivo);
            localStorage.setItem(this.storageKeys.ARCHIVOS, JSON.stringify(archivos));

            // Actualizar estadísticas
            this.actualizarEstadisticas('archivos_enviados', 1);

            // Emitir evento de actualización
            this.emitDataUpdate('archivos', archivo);

            console.log('✅ Archivo guardado:', archivo);
            return archivo;

        } catch (error) {
            console.error('❌ Error guardando archivo:', error);
            return null;
        }
    }

    /**
     * Obtener archivos (método unificado)
     */
    obtenerArchivos(usuario = null, tipo = 'todos') {
        try {
            const archivos = JSON.parse(localStorage.getItem(this.storageKeys.ARCHIVOS) || '[]');
            let filtrados = archivos;

            // Filtrar por usuario
            if (usuario) {
                filtrados = archivos.filter(a => a.de === usuario || a.para === usuario);
            }

            // Filtrar por tipo
            if (tipo === 'recibidos') {
                filtrados = filtrados.filter(a => a.para === usuario);
            } else if (tipo === 'enviados') {
                filtrados = filtrados.filter(a => a.de === usuario);
            }

            return filtrados.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        } catch (error) {
            console.error('❌ Error obteniendo archivos:', error);
            return [];
        }
    }

    /**
     * Guardar excusa (método unificado)
     */
    guardarExcusa(excuseData) {
        try {
            // Validar datos mínimos
            if (!excuseData.estudiante || !excuseData.profesor) {
                throw new Error('Datos de excusa incompletos');
            }

            // Estructurar excusa
            const excusa = {
                id: this.generateId('exc_'),
                estudiante: excuseData.estudiante,
                profesor: excuseData.profesor,
                motivo: excuseData.motivo || excuseData.descripcion || '',
                fecha: excuseData.fecha || new Date().toISOString().split('T')[0],
                timestamp: new Date().toISOString(),
                estado: 'pendiente',
                moduloOrigen: this.currentModule,
                psicologaAsignada: this.asignarPsicologaAutomatica()
            };

            // Guardar en almacenamiento unificado
            const excusas = this.obtenerExcusas();
            excusas.push(excusa);
            localStorage.setItem(this.storageKeys.EXCUSAS, JSON.stringify(excusas));

            // Actualizar estadísticas
            this.actualizarEstadisticas('excusas_creadas', 1);

            // Emitir evento de actualización
            this.emitDataUpdate('excusas', excusa);

            console.log('✅ Excusa guardada:', excusa);
            return excusa;

        } catch (error) {
            console.error('❌ Error guardando excusa:', error);
            return null;
        }
    }

    /**
     * Obtener excusas (método unificado)
     */
    obtenerExcusas(usuario = null, tipo = 'todos') {
        try {
            const excusas = JSON.parse(localStorage.getItem(this.storageKeys.EXCUSAS) || '[]');
            let filtrados = excusas;

            // Filtrar por usuario
            if (usuario) {
                filtrados = excusas.filter(e => e.profesor === usuario || e.psicologaAsignada === usuario);
            }

            // Filtrar por tipo
            if (tipo === 'pendientes') {
                filtrados = filtrados.filter(e => e.estado === 'pendiente');
            } else if (tipo === 'respondidas') {
                filtrados = filtrados.filter(e => e.estado === 'respondido');
            }

            return filtrados.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        } catch (error) {
            console.error('❌ Error obteniendo excusas:', error);
            return [];
        }
    }

    /**
     * ==================== FUNCIONES DE SINCRONIZACIÓN ====================
     */

    /**
     * Manejar cambios en localStorage
     */
    handleStorageChange(key, newValue) {
        if (!newValue) return;

        try {
            const data = JSON.parse(newValue);
            const dataType = this.getDataTypeFromKey(key);
            
            this.notifyDataChange(dataType, data);
            
        } catch (error) {
            console.warn('⚠️ Error procesando cambio en almacenamiento:', error);
        }
    }

    /**
     * Manejar actualización de datos
     */
    handleDataUpdate(detail) {
        const { type, data, action } = detail;
        
        // Actualizar UI si estamos en el módulo correspondiente
        if (this.shouldUpdateUI(type, data)) {
            this.updateUI(type, data, action);
        }
    }

    /**
     * Emitir evento de actualización de datos
     */
    emitDataUpdate(type, data) {
        const event = new CustomEvent('sge-data-updated', {
            detail: { type, data, action: 'created', timestamp: Date.now() }
        });
        
        window.dispatchEvent(event);
        
        // También notificar a SystemDataManager si existe
        if (window.systemDataManager) {
            this.syncToSystemDataManager(type, data);
        }
    }

    /**
     * Sincronizar con SystemDataManager
     */
    syncToSystemDataManager(type, data) {
        try {
            if (!window.systemDataManager) return;

            switch (type) {
                case 'mensajes':
                    if (window.systemDataManager.guardarMensaje) {
                        window.systemDataManager.guardarMensaje(data);
                    }
                    break;
                case 'archivos':
                    if (window.systemDataManager.guardarArchivo) {
                        window.systemDataManager.guardarArchivo(data);
                    }
                    break;
                case 'excusas':
                    if (window.systemDataManager.guardarExcusa) {
                        window.systemDataManager.guardarExcusa(data);
                    }
                    break;
            }
        } catch (error) {
            console.warn('⚠️ Error sincronizando con SystemDataManager:', error);
        }
    }

    /**
     * Realizar sincronización automática
     */
    performAutoSync() {
        try {
            // Verificar integridad de datos
            this.verifyDataIntegrity();
            
            // Forzar actualización de UI
            this.refreshCurrentModuleData();
            
            console.log('🔄 Sincronización automática completada');
            
        } catch (error) {
            console.warn('⚠️ Error en sincronización automática:', error);
        }
    }

    /**
     * Verificar integridad de datos
     */
    verifyDataIntegrity() {
        Object.values(this.storageKeys).forEach(key => {
            try {
                const data = JSON.parse(localStorage.getItem(key) || '[]');
                if (!Array.isArray(data)) {
                    console.warn(`⚠️ Datos corruptos en ${key}, reinicializando`);
                    localStorage.setItem(key, JSON.stringify([]));
                }
            } catch (error) {
                console.warn(`⚠️ Error verificando ${key}:`, error);
                localStorage.setItem(key, JSON.stringify([]));
            }
        });
    }

    /**
     * ==================== FUNCIONES UTILITARIAS ====================
     */

    /**
     * Generar ID único
     */
    generateId(prefix = '') {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 9);
        return `${prefix}${timestamp}_${random}`;
    }

    /**
     * Asignar psicóloga automáticamente
     */
    asignarPsicologaAutomatica() {
        const psicologas = [
            'psi_marta_rodriguez', 'psi_carolina_gomez', 'psi_ana_martinez',
            'psi_laura_perez', 'psi_claudia_hernandez', 'psi_patricia_lopez',
            'psi_sofia_garcia', 'psi_valentina_diaz', 'psi_camila_fernandez',
            'psi_isabella_torres', 'psi_maria_gonzalez', 'psi_elena_ramirez',
            'psi_carmen_sanchez'
        ];
        
        return psicologas[Math.floor(Math.random() * psicologas.length)];
    }

    /**
     * Obtener tipo de dato desde clave
     */
    getDataTypeFromKey(key) {
        const mapping = {
            [this.storageKeys.MENSAJES]: 'mensajes',
            [this.storageKeys.ARCHIVOS]: 'archivos',
            [this.storageKeys.EXCUSAS]: 'excusas',
            [this.storageKeys.ACTIVIDAD]: 'actividad',
            [this.storageKeys.ESTADISTICAS]: 'estadisticas'
        };
        return mapping[key] || 'desconocido';
    }

    /**
     * Verificar si se debe actualizar UI
     */
    shouldUpdateUI(type, data) {
        // Actualizar si el dato es relevante para el módulo actual
        if (!this.currentUser) return false;

        switch (type) {
            case 'mensajes':
                return data.de === this.currentUser.username || data.para === this.currentUser.username;
            case 'archivos':
                return data.de === this.currentUser.username || data.para === this.currentUser.username;
            case 'excusas':
                return data.profesor === this.currentUser.username || data.psicologaAsignada === this.currentUser.username;
            default:
                return false;
        }
    }

    /**
     * Actualizar UI del módulo actual
     */
    updateUI(type, data, action) {
        // Este método será sobrescrito por cada módulo específico
        console.log(`🔄 Actualizando UI para ${type}:`, data);
        
        // Emitir evento específico del módulo
        const moduleEvent = new CustomEvent(`sge-${this.currentModule}-update`, {
            detail: { type, data, action }
        });
        window.dispatchEvent(moduleEvent);
    }

    /**
     * Refrescar datos del módulo actual
     */
    refreshCurrentModuleData() {
        if (!this.currentUser) return;

        switch (this.currentModule) {
            case 'docente':
                this.refreshDocenteData();
                break;
            case 'psicologia':
                this.refreshPsicologiaData();
                break;
        }
    }

    /**
     * Refrescar datos de docente
     */
    refreshDocenteData() {
        const mensajes = this.obtenerMensajes(this.currentUser.username, 'recibidos');
        const archivos = this.obtenerArchivos(this.currentUser.username, 'recibidos');
        const excusas = this.obtenerExcusas(this.currentUser.username, 'todos');

        // Emitir evento con datos actualizados
        const event = new CustomEvent('sge-docente-data-refresh', {
            detail: { mensajes, archivos, excusas }
        });
        window.dispatchEvent(event);
    }

    /**
     * Refrescar datos de psicología
     */
    refreshPsicologiaData() {
        const mensajes = this.obtenerMensajes(this.currentUser.username, 'recibidos');
        const archivos = this.obtenerArchivos(this.currentUser.username, 'recibidos');
        const excusas = this.obtenerExcusas(this.currentUser.username, 'pendientes');

        // Emitir evento con datos actualizados
        const event = new CustomEvent('sge-psicologia-data-refresh', {
            detail: { mensajes, archivos, excusas }
        });
        window.dispatchEvent(event);
    }

    /**
     * Actualizar estadísticas
     */
    actualizarEstadisticas(tipo, cantidad = 1) {
        try {
            const stats = JSON.parse(localStorage.getItem(this.storageKeys.ESTADISTICAS) || '{}');
            const usuario = this.currentUser?.username || 'anonimo';
            
            if (!stats[usuario]) {
                stats[usuario] = {};
            }
            
            stats[usuario][tipo] = (stats[usuario][tipo] || 0) + cantidad;
            
            localStorage.setItem(this.storageKeys.ESTADISTICAS, JSON.stringify(stats));
            
        } catch (error) {
            console.warn('⚠️ Error actualizando estadísticas:', error);
        }
    }

    /**
     * Notificar cambio de datos
     */
    notifyDataChange(type, data) {
        console.log(`📢 Cambio en ${type}:`, data);
        
        // Mostrar notificación si es relevante
        if (this.shouldShowNotification(type, data)) {
            this.showNotification(type, data);
        }
    }

    /**
     * Verificar si se debe mostrar notificación
     */
    shouldShowNotification(type, data) {
        if (!this.currentUser) return false;
        
        // Mostrar notificación si es un mensaje o archivo recibido
        switch (type) {
            case 'mensajes':
                return data.para === this.currentUser.username && !data.leido;
            case 'archivos':
                return data.para === this.currentUser.username;
            case 'excusas':
                return data.psicologaAsignada === this.currentUser.username;
            default:
                return false;
        }
    }

    /**
     * Mostrar notificación
     */
    showNotification(type, data) {
        if (!window.Swal) return;

        let title = '';
        let message = '';
        
        switch (type) {
            case 'mensajes':
                title = 'Nuevo Mensaje';
                message = `Tienes un nuevo mensaje de ${data.de}`;
                break;
            case 'archivos':
                title = 'Nuevo Archivo';
                message = `${data.de} te ha enviado un archivo: ${data.nombre}`;
                break;
            case 'excusas':
                title = 'Nueva Excusa';
                message = `Nueva excusa de ${data.estudiante}`;
                break;
        }

        Swal.fire({
            title: title,
            text: message,
            icon: 'info',
            timer: 5000,
            showConfirmButton: false,
            toast: true
        });
    }

    /**
     * Obtener estadísticas del usuario
     */
    obtenerEstadisticas(usuario = null) {
        try {
            const stats = JSON.parse(localStorage.getItem(this.storageKeys.ESTADISTICAS) || '{}');
            const targetUser = usuario || this.currentUser?.username;
            
            return stats[targetUser] || {
                mensajes_enviados: 0,
                mensajes_recibidos: 0,
                archivos_enviados: 0,
                archivos_recibidos: 0,
                excusas_creadas: 0,
                excusas_respondidas: 0
            };
        } catch (error) {
            console.warn('⚠️ Error obteniendo estadísticas:', error);
            return {};
        }
    }

    /**
     * Limpiar datos antiguos
     */
    limpiarDatosAntiguos(dias = 30) {
        try {
            const fechaLimite = new Date();
            fechaLimite.setDate(fechaLimite.getDate() - dias);
            
            let totalEliminados = 0;
            
            Object.values(this.storageKeys).forEach(key => {
                const data = JSON.parse(localStorage.getItem(key) || '[]');
                const datosFiltrados = data.filter(item => {
                    const fechaItem = new Date(item.timestamp || item.date);
                    return fechaItem > fechaLimite;
                });
                
                const eliminados = data.length - datosFiltrados.length;
                totalEliminados += eliminados;
                
                localStorage.setItem(key, JSON.stringify(datosFiltrados));
            });
            
            console.log(`🧹 Limpieza completada: ${totalEliminados} registros eliminados`);
            
        } catch (error) {
            console.warn('⚠️ Error en limpieza de datos:', error);
        }
    }

    /**
     * Exportar datos
     */
    exportarDatos() {
        try {
            const exportData = {
                mensajes: this.obtenerMensajes(),
                archivos: this.obtenerArchivos(),
                excusas: this.obtenerExcusas(),
                estadisticas: JSON.parse(localStorage.getItem(this.storageKeys.ESTADISTICAS) || '{}'),
                exportadoEn: new Date().toISOString(),
                version: '1.0.0',
                modulo: this.currentModule
            };
            
            return JSON.stringify(exportData, null, 2);
            
        } catch (error) {
            console.error('❌ Error exportando datos:', error);
            return null;
        }
    }

    /**
     * Obtener estado del sistema
     */
    getEstado() {
        return {
            inicializado: this.initialized,
            moduloActual: this.currentModule,
            usuarioActual: this.currentUser,
            clavesAlmacenamiento: this.storageKeys,
            totalMensajes: this.obtenerMensajes().length,
            totalArchivos: this.obtenerArchivos().length,
            totalExcusas: this.obtenerExcusas().length
        };
    }
}

// Exportar clase
if (typeof window !== 'undefined') {
    window.UnifiedCommunicationSystem = UnifiedCommunicationSystem;
}

// Auto-inicializar
if (typeof window !== 'undefined') {
    window.unifiedComm = new UnifiedCommunicationSystem();
    console.log('🌐 Sistema Unificado de Comunicación cargado');
}
