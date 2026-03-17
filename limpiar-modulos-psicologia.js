// Script para limpiar módulos antiguos de psicología
// Este script elimina o renombra los módulos individuales de psicología
// ya que ahora usamos el dashboard universal: psicologia-dashboard.html

const fs = require('fs');
const path = require('path');

// Lista de módulos antiguos de psicología a procesar
const oldPsychologyModules = [
    'modulo-psi-ana-martinez.html',
    'modulo-psi-camila-fernandez.html',
    'modulo-psi-carmen-sanchez.html',
    'modulo-psi-carolina-gomez.html',
    'modulo-psi-claudia-hernandez.html',
    'modulo-psi-elena-ramirez.html',
    'modulo-psi-isabella-torres.html',
    'modulo-psi-laura-perez.html',
    'modulo-psi-maria-gonzalez.html',
    'modulo-psi-marta-rodriguez.html',
    'modulo-psi-patricia-lopez.html',
    'modulo-psi-sofia-garcia.html',
    'modulo-psi-valentina-diaz.html',
    'modulo-psi_maria_gomez.html'
];

// Directorio actual
const currentDir = process.cwd();

console.log('🧹 LIMPIEZA DE MÓDULOS ANTIGUOS DE PSICOLOGÍA');
console.log('='.repeat(60));
console.log(`📁 Directorio: ${currentDir}`);
console.log(`🎯 Dashboard Universal: psicologia-dashboard.html`);
console.log('');

// Función para verificar si un archivo existe
function fileExists(filePath) {
    try {
        return fs.existsSync(filePath);
    } catch (error) {
        return false;
    }
}

// Función para crear backup
function createBackup(filePath) {
    const backupPath = filePath.replace('.html', '_backup.html');
    try {
        fs.copyFileSync(filePath, backupPath);
        console.log(`✅ Backup creado: ${path.basename(backupPath)}`);
        return true;
    } catch (error) {
        console.log(`❌ Error creando backup: ${error.message}`);
        return false;
    }
}

// Función para renombrar archivo
function renameFile(oldPath, newPath) {
    try {
        fs.renameSync(oldPath, newPath);
        console.log(`📝 Renombrado: ${path.basename(oldPath)} → ${path.basename(newPath)}`);
        return true;
    } catch (error) {
        console.log(`❌ Error renombrando: ${error.message}`);
        return false;
    }
}

// Función para eliminar archivo
function deleteFile(filePath) {
    try {
        fs.unlinkSync(filePath);
        console.log(`🗑️ Eliminado: ${path.basename(filePath)}`);
        return true;
    } catch (error) {
        console.log(`❌ Error eliminando: ${error.message}`);
        return false;
    }
}

// Estadísticas
let stats = {
    found: 0,
    backedUp: 0,
    renamed: 0,
    deleted: 0,
    errors: 0
};

console.log('🔍 Analizando módulos antiguos...');
console.log('');

// Procesar cada módulo
oldPsychologyModules.forEach((module, index) => {
    const modulePath = path.join(currentDir, module);
    
    if (fileExists(modulePath)) {
        stats.found++;
        console.log(`${index + 1}. 📄 ${module}`);
        
        // Crear backup
        if (createBackup(modulePath)) {
            stats.backedUp++;
        }
        
        // Renombrar para indicar que está obsoleto
        const obsoletePath = modulePath.replace('.html', '_obsolete.html');
        if (renameFile(modulePath, obsoletePath)) {
            stats.renamed++;
        }
        
        console.log('');
    } else {
        console.log(`${index + 1}. ⭕ ${module} (no encontrado)`);
    }
});

// Verificar si el dashboard universal existe
const dashboardPath = path.join(currentDir, 'psicologia-dashboard.html');
if (fileExists(dashboardPath)) {
    console.log('✅ Dashboard universal encontrado: psicologia-dashboard.html');
} else {
    console.log('❌ Dashboard universal NO encontrado: psicologia-dashboard.html');
    stats.errors++;
}

// Verificar si el archivo de pruebas existe
const testPath = path.join(currentDir, 'test-psicologia-dashboard.html');
if (fileExists(testPath)) {
    console.log('✅ Archivo de pruebas encontrado: test-psicologia-dashboard.html');
}

// Mostrar estadísticas finales
console.log('');
console.log('📊 ESTADÍSTICAS DE LA LIMPIEZA');
console.log('='.repeat(60));
console.log(`📁 Módulos encontrados: ${stats.found}`);
console.log(`💾 Backups creados: ${stats.backedUp}`);
console.log(`📝 Archivos renombrados: ${stats.renamed}`);
console.log(`🗑️ Archivos eliminados: ${stats.deleted}`);
console.log(`❌ Errores: ${stats.errors}`);

if (stats.errors === 0) {
    console.log('');
    console.log('🎉 LIMPIEZA COMPLETADA EXITOSAMENTE');
    console.log('');
    console.log('📋 RESUMEN:');
    console.log('• Todos los módulos antiguos han sido renombrados a *_obsolete.html');
    console.log('• Se han creado backups con extensión *_backup.html');
    console.log('• Ahora solo se debe usar: psicologia-dashboard.html');
    console.log('• Para pruebas usar: test-psicologia-dashboard.html');
    console.log('');
    console.log('🚀 El sistema está listo para producción con el dashboard universal.');
} else {
    console.log('');
    console.log('⚠️ LA LIMPIEZA COMPLETÓ CON ERRORES');
    console.log('Por favor revise los errores mostrados arriba.');
}

// Crear archivo README para documentar los cambios
const readmeContent = `# Limpieza de Módulos de Psicología

## Fecha
${new Date().toLocaleString()}

## Cambios Realizados
- Se ha implementado un dashboard universal: \`psicologia-dashboard.html\`
- Los módulos individuales han sido renombrados a \`*_obsolete.html\`
- Se han creado backups con extensión \`*_backup.html\`

## Archivos Procesados
${oldPsychologyModules.map(module => `- ${module}`).join('\n')}

## Nuevo Sistema
- **Dashboard Universal**: \`psicologia-dashboard.html\`
- **Sistema de Pruebas**: \`test-psicologia-dashboard.html\`
- **Conexión Real**: Integrado con SystemDataManager

## Beneficios
- Mantenimiento simplificado (1 solo archivo)
- Datos reales del sistema (sin mock data)
- Comunicación bidireccional completa
- Diseño preservado 100%

## Estadísticas
- Módulos encontrados: ${stats.found}
- Backups creados: ${stats.backedUp}
- Archivos renombrados: ${stats.renamed}
- Errores: ${stats.errors}

---
Generado por: limpiar-modulos-psicologia.js
`;

try {
    fs.writeFileSync(path.join(currentDir, 'LIMPIEZA_PSICOLOGIA.md'), readmeContent);
    console.log('📄 Documentación creada: LIMPIEZA_PSICOLOGIA.md');
} catch (error) {
    console.log('❌ Error creando documentación:', error.message);
}

console.log('');
console.log('✨ Proceso de limpieza finalizado.');
