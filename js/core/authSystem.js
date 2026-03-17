// Sistema centralizado de roles para el SGE.
// No reemplaza el sistema actual de index.html; sirve como referencia unificada.

(function (global) {
    const NAMESPACE = 'SGECore';

    const ROLES = {
        DOCENTE: 'docente',
        PSICOLOGIA: 'psicologia',
        ENFERMERIA: 'enfermeria',
        CAFETERIA: 'cafeteria',
        COMEDOR: 'comedor',
        ODONTOLOGIA: 'odontologia',
        DIRECTOR: 'director'
    };

    const ROLE_LABELS = {
        [ROLES.DOCENTE]: 'Docente',
        [ROLES.PSICOLOGIA]: 'Psicología',
        [ROLES.ENFERMERIA]: 'Enfermería',
        [ROLES.CAFETERIA]: 'Cafetería',
        [ROLES.COMEDOR]: 'Comedor',
        [ROLES.ODONTOLOGIA]: 'Odontología',
        [ROLES.DIRECTOR]: 'Dirección'
    };

    const PERMISSIONS = {
        [ROLES.DOCENTE]: [
            'enviar_asistencia',
            'enviar_caso_psicologia',
            'enviar_alerta_medica'
        ],
        [ROLES.PSICOLOGIA]: [
            'ver_casos_psicologia',
            'enviar_reporte_direccion',
            'responder_docente'
        ],
        [ROLES.ENFERMERIA]: [
            'ver_alertas_medicas',
            'enviar_reporte_direccion'
        ],
        [ROLES.CAFETERIA]: [
            'registrar_venta_cafeteria',
            'ver_reportes_cafeteria'
        ],
        [ROLES.COMEDOR]: [
            'ver_asistencia',
            'registrar_servicio_comedor'
        ],
        [ROLES.ODONTOLOGIA]: [
            'registrar_cita_odontologia',
            'enviar_reporte_direccion'
        ],
        [ROLES.DIRECTOR]: [
            'ver_todo',
            'modificar_registros',
            'ver_dashboard_direccion'
        ]
    };

    const authSystem = {
        ROLES: ROLES,

        getRoles() {
            return Object.values(ROLES);
        },

        getRoleLabel(role) {
            return ROLE_LABELS[role] || role || '';
        },

        hasPermission(role, permission) {
            if (!role || !permission) return false;
            if (role === ROLES.DIRECTOR) return true;
            const list = PERMISSIONS[role] || [];
            return list.indexOf(permission) !== -1;
        },

        isDirector(role) {
            return role === ROLES.DIRECTOR;
        }
    };

    const root = global || (typeof window !== 'undefined' ? window : {});
    root[NAMESPACE] = root[NAMESPACE] || {};
    root[NAMESPACE].authSystem = authSystem;

})(typeof window !== 'undefined' ? window : this);

