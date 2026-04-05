// js/components/toast.js
/**
 * ISP Manager Pro - Toast Notifications
 * Sistema de notificações toast
 */

const Toast = {
    container: null,

    /**
     * Inicializa o sistema de toast
     */
    init() {
        this.createContainer();
    },

    /**
     * Cria container de toasts
     */
    createContainer() {
        if (this.container) return;

        this.container = document.createElement('div');
        this.container.id = 'toast-container';
        this.container.className = 'fixed top-4 right-4 z-50 space-y-2 pointer-events-none';
        document.body.appendChild(this.container);
    },

    /**
     * Mostra toast notification
     * @param {string} message - Mensagem a exibir
     * @param {string} type - Tipo: success, error, warning, info
     * @param {number} duration - Duração em ms
     */
    show(message, type = 'info', duration = 4000) {
        const toast = document.createElement('div');
        toast.className = `
            toast-item pointer-events-auto transform transition-all duration-300 translate-x-full opacity-0
            flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border min-w-[300px] max-w-md
            ${this.getTypeClasses(type)}
        `;

        const icon = this.getIcon(type);
        
        toast.innerHTML = `
            <i class="fas ${icon} text-lg"></i>
            <span class="flex-1 text-sm font-medium">${message}</span>
            <button onclick="Toast.dismiss(this.parentElement)" class="ml-2 hover:opacity-70">
                <i class="fas fa-times text-sm"></i>
            </button>
        `;

        this.container.appendChild(toast);

        // Animate in
        requestAnimationFrame(() => {
            toast.classList.remove('translate-x-full', 'opacity-0');
        });

        // Auto dismiss
        if (duration > 0) {
            setTimeout(() => this.dismiss(toast), duration);
        }

        return toast;
    },

    /**
     * Remove toast
     */
    dismiss(toast) {
        if (!toast) return;
        
        toast.classList.add('translate-x-full', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
    },

    /**
     * Get classes by type
     */
    getTypeClasses(type) {
        const classes = {
            success: 'bg-green-900/90 border-green-700 text-green-100',
            error: 'bg-red-900/90 border-red-700 text-red-100',
            warning: 'bg-yellow-900/90 border-yellow-700 text-yellow-100',
            info: 'bg-blue-900/90 border-blue-700 text-blue-100'
        };
        return classes[type] || classes.info;
    },

    /**
     * Get icon by type
     */
    getIcon(type) {
        const icons = {
            success: 'fa-check-circle text-green-400',
            error: 'fa-exclamation-circle text-red-400',
            warning: 'fa-exclamation-triangle text-yellow-400',
            info: 'fa-info-circle text-blue-400'
        };
        return icons[type] || icons.info;
    },

    /**
     * Convenience methods
     */
    success(message) { return this.show(message, 'success'); },
    error(message) { return this.show(message, 'error'); },
    warning(message) { return this.show(message, 'warning'); },
    info(message) { return this.show(message, 'info'); }
};
</script>
