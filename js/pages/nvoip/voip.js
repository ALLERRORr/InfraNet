// js/pages/nvoip/voip.js
/**
 * ISP Manager Pro - NVOIP Module
 * Softphone, ramais, CDR, click-to-call
 */

const NVOIP = {
    currentUser: null,
    activeCall: null,
    
    init() {
        this.currentUser = Auth.checkSession();
        if (!this.currentUser) {
            window.location.href = 'index.html';
            return;
        }
        
        this.loadExtensions();
        this.loadCDR();
        this.setupEventListeners();
    },
    
    loadExtensions() {
        const extensions = [
            { ramal: '1001', nome: 'Recepção', status: 'available', calls: 0 },
            { ramal: '1002', nome: 'Comercial 1', status: 'busy', calls: 1 },
            { ramal: '1003', nome: 'Comercial 2', status: 'available', calls: 0 },
            { ramal: '1004', nome: 'Suporte N1', status: 'available', calls: 0 },
            { ramal: '1005', nome: 'Suporte N2', status: 'busy', calls: 2 },
            { ramal: '1006', nome: 'Financeiro', status: 'away', calls: 0 },
            { ramal: '1007', nome: 'Supervisor', status: 'available', calls: 0 },
            { ramal: '1008', nome: 'TI', status: 'available', calls: 0 }
        ];
        
        const container = document.getElementById('extensionsList');
        if (!container) return;
        
        container.innerHTML = extensions.map(ext => {
            const statusColors = {
                available: 'bg-green-500',
                busy: 'bg-red-500',
                away: 'bg-yellow-500'
            };
            const statusLabels = {
                available: 'Livre',
                busy: 'Ocupado',
                away: 'Ausente'
            };
            
            return `
                <div class="flex items-center justify-between p-3 bg-dark-800 rounded-lg border border-dark-700">
                    <div class="flex items-center gap-3">
                        <div class="relative">
                            <div class="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
                                <i class="fas fa-phone text-white text-sm"></i>
                            </div>
                            <span class="absolute bottom-0 right-0 w-3 h-3 ${statusColors[ext.status]} border-2 border-dark-900 rounded-full"></span>
                        </div>
                        <div>
                            <p class="font-semibold text-white">${ext.ramal} - ${ext.nome}</p>
                            <p class="text-xs text-gray-400">${statusLabels[ext.status]} ${ext.calls > 0 ? `(${ext.calls} chamadas)` : ''}</p>
                        </div>
                    </div>
                    
                    <button onclick="NVOIP.makeCall('${ext.ramal}')" 
                            class="px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded-lg text-sm transition-colors flex items-center gap-1">
                        <i class="fas fa-phone"></i> Ligar
                    </button>
                </div>
            `;
        }).join('');
    },
    
    loadCDR() {
        const cdr = [
            { id: 1, origem: '1001', destino: '(11) 99999-1111', cliente: 'Roberto Silva', duracao: '00:03:45', data: new Date().toISOString(), status: 'completed' },
            { id: 2, origem: '1004', destino: '(11) 99999-2222', cliente: 'Amanda Costa', duracao: '00:12:30', data: new Date(Date.now() - 3600000).toISOString(), status: 'completed' },
            { id: 3, origem: '(11) 99999-3333', destino: '1002', cliente: 'Carlos Mendes', duracao: '00:00:00', data: new Date(Date.now() - 7200000).toISOString(), status: 'missed' },
            { id: 4, origem: '1005', destino: '(11) 99999-4444', cliente: 'Patricia Lima', duracao: '00:08:15', data: new Date(Date.now() - 10800000).toISOString(), status: 'completed' },
            { id: 5, origem: '1006', destino: '(11) 99999-5555', cliente: 'Fernando Souza', duracao: '00:05:20', data: new Date(Date.now() - 14400000).toISOString(), status: 'completed' }
        ];
        
        const container = document.getElementById('cdrList');
        if (!container) return;
        
        container.innerHTML = cdr.map(call => {
            const statusIcon = call.status === 'completed' ? 'fa-phone-volume text-green-400' : 'fa-phone-slash text-red-400';
            const direction = call.origem.startsWith('1') ? 'outgoing' : 'incoming';
            const arrowClass = direction === 'outgoing' ? 'fa-arrow-right-from-bracket text-blue-400' : 'fa-arrow-right-to-bracket text-purple-400';
            
            return `
                <tr class="border-b border-dark-700 hover:bg-dark-800/50 transition-colors">
                    <td class="py-3 px-4">
                        <i class="fas ${statusIcon}"></i>
                    </td>
                    <td class="py-3 px-4">
                        <div class="flex items-center gap-2">
                            <i class="fas ${arrowClass} text-xs"></i>
                            <span class="text-sm">${call.cliente}</span>
                        </div>
                    </td>
                    <td class="py-3 px-4 text-sm text-gray-400">
                        ${direction === 'outgoing' ? call.origem : call.destino}
                    </td>
                    <td class="py-3 px-4 text-sm text-gray-400">
                        ${direction === 'outgoing' ? call.destino : call.origem}
                    </td>
                    <td class="py-3 px-4 text-sm font-mono ${call.duracao === '00:00:00' ? 'text-red-400' : 'text-white'}">
                        ${call.duracao}
                    </td>
                    <td class="py-3 px-4 text-sm text-gray-400">
                        ${new Date(call.data).toLocaleString('pt-BR')}
                    </td>
                    <td class="py-3 px-4">
                        <button onclick="NVOIP.playRecording(${call.id})" class="p-1 hover:bg-dark-700 rounded transition-colors" title="Ouvir gravação">
                            <i class="fas fa-play text-xs text-gray-400"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    },
    
    makeCall(number) {
        const clientNumber = prompt(`Número para ligar:`, number);
        if (!clientNumber) return;
        
        // Simula discagem
        this.activeCall = {
            number: clientNumber,
            startTime: Date.now(),
            status: 'calling'
        };
        
        Toast.show(`Discando para ${clientNumber}...`, 'info');
        
        // Simula atendimento após 2 segundos
        setTimeout(() => {
            if (this.activeCall) {
                this.activeCall.status = 'connected';
                Toast.show('Chamada conectada!', 'success');
                
                // Inicia timer
                this.startCallTimer();
            }
        }, 2000);
    },
    
    startCallTimer() {
        const timerEl = document.getElementById('callTimer');
        if (!timerEl) return;
        
        timerEl.classList.remove('hidden');
        
        const interval = setInterval(() => {
            if (!this.activeCall || this.activeCall.status !== 'connected') {
                clearInterval(interval);
                timerEl.classList.add('hidden');
                return;
            }
            
            const elapsed = Math.floor((Date.now() - this.activeCall.startTime) / 1000);
            const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
            const seconds = (elapsed % 60).toString().padStart(2, '0');
            timerEl.textContent = `${minutes}:${seconds}`;
        }, 1000);
    },
    
    endCall() {
        if (!this.activeCall) return;
        
        const duration = Math.floor((Date.now() - this.activeCall.startTime) / 1000);
        const minutes = Math.floor(duration / 60).toString().padStart(2, '0');
        const seconds = (duration % 60).toString().padStart(2, '0');
        
        Toast.show(`Chamada encerrada. Duração: ${minutes}:${seconds}`, 'info');
        
        this.activeCall = null;
        
        const timerEl = document.getElementById('callTimer');
        if (timerEl) {
            timerEl.classList.add('hidden');
            timerEl.textContent = '00:00';
        }
    },
    
    playRecording(id) {
        Toast.show('Reproduzindo gravação...', 'info');
        // Implementação futura com áudio real
    },
    
    setupEventListeners() {
        // Botões de controle de chamada
        const answerBtn = document.getElementById('answerCallBtn');
        const hangupBtn = document.getElementById('hangupBtn');
        
        if (answerBtn) {
            answerBtn.addEventListener('click', () => {
                if (this.activeCall && this.activeCall.status === 'calling') {
                    this.activeCall.status = 'connected';
                    Toast.show('Chamada atendida!', 'success');
                    this.startCallTimer();
                }
            });
        }
        
        if (hangupBtn) {
            hangupBtn.addEventListener('click', () => this.endCall());
        }
        
        // Busca de clientes por telefone
        const searchPhone = document.getElementById('searchPhone');
        if (searchPhone) {
            searchPhone.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.searchClientByPhone(searchPhone.value);
                }
            });
        }
    },
    
    searchClientByPhone(phone) {
        const clients = JSON.parse(localStorage.getItem('isp_clients') || '[]');
        const cleanPhone = phone.replace(/\D/g, '');
        
        const client = clients.find(c => c.telefone.replace(/\D/g, '').includes(cleanPhone));
        
        if (client) {
            Toast.show(`Cliente encontrado: ${client.nome}`, 'success');
            // Abre ficha do cliente
            window.location.href = `/pages/cadastros/clientes.html?id=${client.id}`;
        } else {
            Toast.show('Cliente não encontrado', 'error');
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('nvoip')) {
        NVOIP.init();
    }
});
</script>