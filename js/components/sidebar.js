// js/components/sidebar.js
/**
 * ISP Manager Pro - Sidebar Component
 * Menu lateral dinâmico baseado em permissões
 */

const Sidebar = {
    menuItems: [
        { id: 'dashboard', label: 'Dashboard', icon: 'fa-chart-line', category: 'principal' },
        { id: 'funil', label: 'Funil Comercial', icon: 'fa-filter', category: 'comercial', page: 'pages/comercial/funil.html' },
        { id: 'clientes', label: 'Clientes', icon: 'fa-users', category: 'comercial' },
        { id: 'contratos', label: 'Contratos', icon: 'fa-file-signature', category: 'comercial' },
        { id: 'ordens-servico', label: 'Ordens de Serviço', icon: 'fa-clipboard-check', category: 'operacional' },
        { id: 'suporte', label: 'Central Suporte', icon: 'fa-headset', category: 'operacional', page: 'pages/suporte/chamados.html' },
        { id: 'financeiro', label: 'Financeiro', icon: 'fa-dollar-sign', category: 'financeiro' },
        { id: 'chat-externo', label: 'Atendimento', icon: 'fa-comments', category: 'operacional' },
        { id: 'chat-interno', label: 'Chat Interno', icon: 'fa-message', category: 'interno' },
        { id: 'nvoip', label: 'Telefonia VoIP', icon: 'fa-phone-volume', category: 'operacional' },
        { id: 'camera', label: 'Câmera', icon: 'fa-camera', category: 'operacional', mobileOnly: true },
        { id: 'email', label: 'E-mail', icon: 'fa-envelope', category: 'marketing' },
        { id: 'monitoramento', label: 'Monitoramento', icon: 'fa-network-wired', category: 'ti' },
        { id: 'mikrotik', label: 'MikroTik', icon: 'fa-server', category: 'ti' },
        { id: 'olts', label: 'OLTs', icon: 'fa-broadcast-tower', category: 'ti' },
        { id: 'inframaps', label: 'InfraMaps', icon: 'fa-map-marked-alt', category: 'ti' },
        { id: 'relatorios', label: 'Relatórios', icon: 'fa-chart-bar', category: 'analise' },
        { id: 'admin', label: 'Administração', icon: 'fa-cogs', category: 'admin' }
    ],

    favorites: [],

    /**
     * Inicializa a sidebar
     */
    init() {
        this.loadFavorites();
        this.render();
        this.setupEventListeners();
    },

    /**
     * Carrega favoritos do localStorage
     */
    loadFavorites() {
        const saved = localStorage.getItem('isp_sidebar_favorites');
        this.favorites = saved ? JSON.parse(saved) : ['dashboard', 'clientes', 'ordens-servico'];
    },

    /**
     * Salva favoritos
     */
    saveFavorites() {
        localStorage.setItem('isp_sidebar_favorites', JSON.stringify(this.favorites));
    },

    /**
     * Renderiza a sidebar
     */
    render() {
        const user = Auth.checkSession();
        if (!user) return;

        const container = document.getElementById('sidebar-menu');
        if (!container) return;

        // Filtra itens por permissão
        const accessibleItems = this.menuItems.filter(item => 
            Permissions.canAccess(item.id, user)
        );

        // Agrupa por categoria
        const categories = {};
        accessibleItems.forEach(item => {
            if (!categories[item.category]) {
                categories[item.category] = [];
            }
            categories[item.category].push(item);
        });

        // Constroi HTML
        let html = '';

        // Favoritos
        const favoriteItems = accessibleItems.filter(item => this.favorites.includes(item.id));
        if (favoriteItems.length > 0) {
            html += `
                <div class="mb-6">
                    <div class="flex items-center gap-2 px-4 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        <i class="fas fa-star text-yellow-500"></i>
                        <span>Favoritos</span>
                    </div>
                    <nav class="space-y-1">
                        ${favoriteItems.map(item => this.renderMenuItem(item, true)).join('')}
                    </nav>
                </div>
            `;
        }

        // Categorias
        const categoryNames = {
            'principal': 'Principal',
            'comercial': 'Comercial',
            'operacional': 'Operacional',
            'financeiro': 'Financeiro',
            'interno': 'Interno',
            'marketing': 'Marketing',
            'ti': 'Infraestrutura',
            'analise': 'Análise',
            'admin': 'Administração'
        };

        Object.keys(categories).forEach(category => {
            if (categories[category].length > 0) {
                html += `
                    <div class="mb-6">
                        <div class="flex items-center gap-2 px-4 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            <span>${categoryNames[category] || category}</span>
                        </div>
                        <nav class="space-y-1">
                            ${categories[category].map(item => this.renderMenuItem(item, false)).join('')}
                        </nav>
                    </div>
                `;
            }
        });

        container.innerHTML = html;
    },

    /**
     * Renderiza item do menu
     */
    renderMenuItem(item, isFavorite) {
        const isFav = this.favorites.includes(item.id);
        return `
            <a href="#${item.id}" 
               data-page="${item.id}"
               class="sidebar-item group flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 
                      hover:bg-gray-700/50 hover:text-white text-gray-300"
               ondblclick="Sidebar.toggleFavorite('${item.id}', event)"
               onclick="event.preventDefault(); Router.navigate('${item.id}');">
                <i class="fas ${item.icon} w-5 h-5 flex items-center justify-center transition-colors group-hover:text-blue-400"></i>
                <span class="flex-1">${item.label}</span>
                ${isFav ? '<i class="fas fa-star text-yellow-500 text-xs"></i>' : ''}
            </a>
        `;
    },

    /**
     * Toggle favorito com double-click
     */
    toggleFavorite(itemId, event) {
        event.preventDefault();
        event.stopPropagation();
        
        const index = this.favorites.indexOf(itemId);
        if (index > -1) {
            this.favorites.splice(index, 1);
            Toast.show(`${this.menuItems.find(i => i.id === itemId)?.label} removido dos favoritos`, 'info');
        } else {
            this.favorites.push(itemId);
            Toast.show(`${this.menuItems.find(i => i.id === itemId)?.label} adicionado aos favoritos`, 'success');
        }
        
        this.saveFavorites();
        this.render();
    },

    /**
     * Marca item como ativo
     */
    setActive(pageId) {
        document.querySelectorAll('.sidebar-item').forEach(item => {
            item.classList.remove('bg-blue-600', 'text-white');
            item.classList.add('text-gray-300');
            
            if (item.dataset.page === pageId) {
                item.classList.remove('text-gray-300');
                item.classList.add('bg-blue-600', 'text-white');
            }
        });
    },

    /**
     * Setup de event listeners
     */
    setupEventListeners() {
        // Busca global (Ctrl+K)
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.openSearch();
            }
        });
    },

    /**
     * Abre modal de busca
     */
    openSearch() {
        const modal = document.getElementById('search-modal');
        if (modal) {
            modal.classList.remove('hidden');
            document.getElementById('search-input')?.focus();
        }
    },

    /**
     * Toggle sidebar mobile
     */
    toggleMobile() {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.classList.toggle('-translate-x-full');
        }
    }
};
</script>
