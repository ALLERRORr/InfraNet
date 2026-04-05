# ISP Manager Pro - Sistema de Gestão para Provedores FTTH

Sistema completo de gestão para provedores de internet via fibra óptica (FTTH), desenvolvido em HTML puro, Tailwind CSS e JavaScript vanilla.

## 🚀 Funcionalidades

### Módulos Implementados
- **Dashboard** - Visão geral com KPIs e gráficos
- **Clientes** - Cadastro e gestão completa de clientes
- **Ordens de Serviço** - Criação, agendamento e finalização de OS
- **Portal do Cliente** - Assinatura digital de contratos
- **Contratos** - Gestão de contratos e assinaturas

### Features
- ✅ Autenticação com sistema de roles (10 níveis)
- ✅ Controle de permissões por módulo e ação
- ✅ Dark mode nativo
- ✅ Responsivo (mobile-first)
- ✅ SPA (Single Page Application)
- ✅ Dados persistentes via localStorage
- ✅ Notificações toast
- ✅ Sidebar dinâmica baseada em permissões

## 👥 Roles e Permissões

| Role | Nível | Acesso |
|------|-------|--------|
| TI | 1 | Monitoramento, MikroTik, OLTs, InfraMaps |
| Marketing | 2 | E-mail marketing + TI |
| Comercial | 3 | Clientes, Funil, Contratos + Marketing |
| Financeiro | 4 | Módulo financeiro + Comercial |
| Suporte | 5 | OS, Atendimento, VoIP + Financeiro |
| Analista | 6 | Relatórios + Suporte |
| Supervisor | 7 | Aprovações + Analista |
| Diretoria | 8 | Visão executiva + Supervisor |
| CEO | 9 | Gestão completa + Diretoria |
| SuperUser | 10 | Acesso total + Admin |

## 🔐 Credenciais de Teste

```
SuperUser: super@provedor.com / super123
CEO: ceo@provedor.com / ceo123
Comercial: comercial@provedor.com / com123
Suporte: suporte@provedor.com / sup123
TI: ti@provedor.com / ti123
Financeiro: financeiro@provedor.com / fin123
```

## 📁 Estrutura de Arquivos

```
/workspace/
├── index.html              # Tela de login
├── app.html                # Aplicação principal (SPA)
├── portal.html             # Portal do cliente
├── js/
│   ├── core/
│   │   ├── data.js         # Seed de dados mock
│   │   ├── auth.js         # Autenticação
│   │   ├── permissions.js  # Matriz de permissões
│   │   └── router.js       # Router SPA
│   ├── components/
│   │   ├── sidebar.js      # Menu lateral
│   │   ├── header.js       # Barra superior
│   │   └── toast.js        # Notificações
│   └── pages/
│       ├── clientes.js     # Módulo de clientes
│       └── ordens-servico.js # Módulo de OS
└── css/                    # Estilos customizados
```

## 🛠️ Como Usar

### 1. Abrir o Sistema
Basta abrir `index.html` em qualquer navegador moderno.

### 2. Fluxo Completo FTTH

#### Para Comercial:
1. Faça login como `comercial@provedor.com`
2. Vá em "Clientes" → "Novo Cliente"
3. Preencha dados, endereço (busca CEP automática) e plano
4. Cliente será criado com status "CADASTRADO"

#### Para Suporte/Técnico:
1. Login como `suporte@provedor.com`
2. Vá em "Ordens de Serviço" → "Nova OS"
3. Selecione cliente, técnico, data/hora
4. OS criada com status "AGENDADA"

#### Para Técnico (campo):
1. Abra a OS agendada
2. Clique em "Comodatos"
3. Registre equipamentos (ONU, roteador, etc.)
4. Finalize OS → status muda para "INSTALADA"

#### Para Cliente (assinatura):
1. Acesse `portal.html`
2. Digite CPF do cliente
3. Revise contrato e comodatos
4. Marque aceite e assine digitalmente
5. Status muda para "ATIVO"

## 💾 Dados Mock

O sistema já inicia com dados de exemplo:
- 10 usuários de diferentes roles
- 5 clientes em vários estágios
- 2 ordens de serviço
- 3 contratos
- 4 planos de internet
- 3 técnicos

## 🎨 Customização

### Cores da Marca
Edite `tailwind.config` no `<head>` de cada HTML:
```javascript
colors: {
    primary: { 500: '#3b82f6', 600: '#2563eb' },
    secondary: { 500: '#10b981' }
}
```

### Adicionar Novas Páginas
1. Crie arquivo em `js/pages/nome-page.js`
2. Exporte objeto com método `render(params)`
3. Registre rota em `app.html`:
```javascript
Router.register('nome-page', NomePage.render);
```

## 🔌 Integrações Futuras

- [ ] MikroTik API
- [ ] OLTs (Huawei, ZTE, Fiberhome)
- [ ] InfraMaps
- [ ] NVoIP
- [ ] Gateway de pagamento
- [ ] WhatsApp Business API
- [ ] E-mail SMTP

## 📱 Responsividade

- **Desktop**: Sidebar fixa, layout completo
- **Tablet**: Sidebar colapsável
- **Mobile**: Menu hambúrguer, cards otimizados

## 🧪 Testes

Para testar diferentes cenários:
1. Limpe localStorage: `localStorage.clear()`
2. Recarregue a página (dados serão re-seedados)
3. Use credenciais de diferentes roles

## 📄 Licença

MIT License - Uso livre para provedores FTTH.

---

**Desenvolvido para provedores de internet FTTH brasileiros** 🇧🇷
