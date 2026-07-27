const axios = require('axios');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const ASAAS_API_KEY = '$aact_prod_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjJhMzVlNzJjLTE2YTMtNGM1My05ZjE3LWQ5YzVkMTMzZDRjODo6JGFhY2hfYmJmY2Q0MmItNjY1MS00NjcwLTg2ZDktOTZlOGJkNTMzZTdi'; 
  const ASAAS_URL = 'https://www.asaas.com/api/v3';

  try {
    const cobranca = await axios.post(`${ASAAS_URL}/payments`, {
      customer: 'cus_000005810283',
      billingType: 'PIX',
      value: 4.90,
      dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      description: 'Liberacao de Video - Pegadinha Tatuagem'
    }, {
      headers: { 'access_token': ASAAS_API_KEY }
    });

    const paymentId = cobranca.data.id;

    const qrCode = await axios.get(`${ASAAS_URL}/payments/${paymentId}/pixQrCode`, {
      headers: { 'access_token': ASAAS_API_KEY }
    });

    return res.status(200).json({
      paymentId: paymentId,
      pixCode: qrCode.data.payload,
      qrCodeBase64: qrCode.data.encodedImage
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao gerar PIX' });
  }
};
