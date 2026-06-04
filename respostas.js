// ============================================================
//  respostas.js — Motor de menus em cascata
//  Gerado pelo painel de gestão (admin/index.html)
//  Edite pelo painel e exporte — não edite manualmente
// ============================================================

const MENU_WELCOME = `Olá! 👋 Bem-vindo ao atendimento de *Prestação de Contas*.

Escolha uma opção:
1️⃣  Prazo de entrega
2️⃣  Documentos necessários
3️⃣  Status e acompanhamento
4️⃣  Falar com atendente

_Digite o número da opção._`;

const MENU_DEFAULT = `Desculpe, não entendi. 🤔
Digite *0* para o menu ou *4* para falar com atendente.`;

const MENU_TRIGGERS = ["oi","ola","olá","menu","inicio","início","comecar","começar","bom dia","boa tarde","boa noite"];

const TREE = [
  { id:'_a1',key:'1',label:'Prazo de entrega',type:'menu',text:'',keywords:['prazo','data','vencimento','quando'],children:[
    { id:'_a2',key:'1',label:'Convênios federais',type:'answer',keywords:['federal','convenio'],text:'📅 *Prazo — Convênios Federais*\n\n• Prazo: *60 dias* após encerramento da vigência\n• Documentos via SICONV\n\nDigite *0* para o menu.',children:[] },
    { id:'_a3',key:'2',label:'Convênios estaduais',type:'answer',keywords:['estadual'],text:'📅 *Prazo — Convênios Estaduais*\n\n• Prazo: *30 dias* após fim da execução\n\nDigite *0* para o menu.',children:[] },
    { id:'_a4',key:'3',label:'Contratos e emendas',type:'answer',keywords:['contrato','emenda'],text:'📅 *Contratos e Emendas*\n\nConsulte o instrumento firmado.\n\nDigite *0* para o menu.',children:[] },
  ]},
  { id:'_b1',key:'2',label:'Documentos necessários',type:'menu',text:'',keywords:['documento','doc','papel'],children:[
    { id:'_b2',key:'1',label:'Lista de documentos',type:'answer',keywords:['lista','quais'],text:'📄 *Documentos necessários*\n\n• Relatório de execução físico-financeira\n• Extrato bancário\n• Notas fiscais originais\n• Relação de pagamentos\n\nDigite *0* para o menu.',children:[] },
    { id:'_b3',key:'2',label:'Modelos e formulários',type:'link',keywords:['modelo','formulario'],text:'🔗 *Modelos e formulários*\n\nhttps://sistema.prefeitura.gov.br/modelos\n\nDigite *0* para o menu.',children:[] },
  ]},
  { id:'_c1',key:'3',label:'Status e acompanhamento',type:'menu',text:'',keywords:['status','andamento','situacao'],children:[
    { id:'_c2',key:'1',label:'Consultar processo',type:'answer',keywords:['consulta','numero'],text:'🔍 *Consultar situação*\n\nhttps://sistema.prefeitura.gov.br/prestacao\n\nDigite *0* para o menu.',children:[] },
    { id:'_c3',key:'2',label:'Pendências e glosas',type:'menu',keywords:['pendencia','glosa'],text:'',children:[
      { id:'_c4',key:'1',label:'Como regularizar',type:'answer',keywords:['regularizar'],text:'⚠️ *Regularizar pendências*\n\nEnvie os documentos indicados na notificação com o número do processo.\n\nDigite *0* para o menu.',children:[] },
      { id:'_c5',key:'2',label:'Devolução de valores (GRU)',type:'answer',keywords:['devolucao','gru'],text:'💰 *Devolução — GRU*\n\nhttps://sistema.prefeitura.gov.br/gru\n\nDigite *0* para o menu.',children:[] },
    ]},
  ]},
  { id:'_d1',key:'4',label:'Falar com atendente',type:'transfer',text:'👤 *Atendimento humano*\n\nAguarde — seg–sex, 8h–17h.\nUm atendente irá te chamar.',keywords:['atendente','humano','falar','ajuda'],children:[] },
];

// --- Motor de navegação ---
function _norm(s){ return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim(); }

function _findKw(t, nodes){
  for(const n of nodes){
    if((n.keywords||[]).some(k => t.includes(_norm(k)))) return n;
    if(n.children){ const r = _findKw(t, n.children); if(r) return r; }
  }
  return null;
}

function _subMenu(n){
  let s = n.text ? n.text+'\n\n' : '*'+n.label+'*\n\n';
  s += n.children.map(c => c.key+'  '+c.label).join('\n');
  s += '\n\n_0  Menu principal_';
  return s;
}

const _stacks = new Map();

function obterResposta(phone, mensagem){
  const t = _norm(mensagem);
  const stack = _stacks.get(phone) || [];

  if(MENU_TRIGGERS.some(k => t === _norm(k)) || t === '0'){
    _stacks.set(phone, []);
    return MENU_WELCOME;
  }

  let ctx = TREE;
  for(const id of stack){
    const n = ctx.find(x => x.id === id);
    if(n && n.children) ctx = n.children;
    else { ctx = TREE; break; }
  }

  let found = ctx.find(n => _norm(n.key) === t) || _findKw(t, TREE);
  if(!found) return MENU_DEFAULT;

  if(found.type === 'menu'){
    stack.push(found.id);
    _stacks.set(phone, stack);
    return _subMenu(found);
  }

  _stacks.set(phone, []);
  return found.text || '(sem resposta: '+found.label+')';
}

module.exports = { obterResposta };
