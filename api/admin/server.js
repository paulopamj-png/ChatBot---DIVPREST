// ============================================================
//  admin/server.js — Servidor local para o painel de gestão
//  Salva o chatbot-config.json automaticamente ao clicar Salvar
//
//  Como usar:
//    cd admin
//    node server.js
//  Depois abra: http://localhost:4000
// ============================================================

const http = require('http');
const fs   = require('fs');
const path = require('path');

const PORT        = 4000;
const CONFIG_FILE = path.join(__dirname, 'chatbot-config.json');
const HTML_FILE   = path.join(__dirname, 'index.html');

// ── Tipos MIME básicos ──────────────────────────────────────
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript',
  '.json': 'application/json',
  '.css':  'text/css',
  '.png':  'image/png',
  '.ico':  'image/x-icon',
};

// ── Servidor HTTP ───────────────────────────────────────────
const server = http.createServer((req, res) => {
  const url = req.url.split('?')[0];

  // ── POST /save-config : salva o JSON no disco ──
  if (req.method === 'POST' && url === '/save-config') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        // Valida o JSON antes de salvar
        const data = JSON.parse(body);
        if (!data.TREE || !data.CFG) throw new Error('Formato inválido');

        fs.writeFileSync(CONFIG_FILE, JSON.stringify(data, null, 2), 'utf8');

        console.log(`[${new Date().toLocaleTimeString('pt-BR')}] ✓ chatbot-config.json salvo`);

        res.writeHead(200, corsHeaders('application/json'));
        res.end(JSON.stringify({ ok: true, savedAt: new Date().toISOString() }));
      } catch (err) {
        console.error('Erro ao salvar:', err.message);
        res.writeHead(400, corsHeaders('application/json'));
        res.end(JSON.stringify({ ok: false, error: err.message }));
      }
    });
    return;
  }

  // ── GET /load-config : carrega o JSON do disco ──
  if (req.method === 'GET' && url === '/load-config') {
    if (fs.existsSync(CONFIG_FILE)) {
      const data = fs.readFileSync(CONFIG_FILE, 'utf8');
      res.writeHead(200, corsHeaders('application/json'));
      res.end(data);
    } else {
      // Arquivo não existe ainda — retorna vazio
      res.writeHead(404, corsHeaders('application/json'));
      res.end(JSON.stringify({ ok: false, error: 'Arquivo não encontrado' }));
    }
    return;
  }

  // ── GET / ou /index.html : serve o painel ──
  if (req.method === 'GET' && (url === '/' || url === '/index.html')) {
    try {
      const html = fs.readFileSync(HTML_FILE, 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(html);
    } catch {
      res.writeHead(404); res.end('index.html não encontrado');
    }
    return;
  }

  // ── Outros arquivos estáticos ──
  const filePath = path.join(__dirname, url);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext  = path.extname(filePath);
    const mime = MIME[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': mime });
    res.end(fs.readFileSync(filePath));
    return;
  }

  res.writeHead(404); res.end('Not found');
});

function corsHeaders(contentType) {
  return {
    'Content-Type': contentType,
    'Access-Control-Allow-Origin': '*',
  };
}

server.listen(PORT, () => {
  console.log('');
  console.log('  ╔═══════════════════════════════════════╗');
  console.log('  ║   ChatBot — Painel de Gestão           ║');
  console.log('  ╠═══════════════════════════════════════╣');
  console.log(`  ║   Abra no navegador:                   ║`);
  console.log(`  ║   http://localhost:${PORT}               ║`);
  console.log('  ╠═══════════════════════════════════════╣');
  console.log('  ║   Salvar .json → automático no disco   ║');
  console.log('  ║   Arquivo: admin/chatbot-config.json   ║');
  console.log('  ╚═══════════════════════════════════════╝');
  console.log('');
  console.log('  Aguardando conexões... (Ctrl+C para parar)');
  console.log('');

  // Carrega config existente ao iniciar
  if (fs.existsSync(CONFIG_FILE)) {
    console.log(`  ✓ Configuração encontrada: chatbot-config.json`);
  } else {
    console.log(`  ℹ  Nenhum chatbot-config.json encontrado — será criado ao salvar.`);
  }
});
