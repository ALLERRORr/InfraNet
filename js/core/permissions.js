// js/core/permissions.js
/**
 * ISP Manager Pro - Permissions Module
 * Define matriz de permissões por role e módulo
 */

const Permissions = {
    // Hierarquia de roles (maior número = mais permissão)
    roleHierarchy: {
        'TI': 1,
        'Marketing': 2,
        'Comercial': 3,
        'Financeiro': 4,
        'Suporte': 5,
        'Analista': 6,
        'Supervisor': 7,
        'Diretoria': 8,
        'CEO': 9,
        'SuperUser': 10
    },

    // Permissões por módulo
    modulePermissions: {
        'dashboard': { minRole: 'TI', description: 'Acesso ao dashboard' },
        'clientes': { minRole: 'Comercial', description: 'Gestão de clientes' },
        'funil': { minRole: 'Comercial', description: 'Funil comercial/CRM' },
        'contratos': { minRole: 'Comercial', description: 'Gestão de contratos' },
        'ordens-servico': { minRole: 'Suporte', description: 'Ordens de serviço' },
        'financeiro': { minRole: 'Financeiro', description: 'Módulo financeiro' },
        'chat-interno': { minRole: 'TI', description: 'Chat interno' },
        'chat-externo': { minRole: 'Suporte', description: 'Atendimento ao cliente' },
        'mikrotik': { minRole: 'TI', description: 'Painel MikroTik' },
        'olts': { minRole: 'TI', description: 'Painel OLTs' },
        'inframaps': { minRole: 'TI', description: 'Mapa de infraestrutura' },
        'monitoramento': { minRole: 'TI', description: 'Monitoramento de rede' },
        'nvoip': { minRole: 'Suporte', description: 'Telefonia VoIP' },
        'email': { minRole: 'Marketing', description: 'E-mail marketing' },
        'relatorios': { minRole: 'Analista', description: 'Relatórios' },
        'admin': { minRole: 'SuperUser', description: 'Administração do sistema' }
    },

    /**
     * Verifica se usuário tem acesso ao módulo
     * @param {string} moduleName - Nome do módulo
     * @param {Object} user - Usuário logado
     * @returns {boolean}
     */
    canAccess(moduleName, user) {
        if (!user || !this.modulePermissions[moduleName]) return false;
        
        const requiredLevel = this.roleHierarchy[this.modulePermissions[moduleName].minRole];
        const userLevel = this.roleHierarchy[user.role];
        
        // SuperUser tem acesso a tudo
        if (user.role === 'SuperUser') return true;
        
        return userLevel >= requiredLevel;
    },

    /**
     * Retorna lista de módulos acessíveis para um usuário
     * @param {Object} user 
     * @returns {Array<string>}
     */
    getAccessibleModules(user) {
        if (!user) return [];
        
        return Object.keys(this.modulePermissions).filter(module => 
            this.canAccess(module, user)
        );
    },

    /**
     * Verifica se usuário pode executar ação específica
     * @param {string} action - Ação (criar, editar, excluir, aprovar)
     * @param {string} resource - Recurso (cliente, contrato, os, etc)
     * @param {Object} user 
     * @returns {boolean}
     */
    canPerformAction(action, resource, user) {
        if (!user) return false;
        
        const userLevel = this.roleHierarchy[user.role];
        
        // Regras específicas
        if (action === 'excluir' && userLevel < 7) return false; // Apenas Supervisor+
        if (action === 'aprovar' && userLevel < 7) return false; // Apenas Supervisor+
        if (action === 'cancelar_contrato' && userLevel < 7) return false;
        if (action === 'bloquear_cliente' && userLevel < 4) return false; // Financeiro+
        if (action === 'liberar_conexao_manual' && userLevel < 10) return false; // Apenas SuperUser
        
        return true;
    },

    /**
     * Retorna nível do role como número
     * @param {string} roleName 
     * @returns {number}
     */
    getRoleLevel(roleName) {
        return this.roleHierarchy[roleName] || 0;
    }
};
</script>
