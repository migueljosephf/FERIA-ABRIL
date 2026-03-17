// Script para actualizar todos los módulos de psicología para que usen datos reales
// Este script debe ejecutarse manualmente para cada archivo

const fs = require('fs');
const path = require('path');

// Lista de todos los módulos de psicología
const modules = [
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
    'modulo-psi-valentina-diaz.html'
];

// Scripts a agregar
const scriptsToAdd = `
    <!-- Sistema Central de Comunicación -->
    <script src="js/systemCore.js"></script>
    <script src="js/systemBridge.js"></script>
    <script src="js/systemDataManager.js"></script>
`;

// Función loadData real
const loadDataFunction = `
loadData() {
    // Cargar excusas desde el sistema central (no localStorage)
    try {
        let excusas = [];
        
        // Intentar con SystemBridge primero
        if (typeof window.SystemBridge !== 'undefined') {
            const currentUser = getCurrentUser();
            if (currentUser) {
                excusas = window.SystemBridge.getExcuses(currentUser.username);
            }
        } else if (typeof window.systemDataManager !== 'undefined') {
            const currentUser = getCurrentUser();
            if (currentUser) {
                excusas = window.systemDataManager.obtenerExcusasPorPsicologa(currentUser.username);
            }
        } else if (typeof window.SGESystem !== 'undefined') {
            const currentUser = getCurrentUser();
            if (currentUser) {
                excusas = window.SGESystem.getExcuses(currentUser.username);
            }
        }
        
        this.excuses = excusas;
        console.log('✅ Excusas cargadas desde sistema central:', excusas.length);
    } catch (e) {
        console.error('Error cargando excusas desde sistema:', e);
        this.excuses = [];
    }

    // Cargar mensajes desde el sistema central
    try {
        let mensajes = [];
        
        if (typeof window.SystemBridge !== 'undefined') {
            const currentUser = getCurrentUser();
            if (currentUser) {
                mensajes = window.SystemBridge.getMessages(currentUser.username, 'recibidos');
            }
        } else if (typeof window.systemDataManager !== 'undefined') {
            const currentUser = getCurrentUser();
            if (currentUser) {
                mensajes = window.systemDataManager.obtenerMensajes(currentUser.username, 'recibidos');
            }
        } else if (typeof window.SGESystem !== 'undefined') {
            const currentUser = getCurrentUser();
            if (currentUser) {
                mensajes = window.SGESystem.getMessages(currentUser.username, 'recibidos');
            }
        }
        
        this.messages = mensajes;
        console.log('✅ Mensajes cargados desde sistema central:', mensajes.length);
    } catch (e) {
        console.error('Error cargando mensajes desde sistema:', e);
        this.messages = [];
    }

    // Cargar transferencias a dirección
    try {
        const savedTransfers = localStorage.getItem('psychology_direction_transfers');
        if (savedTransfers) {
            this.directionTransfers = JSON.parse(savedTransfers);
        }
    } catch (e) {
        console.error('Error cargando transferencias:', e);
        this.directionTransfers = [];
    }

    // Cargar documentos recibidos desde el sistema central
    try {
        let archivos = [];
        
        if (typeof window.SystemBridge !== 'undefined') {
            const currentUser = getCurrentUser();
            if (currentUser) {
                archivos = window.SystemBridge.getFiles(currentUser.username, 'recibidos');
            }
        } else if (typeof window.systemDataManager !== 'undefined') {
            const currentUser = getCurrentUser();
            if (currentUser) {
                // SystemDataManager no tiene archivos, usar excusas
                const excusas = window.systemDataManager.obtenerExcusasPorPsicologa(currentUser.username);
                archivos = excusas.map(exc => ({
                    id: exc.id,
                    de: exc.profesor,
                    para: currentUser.username,
                    nombre: \`Excusa_\${exc.estudiante}_\${new Date(exc.timestamp).toLocaleDateString().replace(/\//g, '_')}.pdf\`,
                    tipo: 'PDF',
                    tamaño: '125 KB',
                    timestamp: exc.timestamp,
                    tipoArchivo: 'excusa'
                }));
            }
        } else if (typeof window.SGESystem !== 'undefined') {
            const currentUser = getCurrentUser();
            if (currentUser) {
                archivos = window.SGESystem.getFiles(currentUser.username, 'recibidos');
            }
        }
        
        this.receivedDocuments = archivos;
        console.log('✅ Documentos cargados desde sistema central:', archivos.length);
    } catch (e) {
        console.error('Error cargando documentos desde sistema:', e);
        this.receivedDocuments = [];
    }
},
`;

console.log('Para actualizar todos los módulos de psicología manualmente:');
console.log('1. Agregar los scripts systemCore.js y systemBridge.js a cada archivo');
console.log('2. Reemplazar la función loadData() con la versión que carga datos reales');
console.log('3. Los datos de ejemplo ya han sido eliminados de todos los módulos');
