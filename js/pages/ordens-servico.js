// js/pages/ordens-servico.js
/**
 * ISP Manager Pro - Módulo de Ordens de Serviço
 * Gestão completa de OS para instalação e manutenção
 */

const OrdensServico = {
    render(params) {
        const user = Auth.checkSession();
        if (!Permissions.canAccess('ordens-servico', user)) {
            Router.showError('Você não tem permissão para acessar este módulo.');
            return;
        }
        
        const orders = JSON.parse(localStorage.getItem('isp_orders') || '[]');
        const clients = JSON.parse(localStorage.getItem('isp_clients') || '[]');
        const techs = JSON.parse(localStorage.getItem('isp_techs') || '[]');
        
        // Enriquece OS com dados do cliente
        const enrichedOrders = orders.map(o => {
            const client = clients.find(c => c.id === o.cliente_id);
            const tech = techs.find(t => t.id === o.tecnico_id);
            return { ...o, client, tech };
        });
        
        document.getElementById('app-content').innerHTML = `
            <div class="space-y-6 content-fade">
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 class="text-2xl font-bold text-white">Ordens de Serviço</h1>
                        <p class="text-gray-400 text-sm mt-1">Gestão de instalações e manutenções</p>
                    </div>
                    ${Permissions.canPerformAction('criar', 'os', user) ? `
                        <button onclick="OrdensServico.openModal()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
                            <i class="fas fa-plus"></i><span>Nova OS</span>
                        </button>
                    ` : ''}
                </div>
                
                <!-- Filtros -->
                <div class="bg-gray-800 border border-gray-700 rounded-xl p-4">
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div><label class="block text-xs text-gray-400 mb-1">Buscar</label>
                            <input type="text" id="os-filter-search" placeholder="Cliente, técnico..." class="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"></div>
                        <div><label class="block text-xs text-gray-400 mb-1">Tipo</label>
                            <select id="os-filter-type" class="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none">
                                <option value="">Todos</option>
                                <option value="INSTALACAO">Instalação</option>
                                <option value="MANUTENCAO">Manutenção</option>
                                <option value="VISITA_TECNICA">Visita Técnica</option>
                                <option value="CANCELAMENTO">Cancelamento</option>
                            </select></div>
                        <div><label class="block text-xs text-gray-400 mb-1">Status</label>
                            <select id="os-filter-status" class="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none">
                                <option value="">Todos</option>
                                <option value="ABERTA">Aberta</option>
                                <option value="AGENDADA">Agendada</option>
                                <option value="EM_ANDAMENTO">Em Andamento</option>
                                <option value="INSTALADA">Instalada</option>
                                <option value="CONCLUIDA">Concluída</option>
                                <option value="CANCELADA">Cancelada</option>
                            </select></div>
                        <div class="flex items-end"><button onclick="OrdensServico.applyFilters()" class="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"><i class="fas fa-filter mr-2"></i>Filtrar</button></div>
                    </div>
                </div>
                
                <!-- Lista de OS -->
                <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    ${enrichedOrders.map(os => this.renderCard(os)).join('')}
                </div>
                
                ${!enrichedOrders.length ? '<div class="text-center py-12 text-gray-500"><i class="fas fa-clipboard-list text-4xl mb-4"></i><p>Nenhuma ordem de serviço encontrada</p></div>' : ''}
            </div>
            
            <!-- Modal Nova OS -->
            <div id="os-modal" class="hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div class="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                    <div class="sticky top-0 bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
                        <h2 class="text-xl font-bold text-white">Nova Ordem de Serviço</h2>
                        <button onclick="OrdensServico.closeModal()" class="text-gray-400 hover:text-white"><i class="fas fa-times text-xl"></i></button>
                    </div>
                    <form id="os-form" class="p-6 space-y-6">
                        <div><h3 class="text-lg font-semibold text-white mb-4">Dados da OS</h3>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><label class="block text-sm text-gray-400 mb-1">Tipo *</label>
                                    <select name="tipo" required class="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none">
                                        <option value="">Selecione</option>
                                        <option value="INSTALACAO">Instalação</option>
                                        <option value="MANUTENCAO">Manutenção</option>
                                        <option value="VISITA_TECNICA">Visita Técnica</option>
                                        <option value="CANCELAMENTO">Cancelamento</option>
                                    </select></div>
                                <div><label class="block text-sm text-gray-400 mb-1">Cliente *</label>
                                    <select name="cliente_id" required class="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none">
                                        <option value="">Selecione</option>
                                        ${clients.filter(c => c.status !== 'CANCELADO').map(c => `<option value="${c.id}">${c.nome}</option>`).join('')}
                                    </select></div>
                                <div><label class="block text-sm text-gray-400 mb-1">Técnico *</label>
                                    <select name="tecnico_id" required class="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none">
                                        <option value="">Selecione</option>
                                        ${techs.map(t => `<option value="${t.id}">${t.nome}</option>`).join('')}
                                    </select></div>
                                <div><label class="block text-sm text-gray-400 mb-1">Data Agendada *</label>
                                    <input type="date" name="data_agendada" required class="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"></div>
                                <div><label class="block text-sm text-gray-400 mb-1">Horário *</label>
                                    <input type="time" name="horario" required class="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"></div>
                                <div class="md:col-span-2"><label class="block text-sm text-gray-400 mb-1">Observações</label>
                                    <textarea name="observacoes" rows="3" class="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none" placeholder="Instruções para o técnico..."></textarea></div>
                            </div></div>
                        <div class="flex gap-3 pt-4 border-t border-gray-700">
                            <button type="button" onclick="OrdensServico.closeModal()" class="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700">Cancelar</button>
                            <button type="submit" class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"><i class="fas fa-save mr-2"></i>Criar OS</button>
                        </div>
                    </form>
                </div>
            </div>
            
            <!-- Modal Comodatos (para técnico) -->
            <div id="comodatos-modal" class="hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div class="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                    <div class="sticky top-0 bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
                        <h2 class="text-xl font-bold text-white">Registrar Comodatos</h2>
                        <button onclick="OrdensServico.closeComodatosModal()" class="text-gray-400 hover:text-white"><i class="fas fa-times text-xl"></i></button>
                    </div>
                    <div id="comodatos-content" class="p-6"></div>
                </div>
            </div>
        `;
        
        this.setupFormHandlers();
    },
    
    renderCard(os) {
        const statusColors = {
            'ABERTA': 'bg-gray-500/20 text-gray-400',
            'AGENDADA': 'bg-blue-500/20 text-blue-400',
            'EM_ANDAMENTO': 'bg-yellow-500/20 text-yellow-400',
            'INSTALADA': 'bg-green-500/20 text-green-400',
            'CONCLUIDA': 'bg-emerald-500/20 text-emerald-400',
            'CANCELADA': 'bg-red-500/20 text-red-400'
        };
        
        const typeIcons = { 'INSTALACAO': 'fa-wrench', 'MANUTENCAO': 'fa-tools', 'VISITA_TECNICA': 'fa-user-check', 'CANCELAMENTO': 'fa-times-circle' };
        
        return `
            <div class="bg-gray-800 border border-gray-700 rounded-xl p-4 hover:border-blue-500/50 transition-colors">
                <div class="flex items-start justify-between mb-3">
                    <div class="flex items-center gap-2">
                        <div class="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                            <i class="fas ${typeIcons[os.tipo] || 'fa-clipboard'} text-blue-400"></i>
                        </div>
                        <div>
                            <p class="text-white font-semibold">#${os.id} - ${os.tipo.replace('_', ' ')}</p>
                            <p class="text-gray-500 text-xs">${os.client?.nome || 'Cliente não encontrado'}</p>
                        </div>
                    </div>
                    <span class="px-2 py-1 rounded-full text-xs font-medium ${statusColors[os.status] || 'bg-gray-500/20'}">${os.status}</span>
                </div>
                
                <div class="space-y-2 text-sm">
                    <div class="flex items-center gap-2 text-gray-400">
                        <i class="fas fa-calendar w-4"></i>
                        <span>${new Date(os.data_agendada).toLocaleDateString('pt-BR')} às ${os.horario}</span>
                    </div>
                    <div class="flex items-center gap-2 text-gray-400">
                        <i class="fas fa-user-wrench w-4"></i>
                        <span>${os.tech?.nome || 'Não atribuído'}</span>
                    </div>
                    ${os.observacoes ? `<p class="text-gray-500 text-xs mt-2"><i class="fas fa-comment mr-1"></i>${os.observacoes}</p>` : ''}
                </div>
                
                <div class="flex gap-2 mt-4 pt-4 border-t border-gray-700">
                    <button onclick="OrdensServico.viewOS(${os.id})" class="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors">
                        <i class="fas fa-eye mr-1"></i>Ver
                    </button>
                    ${os.status === 'AGENDADA' || os.status === 'EM_ANDAMENTO' ? `
                        <button onclick="OrdensServico.openComodatos(${os.id})" class="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors">
                            <i class="fas fa-box mr-1"></i>Comodatos
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    },
    
    setupFormHandlers() {
        document.getElementById('os-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const fd = new FormData(e.target);
            const orders = JSON.parse(localStorage.getItem('isp_orders') || '[]');
            orders.push({
                id: Date.now(),
                tipo: fd.get('tipo'),
                cliente_id: parseInt(fd.get('cliente_id')),
                tecnico_id: parseInt(fd.get('tecnico_id')),
                data_agendada: fd.get('data_agendada'),
                horario: fd.get('horario'),
                status: 'AGENDADA',
                observacoes: fd.get('observacoes'),
                comodatos: [],
                data_criacao: new Date().toISOString()
            });
            localStorage.setItem('isp_orders', JSON.stringify(orders));
            Toast.success('OS criada com sucesso!');
            this.closeModal();
            this.render();
        });
    },
    
    openModal() { document.getElementById('os-modal').classList.remove('hidden'); },
    closeModal() { document.getElementById('os-modal').classList.add('hidden'); document.getElementById('os-form')?.reset(); },
    
    applyFilters() {
        const search = document.getElementById('os-filter-search')?.value.toLowerCase() || '';
        const type = document.getElementById('os-filter-type')?.value || '';
        const status = document.getElementById('os-filter-status')?.value || '';
        
        let orders = JSON.parse(localStorage.getItem('isp_orders') || '[]');
        const clients = JSON.parse(localStorage.getItem('isp_clients') || '[]');
        
        if (search) {
            orders = orders.filter(os => {
                const client = clients.find(c => c.id === os.cliente_id);
                return client?.nome.toLowerCase().includes(search) || os.id.toString().includes(search);
            });
        }
        if (type) orders = orders.filter(os => os.tipo === type);
        if (status) orders = orders.filter(os => os.status === status);
        
        const enriched = orders.map(os => ({ ...os, client: clients.find(c => c.id === os.cliente_id) }));
        document.querySelector('.grid.grid-cols-1.lg\\:grid-cols-2').innerHTML = enriched.map(os => this.renderCard(os)).join('');
    },
    
    viewOS(id) { Toast.info(`Ver OS ${id}`); },
    
    openComodatos(osId) {
        const orders = JSON.parse(localStorage.getItem('isp_orders') || '[]');
        const os = orders.find(o => o.id === osId);
        if (!os) return;
        
        const modal = document.getElementById('comodatos-modal');
        const content = document.getElementById('comodatos-content');
        
        content.innerHTML = `
            <form id="comodatos-form" class="space-y-4">
                <div class="bg-gray-900/50 rounded-lg p-4 mb-4">
                    <p class="text-white font-medium">OS #${os.id} - ${os.client?.nome}</p>
                    <p class="text-gray-500 text-sm">Adicione os equipamentos deixados no cliente</p>
                </div>
                
                <div id="comodatos-items" class="space-y-3">
                    ${os.comodatos?.map((c, i) => `
                        <div class="bg-gray-900 rounded-lg p-3 flex items-center gap-3">
                            <div class="flex-1 grid grid-cols-2 gap-2 text-sm">
                                <div><p class="text-gray-400 text-xs">Tipo</p><p class="text-white">${c.tipo}</p></div>
                                <div><p class="text-gray-400 text-xs">Modelo</p><p class="text-white">${c.modelo}</p></div>
                                <div><p class="text-gray-400 text-xs">N/S</p><p class="text-white">${c.serial}</p></div>
                                <div><p class="text-gray-400 text-xs">MAC</p><p class="text-white">${c.mac || '-'}</p></div>
                            </div>
                            <button type="button" onclick="OrdensServico.removeComodato(${i})" class="text-red-400 hover:text-red-300"><i class="fas fa-trash"></i></button>
                        </div>
                    `).join('') || '<p class="text-gray-500 text-center py-4">Nenhum comodato registrado</p>'}
                </div>
                
                <div class="bg-gray-900 rounded-lg p-4 space-y-3">
                    <h4 class="text-white font-medium">Novo Equipamento</h4>
                    <div class="grid grid-cols-2 gap-3">
                        <select id="comodato-tipo" class="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white">
                            <option value="ONU">ONU</option>
                            <option value="ROTEADOR">Roteador</option>
                            <option value="CABO">Cabo</option>
                            <option value="CONECTOR">Conector</option>
                            <option value="OUTROS">Outros</option>
                        </select>
                        <input type="text" id="comodato-modelo" placeholder="Modelo" class="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white">
                        <input type="text" id="comodato-serial" placeholder="Número de Série" class="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white">
                        <input type="text" id="comodato-mac" placeholder="MAC Address" class="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white">
                    </div>
                    <button type="button" onclick="OrdensServico.addComodato(${osId})" class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm">
                        <i class="fas fa-plus mr-2"></i>Adicionar Equipamento
                    </button>
                </div>
                
                <div class="flex gap-3 pt-4 border-t border-gray-700">
                    <button type="button" onclick="OrdensServico.closeComodatosModal()" class="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700">Cancelar</button>
                    <button type="button" onclick="OrdensServico.finalizarOS(${osId})" class="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg">
                        <i class="fas fa-check mr-2"></i>Finalizar OS
                    </button>
                </div>
            </form>
        `;
        
        modal.classList.remove('hidden');
    },
    
    addComodato(osId) {
        const tipo = document.getElementById('comodato-tipo').value;
        const modelo = document.getElementById('comodato-modelo').value;
        const serial = document.getElementById('comodato-serial').value;
        const mac = document.getElementById('comodato-mac').value;
        
        if (!modelo || !serial) {
            Toast.error('Preencha modelo e número de série');
            return;
        }
        
        const orders = JSON.parse(localStorage.getItem('isp_orders') || '[]');
        const osIndex = orders.findIndex(o => o.id === osId);
        
        if (osIndex > -1) {
            if (!orders[osIndex].comodatos) orders[osIndex].comodatos = [];
            orders[osIndex].comodatos.push({ tipo, modelo, serial, mac });
            localStorage.setItem('isp_orders', JSON.stringify(orders));
            
            Toast.success('Equipamento adicionado!');
            this.openComodatos(osId);
        }
    },
    
    removeComodato(index) {
        // Implementar remoção
        Toast.info('Remover comodato');
    },
    
    finalizarOS(osId) {
        const orders = JSON.parse(localStorage.getItem('isp_orders') || '[]');
        const os = orders.find(o => o.id === osId);
        
        if (!os?.comodatos?.length) {
            Toast.error('É necessário registrar pelo menos 1 comodato!');
            return;
        }
        
        const osIndex = orders.findIndex(o => o.id === osId);
        orders[osIndex].status = 'INSTALADA';
        localStorage.setItem('isp_orders', JSON.stringify(orders));
        
        Toast.success('OS finalizada! Contrato liberado para assinatura.');
        this.closeComodatosModal();
        this.render();
    },
    
    closeComodatosModal() { document.getElementById('comodatos-modal').classList.add('hidden'); }
};
</script>
