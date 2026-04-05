// js/core/auth.js
/**
 * ISP Manager Pro - Módulo de Autenticação
 * Gerencia login, logout e sessão do usuário
 */

const Auth = {
    /**
     * Faz login do usuário
     */
    login(email, password) {
        const users = JSON.parse(localStorage.getItem('isp_users') || '[]');
        const user = users.find(u => u.email === email && u.senha === password);
        
        if (user && user.ativo) {
            delete user.senha; // Remove senha da sessão
            localStorage.setItem('isp_session', JSON.stringify({
                user,
                timestamp: new Date().toISOString()
            }));
            return true;
        }
        return false;
    },
    
    /**
     * Verifica se há sessão ativa
     */
    checkSession() {
        const session = localStorage.getItem('isp_session');
        if (!session) return null;
        
        try {
            const data = JSON.parse(session);
            // Sessão expira após 8 horas
            const maxAge = 8 * 60 * 60 * 1000;
            if (Date.now() - new Date(data.timestamp).getTime() > maxAge) {
                this.logout();
                return null;
            }
            return data.user;
        } catch (e) {
            return null;
        }
    },
    
    /**
     * Faz logout
     */
    logout() {
        localStorage.removeItem('isp_session');
        window.location.href = 'index.html';
    },
    
    /**
     * Redireciona se já estiver logado
     */
    redirectIfLogged() {
        if (this.checkSession()) {
            window.location.href = 'app.html';
        }
    },
    
    /**
     * Verifica se usuário tem role específica
     */
    hasRole(roleName) {
        const user = this.checkSession();
        return user?.role === roleName;
    },
    
    /**
     * Retorna nível do usuário atual
     */
    getUserLevel() {
        const user = this.checkSession();
        if (!user) return 0;
        
        const hierarchy = {
            'TI': 1, 'Marketing': 2, 'Comercial': 3, 'Financeiro': 4,
            'Suporte': 5, 'Analista': 6, 'Supervisor': 7,
            'Diretoria': 8, 'CEO': 9, 'SuperUser': 10
        };
        return hierarchy[user.role] || 0;
    }
};
</script>
