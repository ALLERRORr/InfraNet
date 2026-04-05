// js/pages/chat-interno/chat.js
/**
 * ISP Manager Pro - Chat Interno Module
 * Conversas entre colaboradores, grupos por departamento
 */

const ChatInterno = {
    currentChat: null,
    currentUser: null,
    
    init() {
        this.currentUser = Auth.checkSession();
        if (!this.currentUser) {
            window.location.href = 'index.html';
            return;
        }
        
        this.loadChats();
        this.loadMessages();
        this.setupEventListeners();
        this.startPolling();
    },
    
    loadChats() {
        const chats = JSON.parse(localStorage.getItem('isp_chats') || '[]');
        const userChats = chats.filter(c => 
            c.type === 'direct' && (c.participants.includes(this.currentUser.id) || 
                                   c.participants.includes(this.currentUser.nome))
        );
        
        // Adiciona grupos padrão se não existirem
        const defaultGroups = [
            { id: 'g1', name: '#geral', type: 'group', members: ['Todos'] },
            { id: 'g2', name: '#suporte', type: 'group', members: ['Suporte', 'TI'] },
            { id: 'g3', name: '#comercial', type: 'group', members: ['Comercial'] },
            { id: 'g4', name: '#financeiro', type: 'group', members: ['Financeiro'] },
            { id: 'g5', name: '#alertas-rede', type: 'group', members: ['TI', 'Supervisor'] }
        ];
        
        const container = document.getElementById('chatList');
        if (!container) return;
        
        let html = '<h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">Grupos</h3>';
        defaultGroups.forEach(group => {
            html += `
                <div onclick="ChatInterno.selectChat('${group.id}', '${group.name}', 'group')" 
                     class="chat-item flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-700/50 transition-colors group">
                    <div class="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                        <i class="fas fa-users text-white text-sm"></i>
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium text-white truncate">${group.name}</p>
                        <p class="text-xs text-gray-400 truncate">${group.members.join(', ')}</p>
                    </div>
                </div>
            `;
        });
        
        html += '<h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-6 mb-3 px-3">Conversas Diretas</h3>';
        
        // Lista de usuários para conversa direta
        const users = JSON.parse(localStorage.getItem('isp_users') || '[]');
        users.forEach(user => {
            if (user.id !== this.currentUser.id) {
                const statusClass = user.role === 'TI' ? 'bg-green-500' : 'bg-gray-500';
                html += `
                    <div onclick="ChatInterno.selectChat(${user.id}, '${user.nome}', 'direct')" 
                         class="chat-item flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-700/50 transition-colors group">
                        <div class="relative">
                            <img src="${user.avatar}" alt="${user.nome}" class="w-10 h-10 rounded-full">
                            <span class="absolute bottom-0 right-0 w-3 h-3 ${statusClass} border-2 border-gray-800 rounded-full"></span>
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="text-sm font-medium text-white truncate">${user.nome}</p>
                            <p class="text-xs text-gray-400 truncate">${user.role}</p>
                        </div>
                    </div>
                `;
            }
        });
        
        container.innerHTML = html;
    },
    
    selectChat(chatId, chatName, type) {
        this.currentChat = { id: chatId, name: chatName, type };
        
        // Atualiza UI
        document.querySelectorAll('.chat-item').forEach(el => {
            el.classList.remove('bg-blue-600/20', 'border', 'border-blue-500/30');
        });
        event.currentTarget.classList.add('bg-blue-600/20', 'border', 'border-blue-500/30');
        
        // Atualiza header do chat
        const headerName = document.getElementById('chatHeaderName');
        const headerStatus = document.getElementById('chatHeaderStatus');
        if (headerName) headerName.textContent = type === 'group' ? chatName : `@${chatName}`;
        if (headerStatus) headerStatus.textContent = type === 'group' ? 'Grupo' : 'Online';
        
        this.loadMessages();
    },
    
    loadMessages() {
        if (!this.currentChat) return;
        
        const allMessages = JSON.parse(localStorage.getItem('isp_chat_messages') || '[]');
        const messages = allMessages.filter(m => 
            m.chatId === this.currentChat.id || 
            (this.currentChat.type === 'group' && m.chatId.startsWith('g'))
        ).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        
        const container = document.getElementById('messagesContainer');
        if (!container) return;
        
        if (messages.length === 0) {
            container.innerHTML = `
                <div class="flex-1 flex items-center justify-center text-gray-400">
                    <div class="text-center">
                        <i class="fas fa-comments text-4xl mb-3 opacity-50"></i>
                        <p>Nenhuma mensagem ainda</p>
                        <p class="text-sm">Seja o primeiro a enviar uma mensagem!</p>
                    </div>
                </div>
            `;
            return;
        }
        
        container.innerHTML = messages.map(msg => {
            const isOwn = msg.senderId === this.currentUser.id;
            return `
                <div class="flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3">
                    <div class="max-w-[70%]">
                        ${!isOwn && this.currentChat.type === 'group' ? 
                            `<p class="text-xs text-gray-400 mb-1 ml-1">${msg.senderName}</p>` : ''}
                        <div class="${isOwn ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-100'} 
                                      rounded-2xl px-4 py-2 ${isOwn ? 'rounded-br-md' : 'rounded-bl-md'}">
                            <p class="text-sm">${msg.content}</p>
                        </div>
                        <p class="text-xs text-gray-500 mt-1 ${isOwn ? 'text-right' : 'text-left'} ml-1">
                            ${new Date(msg.timestamp).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                        </p>
                    </div>
                </div>
            `;
        }).join('');
        
        container.scrollTop = container.scrollHeight;
    },
    
    sendMessage() {
        const input = document.getElementById('messageInput');
        const content = input.value.trim();
        
        if (!content || !this.currentChat) return;
        
        const messages = JSON.parse(localStorage.getItem('isp_chat_messages') || '[]');
        messages.push({
            id: Date.now(),
            chatId: this.currentChat.id,
            senderId: this.currentUser.id,
            senderName: this.currentUser.nome,
            content,
            timestamp: new Date().toISOString(),
            read: false
        });
        
        localStorage.setItem('isp_chat_messages', JSON.stringify(messages));
        input.value = '';
        this.loadMessages();
        
        // Notifica outros usuários (simulado)
        this.showNotification(`Nova mensagem em ${this.currentChat.name}`);
    },
    
    setupEventListeners() {
        const sendBtn = document.getElementById('sendMessageBtn');
        const input = document.getElementById('messageInput');
        
        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendMessage());
        }
        
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.sendMessage();
            });
        }
    },
    
    startPolling() {
        // Simula polling para novas mensagens a cada 3 segundos
        setInterval(() => {
            if (this.currentChat) {
                this.loadMessages();
            }
        }, 3000);
    },
    
    showNotification(message) {
        Toast.show(message, 'info');
    }
};

// Inicializa quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('chat-interno')) {
        ChatInterno.init();
    }
});
</script>