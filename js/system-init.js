/**
 * SISTEMA DE INICIALIZACIÓN AUTOMÁTICA Y PORTABILIDAD
 * Archivo: system-init.js
 * Descripción: Sistema robusto para inicialización automática en cualquier computadora
 */

// ========================================
// FUNCIONES GLOBALES DE SEGURIDAD
// ========================================

// Función para parseo seguro de localStorage
function safeParse(key, defaultValue = null) {
    try {
        const value = localStorage.getItem(key);
        if (value === null) return defaultValue;
        return JSON.parse(value);
    } catch (error) {
        console.warn(`Error al parsear ${key}:`, error);
        return defaultValue;
    }
}

// Función para guardar seguro en localStorage
function safeSave(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error(`Error al guardar ${key}:`, error);
        return false;
    }
}

// ========================================
// SISTEMA DE INICIALIZACIÓN AUTOMÁTICA
// ========================================

// Función principal de inicialización del sistema
function initSystem() {
    console.log('🚀 Inicializando Sistema SGE...');
    
    // Detectar entorno
    const isFileProtocol = window.location.protocol === 'file:';
    if (isFileProtocol) {
        console.warn('⚠️ Sistema ejecutándose desde file:// - Se recomienda usar servidor local');
        setTimeout(() => {
            if (!localStorage.getItem('fileProtocolWarningShown')) {
                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        title: 'Recomendación de Acceso',
                        html: `
                            <div style="text-align: left; line-height: 1.6;">
                                <p><strong>Se detectó que está accediendo desde archivo local.</strong></p>
                                <p>Para un funcionamiento óptimo, se recomienda:</p>
                                <ul style="margin: 10px 0; padding-left:20px;">
                                    <li>Usar un servidor local (Live Server, XAMPP, etc.)</li>
                                    <li>Abrir con: http://localhost/...</li>
                                </ul>
                                <p style="margin-top: 15px;"><small>El sistema funcionará igualmente, pero algunas características pueden limitarse.</small></p>
                            </div>
                        `,
                        icon: 'info',
                        confirmButtonText: 'Entendido',
                        showCancelButton: false
                    });
                }
                localStorage.setItem('fileProtocolWarningShown', 'true');
            }
        }, 2000);
    }
    
    // Inicializar claves críticas si no existen
    const criticalKeys = {
        'systemModules': {
            teachers: true,
            psychology: true,
            tesoreria: true,
            porteria: true,
            secretaria: true,
            orientacion: true,
            empresas: true,
            comedor: true,
            cafeteria: true,
            biblioteca: true
        },
        'systemLogs': [],
        'usuarios': [
            {
                username: 'admin',
                password: 'admin123',
                name: 'Administrador',
                role: 'administrador'
            },
            {
                username: 'direccion',
                password: 'direccion123',
                name: 'Dirección',
                role: 'director'
            }
        ],
        'archivos': {
            total: 0,
            uploaded: 0,
            moved: 0,
            deleted: 0
        },
        'fileStats': {
            total: 0,
            uploaded: 0,
            moved: 0,
            deleted: 0
        }
    };
    
    let initializedKeys = 0;
    
    // VERIFICACIÓN FORZADA DE systemModules - PRIORIDAD MÁXIMA
    if (!localStorage.getItem('systemModules')) {
        console.warn('🔥 CRÍTICO: systemModules NO existe - Creando inmediatamente...');
        safeSave('systemModules', criticalKeys['systemModules']);
        initializedKeys++;
        console.log('✅ systemModules creado con todos los módulos activos');
    } else {
        // Verificar integridad de systemModules existente
        try {
            const existingModules = JSON.parse(localStorage.getItem('systemModules'));
            const requiredModules = Object.keys(criticalKeys['systemModules']);
            let missingModules = [];
            
            requiredModules.forEach(module => {
                if (!(module in existingModules)) {
                    missingModules.push(module);
                }
            });
            
            if (missingModules.length > 0) {
                console.warn(`⚠️ Módulos faltantes en systemModules: ${missingModules.join(', ')}`);
                missingModules.forEach(module => {
                    existingModules[module] = true;
                });
                safeSave('systemModules', existingModules);
                console.log('✅ Módulos faltantes agregados a systemModules');
            } else {
                console.log('✅ systemModules verificado y completo');
            }
        } catch (error) {
            console.error('❌ systemModules corrupto - Recreando...', error);
            safeSave('systemModules', criticalKeys['systemModules']);
            initializedKeys++;
        }
    }
    
    // Verificar y crear otras claves críticas
    for (const [key, defaultValue] of Object.entries(criticalKeys)) {
        if (key === 'systemModules') continue; // Ya fue procesado arriba
        
        if (!localStorage.getItem(key)) {
            safeSave(key, defaultValue);
            console.log(`✅ Clave inicializada: ${key}`);
            initializedKeys++;
        } else {
            // Verificar integridad de datos existentes
            try {
                JSON.parse(localStorage.getItem(key));
                console.log(`✅ Clave verificada: ${key}`);
            } catch (error) {
                console.warn(`⚠️ Clave corrupta reparada: ${key}`);
                safeSave(key, defaultValue);
                initializedKeys++;
            }
        }
    }
    
    // Inicializar sistema de logs si no existe
    const logs = safeParse('systemLogs', []);
    if (logs.length === 0) {
        const initLog = {
            time: new Date().toTimeString().split(' ')[0],
            message: 'Sistema inicializado correctamente',
            type: 'system',
            timestamp: Date.now(),
            date: new Date().toISOString()
        };
        logs.unshift(initLog);
        safeSave('systemLogs', logs);
    }
    
    // Configurar detección global de errores
    window.addEventListener('error', function(event) {
        const errorMessage = `Error: ${event.message} en ${event.filename}:${event.lineno}`;
        console.error('Error global detectado:', event);
        
        // Guardar en logs
        const logs = safeParse('systemLogs', []);
        const errorLog = {
            time: new Date().toTimeString().split(' ')[0],
            message: errorMessage,
            type: 'error',
            timestamp: Date.now(),
            date: new Date().toISOString()
        };
        logs.unshift(errorLog);
        
        // Mantener solo los últimos 100 errores
        if (logs.filter(l => l.type === 'error').length > 100) {
            const errorCount = logs.filter(l => l.type === 'error').length;
            const lastNonErrorIndex = logs.findIndex(l => l.type !== 'error');
            if (lastNonErrorIndex > 0) {
                logs.splice(lastNonErrorIndex, errorCount - 99);
            }
        }
        
        safeSave('systemLogs', logs.slice(0, 200));
    });
    
    // Capturar promesas rechazadas
    window.addEventListener('unhandledrejection', function(event) {
        const errorMessage = `Promise rechazada: ${event.reason}`;
        console.error('Promise rechazada detectada:', event);
        
        const logs = safeParse('systemLogs', []);
        const rejectionLog = {
            time: new Date().toTimeString().split(' ')[0],
            message: errorMessage,
            type: 'error',
            timestamp: Date.now(),
            date: new Date().toISOString()
        };
        logs.unshift(rejectionLog);
        safeSave('systemLogs', logs.slice(0, 200));
    });
    
    console.log(`✅ Sistema inicializado: ${initializedKeys} claves creadas`);
    console.log('🎯 Sistema SGE listo para uso');
    
    // VERIFICACIÓN FINAL CRÍTICA
    const finalCheck = localStorage.getItem('systemModules');
    if (!finalCheck) {
        console.error('🔥 ERROR CRÍTICO: systemModules no se pudo inicializar');
        return false;
    } else {
        const modules = JSON.parse(finalCheck);
        const activeCount = Object.values(modules).filter(v => v === true).length;
        console.log(`🎉 VERIFICACIÓN FINAL: systemModules OK con ${activeCount} módulos activos`);
    }
    
    return true;
}

