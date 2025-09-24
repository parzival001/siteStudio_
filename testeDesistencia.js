const { desistirAulaFixa } = require('./controllers/alunoController'); // ajuste o caminho
const db = require('./db'); // seu DB

// Mock da sessão e params
const req = {
  session: {
    user: { id: 1 } // ID de um aluno real do seu DB
  },
  params: {
    aulaId: 1 // ID de uma aula fixa real do seu DB
  }
};

const res = {
  redirect: (url) => console.log('Redirecionamento para:', url),
  status: function(code) { 
    this.statusCode = code; 
    return this; 
  },
  send: (msg) => console.log('Resposta enviada:', msg)
};

(async () => {
  try {
    await desistirAulaFixa(req, res);
    console.log('✅ Teste concluído.');
  } catch (err) {
    console.error('❌ Erro no teste:', err);
  } finally {
    // Fecha conexão com DB se necessário
    if (db.end) db.end();
  }
})();

