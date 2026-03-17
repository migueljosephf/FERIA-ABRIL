/**
 * SISTEMA DE VERIFICACIÓN DE MÓDULOS
 * Archivo: module-checker.js
 * Descripción: Script para verificar el estado de módulos en todos los dashboards
 */

// Función para verificar si un módulo está activo
function checkModuleStatus(moduleName) {
    try {
        const modules = JSON.parse(localStorage.getItem('systemModules') || '{}');
        return modules[moduleName] !== false; // Por defecto es true si no existe
    } catch (error) {
        console.error('Error al verificar estado del módulo:', error);
        return true; // Por defecto activo si hay error
    }
}

// Función para mostrar mensaje de mantenimiento
function showMaintenanceMessage() {
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
                    Este módulo se encuentra temporalmente en mantenimiento.<br>
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

// Función principal de verificación
function verifyModuleAccess(moduleName) {
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
            'enfermeria.html': 'enfermeria'
        };
        
        moduleName = moduleMapping[filename] || 'unknown';
    }
    
    // Verificar si el módulo está activo
    const isActive = checkModuleStatus(moduleName);
    
    if (!isActive) {
        console.log(`Módulo ${moduleName} está inactivo, mostrando mensaje de mantenimiento`);
        showMaintenanceMessage();
        return false;
    }
    
    console.log(`Módulo ${moduleName} está activo, acceso permitido`);
    return true;
}

// Función para registrar eventos del módulo
function logModuleEvent(eventType, moduleName = null) {
    try {
        if (!moduleName) {
            const path = window.location.pathname;
            const filename = path.split('/').pop();
            moduleName = filename || 'unknown';
        }
        
        // Obtener logs existentes
        const logs = JSON.parse(localStorage.getItem('systemLogs') || '[]');
        
        const logEntry = {
            time: new Date().toTimeString().split(' ')[0],
            message: `${eventType}: ${moduleName}`,
            type: 'module',
            timestamp: Date.now(),
            date: new Date().toISOString()
        };
        
        logs.unshift(logEntry);
        
        // Mantener solo los últimos 200 logs
        if (logs.length > 200) {
            logs.splice(200);
        }
        
        localStorage.setItem('systemLogs', JSON.stringify(logs));
        
    } catch (error) {
        console.error('Error al registrar evento del módulo:', error);
    }
}

// Inicialización automática
document.addEventListener('DOMContentLoaded', function() {
    // Esperar un poco para que cargue todo el contenido
    setTimeout(() => {
        const hasAccess = verifyModuleAccess();
        
        if (hasAccess) {
            // Registrar acceso exitoso
            logModuleEvent('module access');
            
            // Configurar verificación periódica
            setInterval(() => {
                const stillActive = verifyModuleAccess();
                if (!stillActive) {
                    logModuleEvent('module deactivated');
                }
            }, 30000); // Verificar cada 30 segundos
        }
    }, 100);
});

// Exportar funciones para uso global
window.moduleChecker = {
    checkModuleStatus,
    showMaintenanceMessage,
    verifyModuleAccess,
    logModuleEvent
};
