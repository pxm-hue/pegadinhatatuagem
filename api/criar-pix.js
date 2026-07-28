const axios = require('axios');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  // 1. Cole aqui o seu Token do Asaas completo (começa com $aact_...)
  const ASAAS_API_KEY = '$aact_prod_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjJhMzVlNzJjLTE2YTMtNGM1My05ZjE3LWQ5YzVkMTMzZDRjODo6JGFhY2hfYmJmY2Q0MmItNjY1MS00NjcwLTg2ZDktOTZlOGJkNTMzZTdi'; 
  
  // URL da API oficial do Asaas
  const ASAAS_URL = 'https://www.asaas.com/api/v3';

  try {
    const headers = { 'access_token': ASAAS_API_KEY };

    // PASSO A: Cria um cliente na hora para a cobrança não falhar
    const clienteRes = await axios.post(`${ASAAS_URL}/customers`, {
      name: 'Cliente Pegadinha',
      cpfCnpj: '00000000000' // O Asaas aceita sem CPF/CNPJ ou dados simplificados se for Pix estático
    }, { headers }).catch(() => null);

    // Se criou o cliente pega o ID dele, senão usa um genérico
    const customerId = clienteRes?.data?.id;

    // PASSO B: Cria a cobrança do Pix de R$ 2,00
    const cobranca = await axios.post(`${ASAAS_URL}/payments`, {
      customer: customerId,
      billingType: 'PIX',
      value: 2.00,
      dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      description: 'Liberacao de Video - Pegadinha Tatuagem'
    }, { headers });

    const paymentId = cobranca.data.id;

    // PASSO C: Busca o QR Code e a chave Copia e Cola
    const qrCode = await axios.get(`${ASAAS_URL}/payments/${paymentId}/pixQrCode`, { headers });

    return res.status(200).json({
      paymentId: paymentId,
      pixCode: qrCode.data.payload,
      qrCodeBase64: qrCode.data.encodedImage
    });

  } catch (error) {
    console.error("Erro detalhado do Asaas:", error.response ? error.response.data : error.message);
    return res.status(500).json({ 
      error: 'Erro ao gerar PIX', 
      detalhes: error.response ? error.response.data : error.message 
    });
  }
};
