// ============================================================
//  dados.js — gerado pelo painel de gestão (aba PDFs)
//  Contém dados extraídos dos PDFs pelo gestor.
//  NÃO edite manualmente — use o painel admin/index.html
// ============================================================

// Tabela de prazos extraída do PDF
// O bot mostra prazoBot (= prazoReal - 15 dias) ao usuário
const PRAZOS = [
  // Exemplo — substitua pelos dados reais via painel:
  // { empenho:'NE2024001', ob:'OB001', valor:'R$ 5.000,00', prazoReal:'2026-06-16', prazoBot:'2026-06-01' },
];

// Texto extraído do PDF de regras de suprimentos de fundos
// Usado pela IA para responder dúvidas dos servidores
const SUPRIMENTOS_TEXTO = `
(Nenhum PDF de suprimentos carregado ainda.
Importe o PDF no painel de gestão, aba PDFs.)
`;

module.exports = { PRAZOS, SUPRIMENTOS_TEXTO };
