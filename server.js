const express = require('express');
const bodyParser = require('body-parser');
const ExcelJS = require('exceljs');
const nodemailer = require('nodemailer');
const fs = require('fs');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const arquivo = 'respostas.xlsx';
const emailDestino = 'glauber.muller@geometralengenharia.com.br';

// Configuração do e-mail (Atenção: use senha de app do Gmail ou SMTP seguro)
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'SEU_EMAIL@gmail.com', // Altere aqui
    pass: 'SENHA_DO_APP'         // Altere aqui (senha de app, não senha pessoal)
  }
});

app.post('/salvar', async (req, res) => {
  const respostas = req.body.respostas;
  if (!respostas || !Array.isArray(respostas)) {
    return res.status(400).json({ error: 'Respostas inválidas.' });
  }

  let workbook, sheet;
  if (fs.existsSync(arquivo)) {
    workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(arquivo);
    sheet = workbook.getWorksheet('Respostas');
  } else {
    workbook = new ExcelJS.Workbook();
    sheet = workbook.addWorksheet('Respostas');
    sheet.addRow(['Data/Hora', ...respostas.map((_,i)=>`Pergunta ${i+1}`)]);
  }

  sheet.addRow([new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }), ...respostas]);
  await workbook.xlsx.writeFile(arquivo);

  // Enviar por e-mail a planilha atualizada
  try {
    await transporter.sendMail({
      from: '"Avaliação NR01" <SEU_EMAIL@gmail.com>',
      to: emailDestino,
      subject: 'Nova resposta de Avaliação Ocupacional NR01',
      text: 'Segue a planilha atualizada em anexo.',
      attachments: [
        { filename: 'respostas.xlsx', path: arquivo }
      ]
    });
    res.json({ ok: true, message: 'Respostas salvas e e-mail enviado.' });
  } catch (err) {
    res.json({ ok: false, error: 'Erro ao enviar e-mail.', details: err.message });
  }
});

app.listen(3000, () => {
  console.log('Backend rodando em http://localhost:3000');
});
