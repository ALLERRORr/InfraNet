// js/pages/chat-externo/atendimento.js
/**
 * ISP Manager Pro - Chat Externo Module
 * Atendimento ao cliente, fila de atendimentos, transferência entre setores
 */

const ChatExterno = {
    currentAttendance: null,
    currentUser: null,
    
    init() {
        this.currentUser = Auth.checkSession();
        if (!this.currentUser) {
            window.location.href = 'index.html';
            return;
        }
        
        this.loadQueue();
        this.setupEventListeners();
    },
    
    loadQueue() {
        const attendances = JSON.parse(localStorage.getItem('isp_chat_external') || '[]');
        const pending = attendances.filter(a => a.status === 'pending' || a.status === 'in_progress');
        
        const container = document.getElementById('queueList');
        if (!container) return;
        
        if (pending.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8 text-gray-400">
                    <i class="fas fa-inbox text-3xl mb-3 opacity-50"></i>
                    <p>Nenhum atendimento na fila</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = pending.map(att => {
            const client = att.cliente;
            const waitTime = this.calculateWaitTime(att.timestamp);
            const statusClass = att.status === 'pending' ? 'bg-yellow-500' : 'bg-blue-500';
            const statusLabel = att.status === 'pending' ? 'Aguardando' : 'Em andamento';
            
            return `
                <div onclick="ChatExterno.selectAttendance(${att.id})" 
                     class="attendance-item p-4 border-b border-gray-700 cursor-pointer hover:bg-gray-700/50 transition-colors ${this.currentAttendance?.id === att.id ? 'bg-blue-600/20' : ''}">
                    <div class="flex items-start justify-between mb-2">
                        <div class="flex items-center gap-2">
                            <span class="w-2 h-2 ${statusClass} rounded-full"></span>
                            <span class="text-xs text-gray-400">${statusLabel}</span>
                        </div>
                        <span class="text-xs text-gray-500">${waitTime}</span>
                    </div>
                    
                    <h3 class="font-semibold text-white mb-1">${client.nome}</h3>
                    <p class="text-sm text-gray-400 mb-2 truncate">${client.ultimo_mensagem || 'Sem mensagens...'}</p>
                    
                    <div class="flex items-center gap-2 text-xs text-gray-500">
                        <span><i class="fas fa-phone mr-1"></i>${client.telefone}</span>
                        ${att.setor ? `<span class="px-2 py-1 bg-gray-700 rounded">${att.setor}</span>` : ''}
                    </div>
                </div>
            `;
        }).join('');
    },
    
    selectAttendance(id) {
        const attendances = JSON.parse(localStorage.getItem('isp_chat_external') || '[]');
        const attendance = attendances.find(a => a.id === id);
        
        if (!attendance) return;
        
        this.currentAttendance = attendance;
        
        // Atualiza UI
        document.querySelectorAll('.attendance-item').forEach(el => {
            el.classList.remove('bg-blue-600/20');
        });
        event.currentTarget.classList.add('bg-blue-600/20');
        
        // Carrega informações do cliente
        this.loadClientInfo(attendance.cliente);
        
        // Carrega mensagens
        this.loadMessages(attendance);
        
        // Atualiza status para em progresso se estiver pendente
        if (attendance.status === 'pending') {
            attendance.status = 'in_progress';
            attendance.atendente_id = this.currentUser.id;
            attendance.atendente_nome = this.currentUser.nome;
            
            const index = attendances.findIndex(a => a.id === id);
            attendances[index] = attendance;
            localStorage.setItem('isp_chat_external', JSON.stringify(attendances));
        }
    },
    
    loadClientInfo(client) {
        const container = document.getElementById('clientInfo');
        if (!container) return;
        
        container.innerHTML = `
            <div class="p-4 border-b border-gray-700">
                <div class="flex items-center gap-3 mb-4">
                    <div class="w-12 h-12 rounded-full bg-gradient-to-r from-green-600 to-emerald-600 flex items-center justify-center text-lg font-bold">
                        ${client.nome.charAt(0)}
                    </div>
                    <div>
                        <h3 class="font-bold text-lg">${client.nome}</h3>
                        <p class="text-sm text-gray-400">Cliente desde ${new Date(client.data_criacao).toLocaleDateString('pt-BR')}</p>
                    </div>
                </div>
                
                <div class="space-y-2 text-sm">
                    <div class="flex items-center gap-2 text-gray-300">
                        <i class="fas fa-phone w-5 text-gray-500"></i>
                        <span>${client.telefone}</span>
                    </div>
                    <div class="flex items-center gap-2 text-gray-300">
                        <i class="fas fa-envelope w-5 text-gray-500"></i>
                        <span>${client.email}</span>
                    </div>
                    <div class="flex items-center gap-2 text-gray-300">
                        <i class="fas fa-map-marker-alt w-5 text-gray-500"></i>
                        <span class="truncate">${client.endereco}</span>
                    </div>
                    <div class="flex items-center gap-2 text-gray-300">
                        <i class="fas fa-wifi w-5 text-gray-500"></i>
                        <span>Plano: ${client.plano}</span>
                    </div>
                    <div class="flex items-center gap-2 text-gray-300">
                        <i class="fas fa-file-invoice-dollar w-5 text-gray-500"></i>
                        <span>Status: <span class="px-2 py-0.5 rounded text-xs ${client.status === 'ATIVO' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}">${client.status}</span></span>
                    </div>
                </div>
            </div>
            
            <!-- Ações rápidas -->
            <div class="p-4 space-y-2">
                <button onclick="ChatExterno.transferToSector()" class="w-full py-2 px-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors flex items-center justify-center gap-2">
                    <i class="fas fa-exchange-alt"></i> Transferir Setor
                </button>
                <button onclick="ChatExterno.openTicket()" class="w-full py-2 px-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors flex items-center justify-center gap-2">
                    <i class="fas fa-ticket-alt"></i> Abrir Chamado
                </button>
                <button onclick="ChatExterno.viewContracts()" class="w-full py-2 px-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors flex items-center justify-center gap-2">
                    <i class="fas fa-file-contract"></i> Ver Contratos
                </button>
            </div>
        `;
    },
    
    loadMessages(attendance) {
        const messages = attendance.mensagens || [];
        
        const container = document.getElementById('messagesContainer');
        if (!container) return;
        
        if (messages.length === 0) {
            container.innerHTML = `
                <div class="flex-1 flex items-center justify-center text-gray-400">
                    <div class="text-center">
                        <i class="fas fa-comments text-4xl mb-3 opacity-50"></i>
                        <p>Início da conversa</p>
                        <p class="text-sm">Envie uma mensagem para começar</p>
                    </div>
                </div>
            `;
            return;
        }
        
        container.innerHTML = messages.map(msg => {
            const isOwn = msg.sender === 'atendente';
            return `
                <div class="flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3">
                    <div class="max-w-[70%]">
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
        
        if (!content || !this.currentAttendance) return;
        
        const attendances = JSON.parse(localStorage.getItem('isp_chat_external') || '[]');
        const index = attendances.findIndex(a => a.id === this.currentAttendance.id);
        
        if (index === -1) return;
        
        attendances[index].mensagens = attendances[index].mensagens || [];
        attendances[index].mensagens.push({
            id: Date.now(),
            sender: 'atendente',
            sender_name: this.currentUser.nome,
            content,
            timestamp: new Date().toISOString()
        });
        
        attendances[index].ultimo_mensagem = content;
        attendances[index].ultima_atualizacao = new Date().toISOString();
        
        localStorage.setItem('isp_chat_external', JSON.stringify(attendances));
        
        input.value = '';
        this.loadMessages(attendances[index]);
        this.loadQueue(); // Atualiza fila
        
        Toast.show('Mensagem enviada', 'success');
    },
    
    calculateWaitTime(timestamp) {
        const now = new Date();
        const start = new Date(timestamp);
        const diff = Math.floor((now - start) / 60000); // minutos
        
        if (diff < 1) return 'Agora';
        if (diff < 60) return `${diff} min`;
        const hours = Math.floor(diff / 60);
        return `${hours}h ${diff % 60}min`;
    },
    
    transferToSector() {
        if (!this.currentAttendance) return;
        
        const sectors = ['Suporte Técnico', 'Financeiro', 'Comercial', 'Supervisor'];
        const sector = prompt(`Para qual setor transferir?\n${sectors.join('\n')}`);
        
        if (sector && sectors.includes(sector)) {
            const attendances = JSON.parse(localStorage.getItem('isp_chat_external') || '[]');
            const index = attendances.findIndex(a => a.id === this.currentAttendance.id);
            
            if (index !== -1) {
                attendances[index].setor = sector;
                attendances[index].status = 'pending';
                attendances[index].atendente_id = null;
                attendances[index].atendente_nome = null;
                
                localStorage.setItem('isp_chat_external', JSON.stringify(attendances));
                
                Toast.show(`Transferido para ${sector}`, 'info');
                this.loadQueue();
                this.currentAttendance = null;
            }
        } else {
            Toast.show('Setor inválido', 'error');
        }
    },
    
    openTicket() {
        if (!this.currentAttendance) return;
        Toast.show('Abrindo chamado...', 'info');
        // Implementação futura
    },
    
    viewContracts() {
        if (!this.currentAttendance) return;
        Toast.show('Visualizando contratos...', 'info');
        // Implementação futura
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
        
        // Atualiza fila periodicamente
        setInterval(() => this.loadQueue(), 5000);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('chat-externo')) {
        ChatExterno.init();
    }
});
</script>