// js/components/header.js
/**
 * ISP Manager Pro - Header Component
 * Barra superior com user info, notificações e dark mode
 */

const Header = {
    /**
     * Inicializa o header
     */
    init() {
        this.render();
        this.setupEventListeners();
        this.loadNotifications();
    },

    /**
     * Renderiza o header
     */
    render() {
        const user = Auth.checkSession();
        if (!user) return;

        // Atualiza info do usuário
        const userNameEl = document.getElementById('header-user-name');
        const userRoleEl = document.getElementById('header-user-role');
        const userAvatarEl = document.getElementById('header-user-avatar');

        if (userNameEl) userNameEl.textContent = user.nome;
        if (userRoleEl) userRoleEl.textContent = user.role;
        if (userAvatarEl) {
            userAvatarEl.src = user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.nome)}&background=random`;
        }

        // Dark mode toggle
        this.updateDarkModeToggle();
    },

    /**
     * Setup de event listeners
     */
    setupEventListeners() {
        // Dark mode toggle
        const darkModeToggle = document.getElementById('dark-mode-toggle');
        if (darkModeToggle) {
            darkModeToggle.addEventListener('click', () => this.toggleDarkMode());
        }

        // Logout
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => Auth.logout());
        }

        // Notificações dropdown
        const notifBtn = document.getElementById('notifications-btn');
        if (notifBtn) {
            notifBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleNotificationsDropdown();
            });
        }

        // User dropdown
        const userBtn = document.getElementById('user-menu-btn');
        if (userBtn) {
            userBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleUserDropdown();
            });
        }

        // Close dropdowns when clicking outside
        document.addEventListener('click', () => {
            this.closeDropdowns();
        });

        // Mobile menu toggle
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', () => Sidebar.toggleMobile());
        }
    },

    /**
     * Toggle dark mode
     */
    toggleDarkMode() {
        const html = document.documentElement;
        const isDark = html.classList.contains('dark');
        
        if (isDark) {
            html.classList.remove('dark');
            localStorage.setItem('isp_dark_mode', 'false');
        } else {
            html.classList.add('dark');
            localStorage.setItem('isp_dark_mode', 'true');
        }
        
        this.updateDarkModeToggle();
        
        // Dispatch event for other components
        document.dispatchEvent(new CustomEvent('darkmodechange', { detail: { isDark: !isDark } }));
    },

    /**
     * Update dark mode toggle icon
     */
    updateDarkModeToggle() {
        const isDark = localStorage.getItem('isp_dark_mode') !== 'false';
        const toggleBtn = document.getElementById('dark-mode-toggle');
        
        if (toggleBtn) {
            toggleBtn.innerHTML = isDark 
                ? '<i class="fas fa-sun text-yellow-400"></i>'
                : '<i class="fas fa-moon text-gray-400"></i>';
        }
    },

    /**
     * Toggle notifications dropdown
     */
    toggleNotificationsDropdown() {
        const dropdown = document.getElementById('notifications-dropdown');
        if (dropdown) {
            dropdown.classList.toggle('hidden');
        }
    },

    /**
     * Toggle user dropdown
     */
    toggleUserDropdown() {
        const dropdown = document.getElementById('user-dropdown');
        if (dropdown) {
            dropdown.classList.toggle('hidden');
        }
    },

    /**
     * Close all dropdowns
     */
    closeDropdowns() {
        document.getElementById('notifications-dropdown')?.classList.add('hidden');
        document.getElementById('user-dropdown')?.classList.add('hidden');
    },

    /**
     * Load notifications from localStorage
     */
    loadNotifications() {
        const notifications = JSON.parse(localStorage.getItem('isp_notifications') || '[]');
        const unreadCount = notifications.filter(n => !n.read).length;
        
        const badge = document.getElementById('notifications-badge');
        if (badge) {
            if (unreadCount > 0) {
                badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
                badge.classList.remove('hidden');
            } else {
                badge.classList.add('hidden');
            }
        }

        // Render notifications list
        const list = document.getElementById('notifications-list');
        if (list && notifications.length > 0) {
            list.innerHTML = notifications.slice(0, 10).map(notif => `
                <div class="p-3 hover:bg-gray-700/50 border-b border-gray-700 cursor-pointer ${!notif.read ? 'bg-blue-900/20' : ''}"
                     onclick="Header.markNotificationRead(${notif.id})">
                    <div class="flex items-start gap-3">
                        <div class="w-2 h-2 mt-2 rounded-full ${this.getNotifColor(notif.type)}"></div>
                        <div class="flex-1">
                            <p class="text-sm text-gray-300">${notif.message}</p>
                            <p class="text-xs text-gray-500 mt-1">${this.formatTime(notif.timestamp)}</p>
                        </div>
                    </div>
                </div>
            `).join('');
        } else if (list) {
            list.innerHTML = `
                <div class="p-4 text-center text-gray-500">
                    <i class="fas fa-bell-slash text-2xl mb-2"></i>
                    <p class="text-sm">Nenhuma notificação</p>
                </div>
            `;
        }
    },

    /**
     * Get notification color by type
     */
    getNotifColor(type) {
        const colors = {
            'info': 'bg-blue-500',
            'success': 'bg-green-500',
            'warning': 'bg-yellow-500',
            'error': 'bg-red-500',
            'alert': 'bg-red-600'
        };
        return colors[type] || 'bg-gray-500';
    },

    /**
     * Format time ago
     */
    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (minutes < 1) return 'Agora';
        if (minutes < 60) return `${minutes}m atrás`;
        if (hours < 24) return `${hours}h atrás`;
        if (days < 7) return `${days}d atrás`;
        
        return date.toLocaleDateString('pt-BR');
    },

    /**
     * Mark notification as read
     */
    markNotificationRead(id) {
        const notifications = JSON.parse(localStorage.getItem('isp_notifications') || '[]');
        const notif = notifications.find(n => n.id === id);
        if (notif) {
            notif.read = true;
            localStorage.setItem('isp_notifications', JSON.stringify(notifications));
            this.loadNotifications();
            
            // Navigate if has action
            if (notif.action) {
                Router.navigate(notif.action);
            }
        }
    },

    /**
     * Add new notification
     */
    addNotification(message, type = 'info', action = null) {
        const notifications = JSON.parse(localStorage.getItem('isp_notifications') || '[]');
        notifications.unshift({
            id: Date.now(),
            message,
            type,
            action,
            timestamp: new Date().toISOString(),
            read: false
        });
        
        // Keep only last 50
        if (notifications.length > 50) notifications.pop();
        
        localStorage.setItem('isp_notifications', JSON.stringify(notifications));
        this.loadNotifications();
        
        // Show toast
        Toast.show(message, type);
    }
};
</script>
