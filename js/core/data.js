// js/core/data.js
/**
 * ISP Manager Pro - Seed de Dados Mock
 * Popula localStorage com dados iniciais para demonstração
 */

const DataSeed = {
    init() {
        // Verifica se já existem dados
        if (localStorage.getItem('isp_users')) return;
        
        // Seed inicial
        this.seedUsers();
        this.seedPlans();
        this.seedClients();
        this.seedTechs();
        this.seedOrders();
        this.seedContracts();
        
        console.log('[ISP Manager] Dados mock inicializados!');
    },
    
    seedUsers() {
        const users = [
            { id: 1, nome: 'Super Usuário', email: 'super@provedor.com', senha: 'super123', role: 'SuperUser', ativo: true },
            { id: 2, nome: 'CEO', email: 'ceo@provedor.com', senha: 'ceo123', role: 'CEO', ativo: true },
            { id: 3, nome: 'Diretor Comercial', email: 'diretor@provedor.com', senha: 'dir123', role: 'Diretoria', ativo: true },
            { id: 4, nome: 'Supervisor Suporte', email: 'supervisor@provedor.com', senha: 'sup123', role: 'Supervisor', ativo: true },
            { id: 5, nome: 'Analista Financeiro', email: 'analista@provedor.com', senha: 'ana123', role: 'Analista', ativo: true },
            { id: 6, nome: 'Técnico Suporte', email: 'suporte@provedor.com', senha: 'sup123', role: 'Suporte', ativo: true },
            { id: 7, nome: 'Gerente Financeiro', email: 'financeiro@provedor.com', senha: 'fin123', role: 'Financeiro', ativo: true },
            { id: 8, nome: 'Vendedor', email: 'comercial@provedor.com', senha: 'com123', role: 'Comercial', ativo: true },
            { id: 9, nome: 'Marketing', email: 'marketing@provedor.com', senha: 'mkt123', role: 'Marketing', ativo: true },
            { id: 10, nome: 'Técnico TI', email: 'ti@provedor.com', senha: 'ti123', role: 'TI', ativo: true }
        ];
        localStorage.setItem('isp_users', JSON.stringify(users));
    },
    
    seedPlans() {
        const plans = [
            { id: 1, nome: 'Fibra 300 MEGA', velocidade: 300, valor: 89.90, descricao: 'Ideal para famílias' },
            { id: 2, nome: 'Fibra 500 MEGA', velocidade: 500, valor: 109.90, descricao: 'Para gamers e streamers' },
            { id: 3, nome: 'Fibra 1 GIGA', velocidade: 1000, valor: 149.90, descricao: 'Máxima velocidade' },
            { id: 4, nome: 'Empresarial 200 MEGA', velocidade: 200, valor: 199.90, descricao: 'IP fixo + suporte prioritário' }
        ];
        localStorage.setItem('isp_plans', JSON.stringify(plans));
    },
    
    seedClients() {
        const clients = [
            { 
                id: 1001, 
                nome: 'João Silva Santos', 
                cpf: '12345678901', 
                telefone: '(11) 99999-1111', 
                email: 'joao.silva@email.com',
                endereco: 'Rua das Flores, 123 - Centro',
                cep: '01234567', cidade: 'São Paulo', uf: 'SP',
                plano: 'Fibra 300 MEGA', valor: 89.90, vencimento: 10,
                status: 'ATIVO', data_criacao: '2025-01-15T10:00:00Z'
            },
            { 
                id: 1002, 
                nome: 'Maria Oliveira Costa', 
                cpf: '23456789012', 
                telefone: '(11) 99999-2222', 
                email: 'maria.oliveira@email.com',
                endereco: 'Av. Brasil, 456 - Jardim América',
                cep: '01234568', cidade: 'São Paulo', uf: 'SP',
                plano: 'Fibra 500 MEGA', valor: 109.90, vencimento: 15,
                status: 'AGUARDANDO_ASSINATURA', data_criacao: '2025-02-20T14:30:00Z'
            },
            { 
                id: 1003, 
                nome: 'Pedro Henrique Lima', 
                cpf: '34567890123', 
                telefone: '(11) 99999-3333', 
                email: 'pedro.lima@email.com',
                endereco: 'Rua do Comércio, 789 - Vila Nova',
                cep: '01234569', cidade: 'São Paulo', uf: 'SP',
                plano: 'Fibra 1 GIGA', valor: 149.90, vencimento: 5,
                status: 'CADASTRADO', data_criacao: '2025-03-10T09:15:00Z'
            },
            { 
                id: 1004, 
                nome: 'Ana Paula Ferreira', 
                cpf: '45678901234', 
                telefone: '(11) 99999-4444', 
                email: 'ana.ferreira@email.com',
                endereco: 'Rua das Palmeiras, 321 - Centro',
                cep: '01234570', cidade: 'São Paulo', uf: 'SP',
                plano: 'Fibra 300 MEGA', valor: 89.90, vencimento: 20,
                status: 'INADIMPLENTE', data_criacao: '2024-11-05T16:45:00Z'
            },
            { 
                id: 1005, 
                nome: 'Carlos Eduardo Souza', 
                cpf: '56789012345', 
                telefone: '(11) 99999-5555', 
                email: 'carlos.souza@email.com',
                endereco: 'Av. Paulista, 1000 - Bela Vista',
                cep: '01234571', cidade: 'São Paulo', uf: 'SP',
                plano: 'Empresarial 200 MEGA', valor: 199.90, vencimento: 1,
                status: 'VIABILIDADE_APROVADA', data_criacao: '2025-03-25T11:00:00Z'
            }
        ];
        localStorage.setItem('isp_clients', JSON.stringify(clients));
    },
    
    seedTechs() {
        const techs = [
            { id: 1, nome: 'Roberto Alves', telefone: '(11) 98888-1111', especialidade: 'Instalação FTTH', status: 'DISPONIVEL' },
            { id: 2, nome: 'Fernando Costa', telefone: '(11) 98888-2222', especialidade: 'Manutenção', status: 'EM_ATENDIMENTO' },
            { id: 3, nome: 'Lucas Martins', telefone: '(11) 98888-3333', especialidade: 'Instalação + Configuração', status: 'DISPONIVEL' }
        ];
        localStorage.setItem('isp_techs', JSON.stringify(techs));
    },
    
    seedOrders() {
        const orders = [
            {
                id: 5001,
                tipo: 'INSTALACAO',
                cliente_id: 1003,
                tecnico_id: 1,
                data_agendada: '2025-04-10',
                horario: '14:00',
                status: 'AGENDADA',
                observacoes: 'Cliente prefere período da tarde. Portão azul.',
                comodatos: [],
                data_criacao: '2025-03-28T10:00:00Z'
            },
            {
                id: 5002,
                tipo: 'MANUTENCAO',
                cliente_id: 1001,
                tecnico_id: 2,
                data_agendada: '2025-04-08',
                horario: '09:00',
                status: 'EM_ANDAMENTO',
                observacoes: 'Cliente relata lentidão intermitente. Verificar sinal óptico.',
                comodatos: [],
                data_criacao: '2025-04-01T15:30:00Z'
            }
        ];
        localStorage.setItem('isp_orders', JSON.stringify(orders));
    },
    
    seedContracts() {
        const contracts = [
            {
                id: 3001,
                cliente_id: 1001,
                plano: 'Fibra 300 MEGA',
                valor: 89.90,
                vencimento: 10,
                fidelidade: 12,
                status: 'ASSINADO',
                data_assinatura: '2025-01-16T10:00:00Z',
                ip_cliente: '192.168.1.100',
                user_agent: 'Mozilla/5.0...'
            },
            {
                id: 3002,
                cliente_id: 1002,
                plano: 'Fibra 500 MEGA',
                valor: 109.90,
                vencimento: 15,
                fidelidade: 12,
                status: 'PENDENTE',
                data_criacao: '2025-02-21T09:00:00Z'
            },
            {
                id: 3003,
                cliente_id: 1003,
                plano: 'Fibra 1 GIGA',
                valor: 149.90,
                vencimento: 5,
                fidelidade: 12,
                status: 'AGUARDANDO_ASSINATURA',
                data_criacao: '2025-03-11T08:00:00Z'
            }
        ];
        localStorage.setItem('isp_contracts', JSON.stringify(contracts));
    }
};

// Inicializa seed automaticamente
DataSeed.init();
</script>
