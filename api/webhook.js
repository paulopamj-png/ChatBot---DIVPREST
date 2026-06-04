// ============================================================
//  api/webhook.js — Meta Cloud API + Prazos + Suprimentos IA
// ============================================================
const { obterResposta } = require('../respostas');

let dados = { PRAZOS: [], SUPRIMENTOS_TEXTO: '' };
try { dados = require('../dados'); } catch(e) { /* dados.js opcional */ }

const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN;
const ACCESS_TOKEN = process.env.META_TOKEN;
const PHONE_ID     = process.env.META_PHONE_ID;
const ANTHROPIC_KEY= process.env.ANTHROPIC_API_KEY; // para suprimentos IA

// ── Estado por usuário ─────────────────────────────────────
// { stack:[], awaiting: null|'prazo_empenho'|'suprimentos_pergunta' }
const _estado = new Map();
function getEstado(phone) {
  if (!_estado.has(phone)) _estado.set(phone, { stack: [], awaiting: null });
  return _estado.get(phone);
}

// ── Handler principal ──────────────────────────────────────
module.exports = async function handler(req, res) {
  if (req.method === 'GET') {
    const { 'hub.mode': mode, 'hub.verify_token': token, 'hub.challenge': challenge } = req.query;
    if (mode === 'subscribe' && token === VERIFY_TOKEN) return res.status(200).send(challenge);
    return res.status(403).send('Forbidden');
  }
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const msg = req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    if (!msg || msg.type !== 'text') return res.status(200).json({ ok: true });

    const phone = msg.from;
    const texto = msg.text?.body?.trim() || '';
    if (!texto) return res.status(200).json({ ok: true });

    const resposta = await processarMensagem(phone, texto);
    await enviarMensagem(phone, resposta);
    return res.status(200).json({ ok: true });

  } catch (err) {
    console.error('Erro webhook:', err);
    return res.status(500).json({ error: 'Erro interno' });
  }
};

// ── Motor de processamento ─────────────────────────────────
async function processarMensagem(phone, texto) {
  const estado = getEstado(phone);
  const t = norm(texto);

  // ── Aguardando número do empenho ──
  if (estado.awaiting === 'prazo_empenho') {
    estado.awaiting = null;
    if (t === '0') { estado.stack = []; return obterResposta(phone, 'menu'); }
    return buscarPrazo(texto);
  }

  // ── Aguardando pergunta sobre suprimentos ──
  if (estado.awaiting === 'suprimentos_pergunta') {
    estado.awaiting = null;
    if (t === '0') { estado.stack = []; return obterResposta(phone, 'menu'); }
    return await consultarSuprimentos(texto);
  }

  // ── Palavras-chave especiais ──
  if (t.includes('prazo') || t.includes('empenho') || t.includes('prestacao') || t.includes('prestação')) {
    estado.awaiting = 'prazo_empenho';
    return `🔍 *Consulta de Prazo*\n\nInforme o *número do empenho* (ex: NE2024001) ou o *número da OB*.\n\n_Digite 0 para voltar ao menu._`;
  }
  if (t.includes('suprimento') || t.includes('comprar') || t.includes('recurso') || t.includes('pode usar')) {
    estado.awaiting = 'suprimentos_pergunta';
    return `💼 *Consulta de Suprimentos de Fundos*\n\nDigite sua dúvida. Exemplo:\n• "Posso comprar material de escritório?"\n• "Combustível é permitido?"\n\n_Digite 0 para voltar ao menu._`;
  }

  // ── Fluxo padrão de menus ──
  const resposta = obterResposta(phone, texto);

  // Detecta se a resposta indica entrada em fluxo de prazo ou suprimentos
  if (resposta && resposta.includes('FLUXO:PRAZO')) {
    estado.awaiting = 'prazo_empenho';
    return `🔍 *Consulta de Prazo para Prestação de Contas*\n\nInforme o *número do empenho* ou *número da OB*.\n\n_Digite 0 para voltar ao menu._`;
  }
  if (resposta && resposta.includes('FLUXO:SUPRIMENTOS')) {
    estado.awaiting = 'suprimentos_pergunta';
    return `💼 *Consulta de Suprimentos de Fundos*\n\nDigite sua dúvida sobre o que pode ou não ser adquirido.\n\n_Digite 0 para voltar ao menu._`;
  }

  return resposta;
}

