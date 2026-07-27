const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());

// Servir o arquivo HTML estático
app.use(express.static(__dirname));

// Configuração da API do Asaas
const ASAAS_API_KEY = '$aact_prod_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjJhMzVlNzJjLTE2YTMtNGM1My05ZjE3LWQ5YzVkMTMzZDRjODo6JGFhY2hfYmJmY2Q0MmItNjY1MS00NjcwLTg2ZDktOTZlOGJkNTMzZTdi'; 
const ASAAS_URL = 'https://www.asaas.com/api/v3'; // Use https://sandbox.asaas.com/api/v3 se for ambiente de testes

// Rota 1: Criar cobrança PIX
app.post('/api/criar-pix', async (req, res) => {
  try {
    // 1. Criar a cobrança
    const cobranca = await axios.post(`${ASAAS_URL}/payments`, {
      customer: 'cus_000005810283', // Pode usar um ID de cliente padrão ou criar um na hora
      billingType: 'PIX',
      value: 4.90,
      dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      description: 'Liberacao de Video - Pegadinha Tatuagem'
    }, {
      headers: { 'access_token': ASAAS_API_KEY }
    });

    const paymentId = cobranca.data.id;

    // 2. Pegar o QR Code / Copia e Cola
    const qrCode = await axios.get(`${ASAAS_URL}/payments/${paymentId}/pixQrCode`, {
      headers: { 'access_token': ASAAS_API_KEY }
    });

    res.json({
      paymentId: paymentId,
      pixCode: qrCode.data.payload,
      qrCodeBase64: qrCode.data.encodedImage
    });

  } catch (error) {
    console.error("Erro Asaas:", error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Erro ao gerar PIX' });
  }
});

// Rota 2: Verificar se o PIX foi pago
app.get('/api/status-pagamento', async (req, res) => {
  const { id } = req.query;
  try {
    const status = await axios.get(`${ASAAS_URL}/payments/${id}`, {
      headers: { 'access_token': ASAAS_API_KEY }
    });

    const estaPago = status.data.status === 'RECEIVED' || status.data.status === 'CONFIRMED';
    res.json({ pago: estaPago });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao verificar pagamento' });
  }
});

// Rota principal para carregar o index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));