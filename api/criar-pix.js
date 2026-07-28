const axios = require('axios');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  // 1. Cole seu Token do Asaas ($aact_...)
  const ASAAS_API_KEY = '$aact_prod_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjJhMzVlNzJjLTE2YTMtNGM1My05ZjE3LWQ5YzVkMTMzZDRjODo6JGFhY2hfYmJmY2Q0MmItNjY1MS00NjcwLTg2ZDktOTZlOGJkNTMzZTdi'; 
  
  // 2. Cole aqui o ID do cliente que você copiou do painel do Asaas
  const CUSTOMER_ID = 'cus_190028429'; 

  const ASAAS_URL = 'https://www.asaas.com/api/v3';

  try {
    const headers = { 'access_token': ASAAS_API_KEY };

    // Cria a cobrança Pix de R$ 2,00 vinculada ao cliente válido
    const cobranca = await axios.post(`${ASAAS_URL}/payments`, {
      customer: CUSTOMER_ID,
      billingType: 'PIX',
      value: 2.00,
      dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      description: 'Liberacao de Video - Pegadinha Tatuagem'
    }, { headers });

    const paymentId = cobranca.data.id;

    // Busca o QR Code e o código Copia e Cola
    const qrCode = await axios.get(`${ASAAS_URL}/payments/${paymentId}/pixQrCode`, { headers });

    return res.status(200).json({
      paymentId: paymentId,
      pixCode: qrCode.data.payload,
      qrCodeBase64: qrCode.data.encodedImage
    });

  } catch (error) {
    console.error("Erro no Asaas:", error.response ? error.response.data : error.message);
    return res.status(500).json({ error: 'Erro ao gerar PIX' });
  }
};
