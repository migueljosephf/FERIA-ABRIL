/**
 * Sistema Central de Usuarios - SGE
 * Contiene todas las listas de usuarios del sistema para mantener consistencia
 */

class SystemUsers {
    constructor() {
        this.initializeUsers();
    }

    /**
     * Inicializar las listas de usuarios
     */
    initializeUsers() {
        // Lista completa de docentes del sistema
        this.docentes = [
            { username: 'prof_starling', name: 'Starling Encarnación', initials: 'SE' },
            { username: 'prof_belkis', name: 'Belkis Batista', initials: 'BB' },
            { username: 'prof_marlenis', name: 'Marlenis', initials: 'MA' },
            { username: 'prof_magdalena', name: 'Magdalena', initials: 'MG' },
            { username: 'prof_pamela', name: 'Pamela', initials: 'PA' },
            { username: 'prof_angela', name: 'Angela Frias', initials: 'AF' },
            { username: 'prof_yorkidia', name: 'Yorkidida Rudecindo', initials: 'YR' },
            { username: 'prof_jaime', name: 'Jaime', initials: 'JM' },
            { username: 'prof_beriguete', name: 'Beriguete', initials: 'BE' },
            { username: 'prof_benito', name: 'Benito', initials: 'BN' },
            { username: 'prof_elizabeth', name: 'Elizabeth', initials: 'EL' },
            { username: 'prof_adrian', name: 'Adrian', initials: 'AD' },
            { username: 'prof_ramon', name: 'Ramon', initials: 'RM' },
            { username: 'prof_ruth', name: 'Ruth', initials: 'RT' },
            { username: 'r_ledesma', name: 'Prof. Raymond Ledesma', initials: 'RL' },
            { username: 'Emmanuel', name: 'Emmanuel', initials: 'EM' },
            { username: 'Ledesma', name: 'Ledesma', initials: 'LE' }
        ];

        // Lista completa de psicólogas del sistema
        this.psicologas = [
            { username: 'psi_marta_rodriguez', name: 'Dra. Marta Rodríguez', initials: 'MR' },
            { username: 'psi_carolina_gomez', name: 'Dra. Carolina Gómez', initials: 'CG' },
            { username: 'psi_ana_martinez', name: 'Dra. Ana Martínez', initials: 'AM' },
            { username: 'psi_laura_perez', name: 'Dra. Laura Pérez', initials: 'LP' },
            { username: 'psi_claudia_hernandez', name: 'Dra. Claudia Hernández', initials: 'CH' },
            { username: 'psi_patricia_lopez', name: 'Dra. Patricia López', initials: 'PL' },
            { username: 'psi_sofia_garcia', name: 'Dra. Sofía García', initials: 'SG' },
            { username: 'psi_valentina_diaz', name: 'Dra. Valentina Díaz', initials: 'VD' },
            { username: 'psi_camila_fernandez', name: 'Dra. Camila Fernández', initials: 'CF' },
            { username: 'psi_isabella_torres', name: 'Dra. Isabella Torres', initials: 'IT' },
            { username: 'psi_maria_gonzalez', name: 'Dra. María González', initials: 'MG' },
            { username: 'psi_elena_ramirez', name: 'Dra. Elena Ramírez', initials: 'ER' },
            { username: 'psi_carmen_sanchez', name: 'Dra. Carmen Sánchez', initials: 'CS' },
            { username: 'psi_ana_perez', name: 'Dra. Ana Pérez', initials: 'AP' },
            { username: 'psi_carla_lopez', name: 'Dra. Carla López', initials: 'CL' },
            { username: 'psi_luisa_martinez', name: 'Dra. Luisa Martínez', initials: 'LM' },
            { username: 'psi_andrea_diaz', name: 'Dra. Andrea Díaz', initials: 'AD' },
            { username: 'psi_maria_gomez', name: 'Dra. María Gómez', initials: 'MG' }
        ];

        // Lista de personal administrativo
        this.administrativos = [
            { username: 'admin', name: 'Administrador Principal', initials: 'AP' },
            { username: 'admin123', name: 'Administrador Sistema', initials: 'AS' },
            { username: 'direccion', name: 'Director General', initials: 'DG' }
        ];

        // Lista de personal de servicios
        this.servicios = [
            { username: 'enfermeria', name: 'Enfermería', initials: 'EF' },
            { username: 'odontologia', name: 'Dr. Odontólogo', initials: 'DO' },
            { username: 'admin_cafe', name: 'Administrador Cafetería', initials: 'AC' },
            { username: 'papeleria', name: 'Encargado de Papelería', initials: 'EP' },
            { username: 'comedor', name: 'Servicio de Comedor', initials: 'SC' },
            { username: 'cajero_cafeteria', name: 'Cajero Cafetería', initials: 'CC' }
        ];
    }

    /**
     * Obtener todos los docentes
     */
    getDocentes() {
        return this.docentes;
    }

    /**
     * Obtener todos los docentes como opciones para select
     */
    getDocentesOptions() {
        return this.docentes.map(docente => ({
            value: docente.username,
            text: docente.name,
            initials: docente.initials
        }));
    }

    /**
     * Obtener todas las psicólogas
     */
    getPsicologas() {
        return this.psicologas;
    }

