// js/core/router.js
/**
 * ISP Manager Pro - SPA Router Module
 * Gerencia navegação entre páginas sem recarregar
 */

const Router = {
    routes: {},
    currentPage: null,

    /**
     * Registra uma rota
     * @param {string} path - Caminho da página
     * @param {Function} handler - Função que renderiza a página
     * @param {Object} options - Opções (requiresAuth, minRole, etc)
     */
    register(path, handler, options = {}) {
        this.routes[path] = { handler, options };
    },

    /**
     * Navega para uma página
     * @param {string} path 
     * @param {Object} params - Parâmetros da URL
     */
    navigate(path, params = {}) {
        const user = Auth.checkSession();
        
        // Verifica autenticação
        if (!user && path !== 'dashboard') {
            window.location.href = 'index.html';
            return;
        }

        const route = this.routes[path];
        
        if (!route) {
            console.error(`Rota não encontrada: ${path}`);
            this.navigate('dashboard');
            return;
        }

        // Verifica permissões
        if (route.options.minRole && user) {
            const userLevel = Permissions.getRoleLevel(user.role);
            const requiredLevel = Permissions.getRoleLevel(route.options.minRole);
            
            if (userLevel < requiredLevel && user.role !== 'SuperUser') {
                this.showError('Acesso negado. Você não tem permissão para acessar esta página.');
                return;
            }
        }

        // Atualiza histórico
        history.pushState({ path, params }, '', `#${path}`);
        
        // Renderiza página
        this.currentPage = path;
        route.handler(params);
        
        // Atualiza sidebar
        if (window.Sidebar) {
            Sidebar.setActive(path);
        }
        
        // Notifica sistema
        document.dispatchEvent(new CustomEvent('pagechange', { detail: { path, params } }));
    },

    /**
     * Volta à página anterior
     */
    back() {
        history.back();
    },

    /**
     * Mostra erro de acesso
     * @param {string} message 
     */
    showError(message) {
        const content = document.getElementById('app-content');
        if (content) {
            content.innerHTML = `
                <div class="flex items-center justify-center min-h-[60vh]">
                    <div class="text-center">
                        <i class="fas fa-lock text-6xl text-red-500 mb-4"></i>
                        <h2 class="text-2xl font-bold text-gray-300 mb-2">Acesso Negado</h2>
                        <p class="text-gray-500 mb-4">${message}</p>
                        <button onclick="Router.back()" 
                            class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors">
                            <i class="fas fa-arrow-left mr-2"></i>Voltar
                        </button>
                    </div>
                </div>
            `;
        }
    },

    /**
     * Inicializa o router baseado na URL atual
     */
    init() {
        const hash = window.location.hash.slice(1) || 'dashboard';
        
        // Handle browser back/forward
        window.addEventListener('popstate', (e) => {
            if (e.state) {
                const route = this.routes[e.state.path];
                if (route) {
                    this.currentPage = e.state.path;
                    route.handler(e.state.params);
                    if (window.Sidebar) Sidebar.setActive(e.state.path);
                }
            }
        });

        this.navigate(hash);
    },

    /**
     * Retorna parâmetros atuais
     */
    getCurrentParams() {
        const currentState = history.state;
        return currentState ? currentState.params : {};
    }
};
</script>