// Función de auto-reparación
function repairSystem() {
    console.log('🔧 Ejecutando auto-reparación del sistema...');
    
    const criticalKeys = {
        'systemModules': {
            teachers: true,
            psychology: true,
            tesoreria: true,
            porteria: true,
            secretaria: true,
            orientacion: true,
            empresas: true,
            comedor: true,
            cafeteria: true,
            biblioteca: true
        },
        'systemLogs': [],
        'fileStats': {
            total: 0,
            uploaded: 0,
            moved: 0,
            deleted: 0
        }
    };
    
    let repaired = 0;
    
    for (const [key, defaultValue] of Object.entries(criticalKeys)) {
        try {
            const currentValue = localStorage.getItem(key);
            if (!currentValue) {
                safeSave(key, defaultValue);
                repaired++;
                console.log(`🔧 Clave reparada: ${key}`);
            } else {
                // Verificar que sea JSON válido
                JSON.parse(currentValue);
            }
        } catch (error) {
            safeSave(key, defaultValue);
            repaired++;
            console.log(`🔧 Clave corrupta reparada: ${key}`);
        }
    }
    
    console.log(`✅ Reparación completada: ${repaired} elementos`);
    return repaired;
}

// Función para verificar módulo activo
function isModuleActive(moduleName) {
    const modules = safeParse('systemModules', {});
    return modules[moduleName] !== false;
}

