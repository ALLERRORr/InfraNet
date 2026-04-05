// js/pages/clientes.js
/**
 * ISP Manager Pro - Módulo de Clientes
 * Cadastro, listagem e gestão de clientes
 */

const Clientes = {
    render(params) {
        const user = Auth.checkSession();
        if (!Permissions.canAccess('clientes', user)) {
            Router.showError('Você não tem permissão para acessar este módulo.');
            return;
        }
        
        const clients = JSON.parse(localStorage.getItem('isp_clients') || '[]');
        
        document.getElementById('app-content').innerHTML = `
            <div class="space-y-6 content-fade">
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 class="text-2xl font-bold text-white">Clientes</h1>
                        <p class="text-gray-400 text-sm mt-1">Gestão completa da base de clientes</p>
                    </div>
                    ${Permissions.canPerformAction('criar', 'cliente', user) ? `
                        <button onclick="Clientes.openModal()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
                            <i class="fas fa-plus"></i><span>Novo Cliente</span>
                        </button>
                    ` : ''}
                </div>
                
                <div class="bg-gray-800 border border-gray-700 rounded-xl p-4">
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div><label class="block text-xs text-gray-400 mb-1">Buscar</label>
                            <input type="text" id="filter-search" placeholder="Nome, CPF, telefone..." class="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"></div>
                        <div><label class="block text-xs text-gray-400 mb-1">Status</label>
                            <select id="filter-status" class="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none">
                                <option value="">Todos</option>
                                <option value="NOVO_LEAD">Novo Lead</option>
                                <option value="VIABILIDADE_APROVADA">Viabilidade Aprovada</option>
                                <option value="CADASTRADO">Cadastrado</option>
                                <option value="AGUARDANDO_ASSINATURA">Aguardando Assinatura</option>
                                <option value="ATIVO">Ativo</option>
                                <option value="INADIMPLENTE">Inadimplente</option>
                            </select></div>
                        <div><label class="block text-xs text-gray-400 mb-1">Plano</label>
                            <select id="filter-plan" class="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none">
                                <option value="">Todos</option>
                            </select></div>
                        <div class="flex items-end">
                            <button onclick="Clientes.applyFilters()" class="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm">
                                <i class="fas fa-filter mr-2"></i>Filtrar</button></div>
                    </div>
                </div>
                
                <div class="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
                    <table class="w-full"><thead class="bg-gray-900/50"><tr>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Cliente</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Contato</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Plano</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Vencimento</th>
                        <th class="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Ações</th>
                    </tr></thead><tbody id="clients-table-body" class="divide-y divide-gray-700">${this.renderTableRows(clients)}</tbody></table>
                </div>
            </div>
            
            <div id="client-modal" class="hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div class="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                    <div class="sticky top-0 bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
                        <h2 class="text-xl font-bold text-white">Novo Cliente</h2>
                        <button onclick="Clientes.closeModal()" class="text-gray-400 hover:text-white"><i class="fas fa-times text-xl"></i></button>
                    </div>
                    <form id="client-form" class="p-6 space-y-6">
                        <div><h3 class="text-lg font-semibold text-white mb-4">Dados Pessoais</h3>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div class="md:col-span-2"><label class="block text-sm text-gray-400 mb-1">Nome Completo *</label>
                                    <input type="text" name="nome" required class="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"></div>
                                <div><label class="block text-sm text-gray-400 mb-1">CPF *</label>
                                    <input type="text" name="cpf" required maxlength="14" class="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"></div>
                                <div><label class="block text-sm text-gray-400 mb-1">Data de Nascimento</label>
                                    <input type="date" name="nascimento" class="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"></div>
                                <div><label class="block text-sm text-gray-400 mb-1">Telefone/WhatsApp *</label>
                                    <input type="tel" name="telefone" required class="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"></div>
                                <div><label class="block text-sm text-gray-400 mb-1">E-mail</label>
                                    <input type="email" name="email" class="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"></div>
                            </div></div>
                        <div><h3 class="text-lg font-semibold text-white mb-4">Endereço</h3>
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div><label class="block text-sm text-gray-400 mb-1">CEP *</label>
                                    <input type="text" name="cep" required onchange="Clientes.buscarCEP(this.value)" class="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"></div>
                                <div class="md:col-span-2"><label class="block text-sm text-gray-400 mb-1">Rua/Avenida *</label>
                                    <input type="text" name="rua" required class="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"></div>
                                <div><label class="block text-sm text-gray-400 mb-1">Número *</label>
                                    <input type="text" name="numero" required class="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"></div>
                                <div><label class="block text-sm text-gray-400 mb-1">Complemento</label>
                                    <input type="text" name="complemento" class="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"></div>
                                <div><label class="block text-sm text-gray-400 mb-1">Bairro *</label>
                                    <input type="text" name="bairro" required class="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"></div>
                                <div><label class="block text-sm text-gray-400 mb-1">Cidade *</label>
                                    <input type="text" name="cidade" required class="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"></div>
                                <div><label class="block text-sm text-gray-400 mb-1">UF *</label>
                                    <select name="uf" required class="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none">
                                        <option value="">Selecione</option><option value="SP">São Paulo</option><option value="RJ">Rio de Janeiro</option><option value="MG">Minas Gerais</option><option value="RS">Rio Grande do Sul</option>
                                    </select></div>
                            </div></div>
                        <div><h3 class="text-lg font-semibold text-white mb-4">Plano e Pagamento</h3>
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div><label class="block text-sm text-gray-400 mb-1">Plano *</label>
                                    <select name="plano" required onchange="Clientes.updateValor(this)" class="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none">
                                        <option value="">Selecione</option>
                                    </select></div>
                                <div><label class="block text-sm text-gray-400 mb-1">Dia de Vencimento *</label>
                                    <select name="vencimento" required class="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none">
                                        <option value="">Selecione</option>
                                    </select></div>
                                <div><label class="block text-sm text-gray-400 mb-1">Valor (R$)</label>
                                    <input type="number" name="valor" step="0.01" readonly class="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-3 py-2 text-white"></div>
                            </div></div>
                        <div class="flex gap-3 pt-4 border-t border-gray-700">
                            <button type="button" onclick="Clientes.closeModal()" class="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700">Cancelar</button>
                            <button type="submit" class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"><i class="fas fa-save mr-2"></i>Salvar</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        this.populateSelects();
        this.setupFormHandlers();
    },
    
    populateSelects() {
        const plans = JSON.parse(localStorage.getItem('isp_plans') || '[]');
        const planSelect = document.getElementById('filter-plan');
        const planoSelect = document.querySelector('[name="plano"]');
        const vencSelect = document.querySelector('[name="vencimento"]');
        
        if (planSelect && plans.length > 0) {
            plans.forEach(p => {
                const opt = document.createElement('option');
                opt.value = p.nome; opt.textContent = p.nome;
                planSelect.appendChild(opt);
            });
        }
        
        if (planoSelect && plans.length > 0) {
            plans.forEach(p => {
                const opt = document.createElement('option');
                opt.value = p.nome; opt.dataset.value = p.valor;
                opt.textContent = `${p.nome} - R$ ${p.valor.toFixed(2)}`;
                planoSelect.appendChild(opt);
            });
        }
        
        if (vencSelect) {
            for (let i = 1; i <= 28; i++) {
                const opt = document.createElement('option');
                opt.value = i; opt.textContent = `Dia ${i}`;
                vencSelect.appendChild(opt);
            }
        }
    },
    
    renderTableRows(clients) {
        if (!clients.length) return '<tr><td colspan="6" class="px-4 py-8 text-center text-gray-500">Nenhum cliente</td></tr>';
        const colors = { 'NOVO_LEAD': 'bg-gray-500/20 text-gray-400', 'VIABILIDADE_APROVADA': 'bg-blue-500/20 text-blue-400', 'CADASTRADO': 'bg-indigo-500/20 text-indigo-400', 'AGUARDANDO_ASSINATURA': 'bg-yellow-500/20 text-yellow-400', 'ATIVO': 'bg-green-500/20 text-green-400', 'INADIMPLENTE': 'bg-red-500/20 text-red-400' };
        return clients.map(c => `<tr class="hover:bg-gray-700/30">
            <td class="px-4 py-3"><div class="flex items-center gap-3"><div class="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center"><i class="fas fa-user text-blue-400"></i></div><div><p class="text-white font-medium">${c.nome}</p><p class="text-gray-500 text-xs">${c.cpf}</p></div></div></td>
            <td class="px-4 py-3"><p class="text-gray-300 text-sm">${c.telefone}</p><p class="text-gray-500 text-xs">${c.email||'-'}</p></td>
            <td class="px-4 py-3"><p class="text-white text-sm">${c.plano}</p><p class="text-gray-500 text-xs">R$ ${(c.valor||0).toFixed(2)}</p></td>
            <td class="px-4 py-3"><span class="px-2 py-1 rounded-full text-xs ${colors[c.status]||'bg-gray-500/20'}">${c.status.replace('_',' ')}</span></td>
            <td class="px-4 py-3 text-gray-300 text-sm">Dia ${c.vencimento||'-'}</td>
            <td class="px-4 py-3 text-right"><button onclick="Clientes.viewClient(${c.id})" class="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-blue-400"><i class="fas fa-eye"></i></button></td>
        </tr>`).join('');
    },
    
    setupFormHandlers() {
        document.getElementById('client-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const fd = new FormData(e.target);
            const clients = JSON.parse(localStorage.getItem('isp_clients') || '[]');
            clients.push({
                id: Date.now(), nome: fd.get('nome'), cpf: fd.get('cpf').replace(/\D/g,''),
                telefone: fd.get('telefone'), email: fd.get('email'),
                endereco: `${fd.get('rua')}, ${fd.get('numero')} ${fd.get('complemento')||''}`,
                cep: fd.get('cep').replace(/\D/g,''), cidade: fd.get('cidade'), uf: fd.get('uf'),
                plano: fd.get('plano'), valor: parseFloat(fd.get('valor'))||0,
                vencimento: parseInt(fd.get('vencimento')), status: 'CADASTRADO',
                data_criacao: new Date().toISOString()
            });
            localStorage.setItem('isp_clients', JSON.stringify(clients));
            Toast.success('Cliente cadastrado!');
            this.closeModal();
            this.render();
        });
    },
    
    async buscarCEP(cep) {
        cep = cep.replace(/\D/g, '');
        if (cep.length !== 8) return;
        try {
            const r = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const d = await r.json();
            if (!d.erro) {
                const f = document.getElementById('client-form');
                f.querySelector('[name="rua"]').value = d.logradouro;
                f.querySelector('[name="bairro"]').value = d.bairro;
                f.querySelector('[name="cidade"]').value = d.localidade;
                f.querySelector('[name="uf"]').value = d.uf;
            }
        } catch(e) { console.error(e); }
    },
    
    updateValor(select) {
        const val = select.options[select.selectedIndex]?.dataset.value || 0;
        select.form.querySelector('[name="valor"]').value = val;
    },
    
    openModal() { document.getElementById('client-modal').classList.remove('hidden'); },
    closeModal() { document.getElementById('client-modal').classList.add('hidden'); document.getElementById('client-form')?.reset(); },
    
    applyFilters() {
        const s = document.getElementById('filter-search')?.value.toLowerCase() || '';
        const st = document.getElementById('filter-status')?.value || '';
        const p = document.getElementById('filter-plan')?.value || '';
        let c = JSON.parse(localStorage.getItem('isp_clients') || '[]');
        if (s) c = c.filter(x => x.nome.toLowerCase().includes(s) || x.cpf.includes(s));
        if (st) c = c.filter(x => x.status === st);
        if (p) c = c.filter(x => x.plano === p);
        document.getElementById('clients-table-body').innerHTML = this.renderTableRows(c);
    },
    
    viewClient(id) { Toast.info(`Ver cliente ${id}`); },
    editClient(id) { Toast.info(`Editar cliente ${id}`); }
};
</script>
