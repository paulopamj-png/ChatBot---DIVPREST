// ============================================================
//  RESPOSTAS.JS — Configurado pelo gestor
//  Edite este arquivo para adicionar, remover ou alterar
//  perguntas e respostas do chatbot.
// ============================================================

// ----------------------------------------------------------
// MENU PRINCIPAL
// Exibido quando o usuário digita "menu", "oi", "olá", etc.
// ----------------------------------------------------------
const MENU = `Olá! 👋 Bem-vindo ao atendimento de *Prestação de Contas*.

Escolha uma opção:
1️⃣  Prazo de entrega de prestação de contas
2️⃣  Documentos necessários
3️⃣  Como enviar os documentos
4️⃣  Status da análise
5️⃣  Devoluções e pendências
6️⃣  Falar com um atendente
0️⃣  Repetir este menu`;

// ----------------------------------------------------------
// RESPOSTAS POR OPÇÃO NUMÉRICA
// Chave = número que o usuário digita
// ----------------------------------------------------------
const OPCOES = {
  "1": `📅 *Prazo de entrega — Prestação de Contas*

• O prazo padrão é de *30 dias* após o encerramento do exercício.
• Convênios e contratos específicos podem ter prazo diferenciado — consulte o instrumento firmado.
• Entregas fora do prazo estão sujeitas a notificação e glosa.

ℹ️ Dúvidas adicionais? Digite *0* para voltar ao menu.`,

  "2": `📄 *Documentos necessários*

Para a prestação de contas você precisará de:
• Relatório de execução físico-financeira
• Extrato bancário do período
• Notas fiscais e recibos originais
• Relação de pagamentos efetuados
• Fotos de execução (quando aplicável)

ℹ️ Digite *0* para voltar ao menu.`,

  "3": `📤 *Como enviar os documentos*

Os documentos devem ser entregues:
• *Presencialmente:* Setor de Prestação de Contas — Sala 12, Bloco B
• *Digitalmente:* sistema.prefeitura.gov.br/prestacao (formato PDF)
• *E-mail:* prestacaodecontas@setor.gov.br

⚠️ Documentos digitais devem estar legíveis e sem rasuras.

ℹ️ Digite *0* para voltar ao menu.`,

  "4": `🔍 *Status da análise*

Para consultar o andamento do seu processo:
• Acesse o portal: sistema.prefeitura.gov.br/prestacao
• Informe o número do convênio ou contrato
• O status é atualizado em até *2 dias úteis*

ℹ️ Para atendimento personalizado, digite *6*.`,

  "5": `⚠️ *Devoluções e pendências*

Se você recebeu uma notificação de pendência:
• Regularize dentro do prazo indicado na notificação
• Reenvie apenas os documentos solicitados
• Identifique no e-mail o número do processo

Devolução de valores: deve ser feita via GRU (Guia de Recolhimento) emitida pelo sistema.

ℹ️ Digite *0* para voltar ao menu ou *6* para falar com atendente.`,

  "6": `👤 *Atendimento humano*

Você será transferido para um de nossos atendentes.
⏱️ Horário: segunda a sexta, das 8h às 17h.

Por favor, aguarde. Um atendente irá te chamar em breve.`,

  "0": null, // volta ao menu (tratado no código)
};

// ----------------------------------------------------------
// PALAVRAS-CHAVE
// Permite acionar respostas por palavras, não só números.
// Adicione quantas palavras quiser em cada array.
// ----------------------------------------------------------
const PALAVRAS_CHAVE = [
  {
    palavras: ["oi", "olá", "ola", "boa tarde", "bom dia", "boa noite", "menu", "inicio", "início", "começar"],
    resposta: "MENU",
  },
  {
    palavras: ["prazo", "data", "quando", "vencimento", "deadline"],
    resposta: "1",
  },
  {
    palavras: ["documento", "documentos", "doc", "papel", "papeis", "papéis", "exigência", "exigencia"],
    resposta: "2",
  },
  {
    palavras: ["enviar", "envio", "entregar", "entrega", "mandar", "submeter"],
    resposta: "3",
  },
  {
    palavras: ["status", "andamento", "situação", "situacao", "acompanhar", "consultar"],
    resposta: "4",
  },
  {
    palavras: ["pendencia", "pendência", "devolução", "devolucao", "glosa", "irregularidade", "notificação", "notificacao"],
    resposta: "5",
  },
  {
    palavras: ["atendente", "humano", "pessoa", "ajuda", "suporte", "falar"],
    resposta: "6",
  },
];

// ----------------------------------------------------------
// RESPOSTA PADRÃO
// Exibida quando nenhuma opção for reconhecida.
// ----------------------------------------------------------
const NAO_ENTENDIDO = `Desculpe, não entendi sua mensagem. 🤔

Digite *0* para ver o menu de opções ou *6* para falar com um atendente.`;

// ============================================================
//  EXPORTAÇÕES (não alterar abaixo desta linha)
// ============================================================
module.exports = { MENU, OPCOES, PALAVRAS_CHAVE, NAO_ENTENDIDO };