// Función para mostrar mensaje de mantenimiento
function showMaintenanceMessage(moduleName = 'módulo') {
    const maintenanceHTML = `
        <div style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 999999;
            font-family: 'Segoe UI', sans-serif;
        ">
            <div style="
                background: white;
                padding: 40px;
                border-radius: 15px;
                text-align: center;
                max-width: 500px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.3);
            ">
                <div style="
                    width: 80px;
                    height: 80px;
                    background: linear-gradient(135deg, #f59e0b, #d97706);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 20px;
                ">
                    <i class="fas fa-tools" style="color: white; font-size: 30px;"></i>
                </div>
                <h2 style="color: #2c3e50; margin-bottom: 15px;">Módulo en Mantenimiento</h2>
                <p style="color: #7f8c8d; line-height: 1.6; margin-bottom: 20px;">
                    El módulo <strong>${moduleName}</strong> se encuentra temporalmente en mantenimiento.<br>
                    Por favor, intente acceder más tarde.<br>
                    <small>Si el problema persiste, contacte al administrador del sistema.</small>
                </p>
                <button onclick="location.reload()" style="
                    background: linear-gradient(135deg, #3b82f6, #2563eb);
                    color: white;
                    border: none;
                    padding: 12px 30px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 16px;
                    font-weight: 600;
                ">
                    <i class="fas fa-sync"></i> Reintentar
                </button>
            </div>
        </div>
    `;
    
    document.body.innerHTML = maintenanceHTML;
}

// Función para verificar acceso a módulos
function checkModuleAccess(moduleName) {
    // Si no se especifica módulo, intentar detectar automáticamente
    if (!moduleName) {
        const path = window.location.pathname;
        const filename = path.split('/').pop();
        
        // Mapeo de archivos a módulos
        const moduleMapping = {
            'porteria-dashboard.html': 'porteria',
            'tesoreria-dashboard.html': 'tesoreria',
            'secretaria-dashboard.html': 'secretaria',
            'orientacion-dashboard.html': 'orientacion',
            'empresas-dashboard.html': 'empresas',
            'comedor.html': 'comedor',
            'inventario-cafeteria.html': 'cafeteria',
            'biblioteca-dashboard.html': 'biblioteca',
            'dashboard-papeleria.html': 'papeleria',
            'gestion-odontologia.html': 'odontologia',
            'modulo-enfermeria.html': 'enfermeria'
        };
        
        moduleName = moduleMapping[filename] || 'unknown';
    }
    
    // Verificar si el módulo está activo
    const isActive = isModuleActive(moduleName);
    
    if (!isActive) {
        console.log(`Módulo ${moduleName} está inactivo, mostrando mensaje de mantenimiento`);
        showMaintenanceMessage(moduleName);
        return false;
    }
    
    console.log(`Módulo ${moduleName} está activo, acceso permitido`);
    return true;
}

// ========================================
// VERIFICACIÓN DE ENTORNO Y RUTAS
// ========================================

// Función para verificar rutas relativas y compatibilidad file://
function checkEnvironment() {
    const isFileProtocol = window.location.protocol === 'file:';
    let brokenLinks = 0;
    let checkedLinks = 0;
    
    if (isFileProtocol) {
        console.warn('⚠️ Sistema ejecutándose desde archivo local');
        
        // Esperar un poco a que los recursos se carguen
        setTimeout(() => {
            // Verificar si los recursos cargan correctamente
            const testLinks = document.querySelectorAll('link[rel="stylesheet"], script[src]');
            
            testLinks.forEach(link => {
                const href = link.href || link.src;
                if (href) {
                    checkedLinks++;
                    // En file://, las rutas absolutas pueden indicar problemas
                    if (href.includes('file://') && !href.includes(window.location.origin)) {
                        // Es una ruta file:// externa (puede ser problemático)
                        console.warn('Posible problema con ruta externa:', href);
                        brokenLinks++;
                    } else if (href.includes('http')) {
                        // En file://, las rutas http pueden no cargar
                        console.warn('Posible problema con ruta HTTP en file://:', href);
                        brokenLinks++;
                    }
                }
            });
            
            if (brokenLinks > 0) {
                console.warn(`Se detectaron ${brokenLinks} posibles problemas de rutas de ${checkedLinks} recursos verificados`);
            } else {
                console.log(`✅ Todos los recursos (${checkedLinks}) parecen cargar correctamente en file://`);
            }
        }, 1000); // Esperar 1 segundo a que carguen los recursos
    }
    
    return {
        isFileProtocol,
        hasIssues: brokenLinks > 0,
        checkedResources: checkedLinks,
        problematicResources: brokenLinks
    };
}