// ── Busca prazo no dados.js e subtrai 15 dias ─────────────
function buscarPrazo(consulta) {
  const c = norm(consulta);
  if (!dados.PRAZOS || !dados.PRAZOS.length) {
    return `⚠️ Nenhum dado de prazos carregado ainda.\nO gestor precisa importar o PDF no painel e publicar o dados.js.\n\nDigite *0* para o menu.`;
  }

  const item = dados.PRAZOS.find(p =>
    norm(p.empenho).includes(c) ||
    norm(p.ob).includes(c) ||
    c.includes(norm(p.empenho)) ||
    c.includes(norm(p.ob))
  );

  if (!item) {
    return `❌ Não encontrei o empenho/OB *"${consulta}"* na base de dados.\n\nVerifique o número e tente novamente, ou digite *0* para voltar ao menu.`;
  }

  const prazoFormatado = formatarData(item.prazoBot);
  const prazoReal = formatarData(item.prazoReal);

  return `📅 *Prazo para Prestação de Contas*\n\n` +
    `• Empenho: *${item.empenho}*\n` +
    `• Nº OB: *${item.ob}*\n` +
    `• Valor: *${item.valor}*\n\n` +
    `⚠️ *Prazo limite: ${prazoFormatado}*\n` +
    `_(prazo do documento: ${prazoReal})_\n\n` +
    `_Atenção: o prazo exibido já considera a antecipação de 15 dias para organização da documentação._\n\n` +
    `Digite *0* para voltar ao menu.`;
}

// ── Consulta IA sobre suprimentos ─────────────────────────
async function consultarSuprimentos(pergunta) {
  if (!dados.SUPRIMENTOS_TEXTO || dados.SUPRIMENTOS_TEXTO.includes('Nenhum PDF')) {
    return `⚠️ Nenhuma regra de suprimentos carregada ainda.\nO gestor precisa importar o PDF no painel.\n\nDigite *0* para o menu.`;
  }
  if (!ANTHROPIC_KEY) {
    return `⚠️ A funcionalidade de IA para suprimentos requer a variável ANTHROPIC_API_KEY na Vercel.\n\nDigite *0* para o menu.`;
  }

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 400,
        system: `Você é um assistente especializado em suprimentos de fundos do setor público brasileiro. Responda de forma clara, direta e objetiva se o item ou despesa perguntado é PERMITIDO ou NÃO PERMITIDO, baseando-se nas regras abaixo. Sempre indique ✅ para permitido ou ❌ para não permitido. Seja conciso — máximo 5 linhas. Finalize com "Digite 0 para o menu."\n\nREGRAS DE SUPRIMENTOS:\n${dados.SUPRIMENTOS_TEXTO}`,
        messages: [{ role: 'user', content: pergunta }],
      }),
    });
    const data = await r.json();
    return data.content?.[0]?.text || 'Não foi possível processar a consulta. Digite *0* para o menu.';
  } catch (err) {
    console.error('Erro IA suprimentos:', err);
    return `❌ Erro ao consultar a IA. Tente novamente.\n\nDigite *0* para o menu.`;
  }
}

// ── Enviar mensagem Meta API ───────────────────────────────
async function enviarMensagem(para, texto) {
  const url = `https://graph.facebook.com/v19.0/${PHONE_ID}/messages`;
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${ACCESS_TOKEN}` },
    body: JSON.stringify({ messaging_product: 'whatsapp', to: para, type: 'text', text: { body: texto } }),
  });
  if (!r.ok) throw new Error(`Meta API ${r.status}: ${await r.text()}`);
  return r.json();
}

// ── Utils ──────────────────────────────────────────────────
function norm(s) {
  return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

function formatarData(iso) {
  if (!iso) return '(data não informada)';
  try {
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
  } catch { return iso; }
}