    /**
     * Obtener todas las psicólogas como opciones para select
     */
    getPsicologasOptions() {
        return this.psicologas.map(psicologa => ({
            value: psicologa.username,
            text: psicologa.name,
            initials: psicologa.initials
        }));
    }

    /**
     * Obtener todos los administrativos
     */
    getAdministrativos() {
        return this.administrativos;
    }

    /**
     * Obtener todo el personal de servicios
     */
    getServicios() {
        return this.servicios;
    }

    /**
     * Buscar usuario por username
     */
    findUserByUsername(username) {
        const allUsers = [
            ...this.docentes,
            ...this.psicologas,
            ...this.administrativos,
            ...this.servicios
        ];

        return allUsers.find(user => user.username === username);
    }

    /**
     * Obtener nombre completo de usuario
     */
    getUserName(username) {
        const user = this.findUserByUsername(username);
        return user ? user.name : 'Usuario Desconocido';
    }

    /**
     * Obtener iniciales de usuario
     */
    getUserInitials(username) {
        const user = this.findUserByUsername(username);
        return user ? user.initials : 'UD';
    }

    /**
     * Generar HTML para select de docentes
     */
    generateDocentesSelect(selectedUsername = '') {
        let options = '<option value="">Seleccionar profesor...</option>';
        
        this.docentes.forEach(docente => {
            const selected = docente.username === selectedUsername ? 'selected' : '';
            options += `<option value="${docente.username}" ${selected}>${docente.name}</option>`;
        });
        
        return options;
    }

    /**
     * Generar HTML para select de psicólogas
     */
    generatePsicologasSelect(selectedUsername = '') {
        let options = '<option value="">Seleccionar psicóloga...</option>';
        
        this.psicologas.forEach(psicologa => {
            const selected = psicologa.username === selectedUsername ? 'selected' : '';
            options += `<option value="${psicologa.username}" ${selected}>${psicologa.name}</option>`;
        });
        
        return options;
    }

    /**
     * Generar grid de docentes para interfaz
     */
    generateDocentesGrid() {
        let grid = '';
        
        this.docentes.forEach(docente => {
            grid += `
                <div class="teacher-item" data-username="${docente.username}" onclick="selectTeacher('${docente.username}')">
                    <div class="teacher-avatar-large">${docente.initials}</div>
                    <div class="teacher-details">
                        <h4>${docente.name}</h4>
                        <p>Username: ${docente.username}</p>
                    </div>
                </div>
            `;
        });
        
        return grid;
    }

    /**
     * Generar lista de usuarios para comunicación
     */
    generateUsersList(tipo = 'todos') {
        let users = [];
        
        switch(tipo) {
            case 'docentes':
                users = this.docentes;
                break;
            case 'psicologas':
                users = this.psicologas;
                break;
            case 'administrativos':
                users = this.administrativos;
                break;
            case 'servicios':
                users = this.servicios;
                break;
            default:
                users = [...this.docentes, ...this.psicologas, ...this.administrativos];
        }
        
        let list = '';
        users.forEach(user => {
            list += `
                <div class="user-item" data-username="${user.username}">
                    <div class="user-avatar-small">${user.initials}</div>
                    <div class="user-info-small">
                        <strong>${user.name}</strong>
                        <small>${user.username}</small>
                    </div>
                </div>
            `;
        });
        
        return list;
    }

    /**
     * Validar si un usuario existe
     */
    userExists(username) {
        return this.findUserByUsername(username) !== undefined;
    }

    /**
     * Obtener usuarios por rol
     */
    getUsersByRole(role) {
        switch(role) {
            case 'docente':
                return this.docentes;
            case 'psicologa':
            case 'psicologia':
                return this.psicologas;
            case 'administrador':
            case 'admin':
            case 'direccion':
                return this.administrativos;
            default:
                return [];
        }
    }

    /**
     * Buscar usuarios por nombre
     */
    searchUsers(query, tipo = 'todos') {
        const users = this.getUsersByRole(tipo);
        const lowercaseQuery = query.toLowerCase();
        
        return users.filter(user => 
            user.name.toLowerCase().includes(lowercaseQuery) ||
            user.username.toLowerCase().includes(lowercaseQuery)
        );
    }

    /**
     * Estadísticas del sistema
     */
    getStats() {
        return {
            totalDocentes: this.docentes.length,
            totalPsicologas: this.psicologas.length,
            totalAdministrativos: this.administrativos.length,
            totalServicios: this.servicios.length,
            totalUsuarios: this.docentes.length + this.psicologas.length + this.administrativos.length + this.servicios.length
        };
    }
}

// Instancia global del sistema de usuarios
window.systemUsers = new SystemUsers();

// Funciones globales para compatibilidad
window.getDocentesOptions = () => window.systemUsers.getDocentesOptions();
window.getPsicologasOptions = () => window.systemUsers.getPsicologasOptions();
window.generateDocentesSelect = (selected) => window.systemUsers.generateDocentesSelect(selected);
window.generatePsicologasSelect = (selected) => window.systemUsers.generatePsicologasSelect(selected);
window.findUserByUsername = (username) => window.systemUsers.findUserByUsername(username);
window.getUserName = (username) => window.systemUsers.getUserName(username);

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SystemUsers;
}