// Función para normalizar rutas para file://
function normalizePath(path) {
    if (!path) return path;
    
    // Si ya es una ruta absoluta o empieza con http, devolver tal cual
    if (path.startsWith('http') || path.startsWith('//')) {
        return path;
    }
    
    // Para file://, asegurarse de que las rutas sean relativas correctas
    if (window.location.protocol === 'file:') {
        // Eliminar barras iniciales duplicadas
        path = path.replace(/^\/+/, '');
        
        // Asegurar que no haya barras invertidas
        path = path.replace(/\\/g, '/');
        
        // Normalizar rutas relativas
        path = path.replace(/\/\//g, '/');
        
        // IMPORTANTE: En file://, no modificar rutas relativas existentes
        // Si ya contiene una estructura de carpetas, mantenerla
        if (path.includes('modules/') || path.includes('admin/')) {
            // Mantener la estructura existente
            console.log('📁 Manteniendo estructura de ruta:', path);
        }
    }
    
    return path;
}

// Función de navegación segura para file://
function safeNavigate(path) {
    if (!path) return;
    
    // Normalizar la ruta
    const normalizedPath = normalizePath(path);
    
    console.log('🧭 Navegando a:', normalizedPath);
    console.log('🌐 Protocolo actual:', window.location.protocol);
    
    // Para file://, verificar si la ruta es relativa y correcta
    if (window.location.protocol === 'file:') {
        // Construir la ruta completa para file:// si es necesario
        const currentPath = window.location.pathname;
        const currentDir = currentPath.substring(0, currentPath.lastIndexOf('/') + 1);
        
        let fullPath;
        if (normalizedPath.includes('://')) {
            // Ya es una ruta completa
            fullPath = normalizedPath;
        } else {
            // Es una ruta relativa, construirla desde el directorio actual
            fullPath = currentDir + normalizedPath;
        }
        
        console.log('📂 Ruta completa calculada:', fullPath);
        
        // Navegación directa
        window.location.href = normalizedPath;
    } else {
        // En servidor, navegar normalmente
        window.location.href = normalizedPath;
    }
}

// Función para verificar si un archivo existe (intenta cargarlo)
function checkFileExists(path, callback) {
    if (window.location.protocol !== 'file:') {
        // En servidor, usar una verificación simple
        callback(true);
        return;
    }
    
    // Para file://, intentar crear un elemento temporal
    const testElement = document.createElement('img');
    testElement.onerror = function() {
        callback(false);
    };
    testElement.onload = function() {
        callback(true);
    };
    testElement.src = path + '?t=' + Date.now(); // Evitar caché
}

// ========================================
// EXPORTAR FUNCIONES GLOBALMENTE
// ========================================

// Hacer funciones disponibles globalmente
if (typeof window !== 'undefined') {
    window.safeParse = safeParse;
    window.safeSave = safeSave;
    window.initSystem = initSystem;
    window.repairSystem = repairSystem;
    window.isModuleActive = isModuleActive;
    window.checkModuleAccess = checkModuleAccess;
    window.showMaintenanceMessage = showMaintenanceMessage;
    window.checkEnvironment = checkEnvironment;
    window.normalizePath = normalizePath;
    window.safeNavigate = safeNavigate;
    window.checkFileExists = checkFileExists;
}

// ========================================
// INICIALIZACIÓN AUTOMÁTICA
// ========================================

// INICIALIZACIÓN SIMPLE Y DIRECTA DE SYSTEMMODULES
// Solución garantizada para cualquier computadora
if(!localStorage.getItem("systemModules")){
    localStorage.setItem("systemModules", JSON.stringify({
        porteria: true,
        tesoreria: true,
        teachers: true,
        psychology: true,
        secretaria: true,
        orientacion: true,
        empresas: true,
        comedor: true,
        cafeteria: true,
        biblioteca: true
    }));
    console.log('✅ systemModules creado automáticamente');
} else {
    console.log('✅ systemModules ya existe');
}

// Inicializar sistema cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        initSystem();
        checkEnvironment();
    });
} else if (document.readyState === 'interactive' || document.readyState === 'complete') {
    // El DOM ya está listo
    initSystem();
    checkEnvironment();
}

console.log('📦 Sistema de inicialización cargado');
