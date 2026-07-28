const axios = require('axios');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  // 1. Cole aqui sua Chave API do Asaas ($aact_...)
  const ASAAS_API_KEY = '$aact_prod_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjJhMzVlNzJjLTE2YTMtNGM1My05ZjE3LWQ5YzVkMTMzZDRjODo6JGFhY2hfYmJmY2Q0MmItNjY1MS00NjcwLTg2ZDktOTZlOGJkNTMzZTdi'; 
  const ASAAS_URL = 'https://www.asaas.com/api/v3';

  try {
    const headers = { 'access_token': ASAAS_API_KEY };

    // 2. Busca ou cria um cliente no Asaas
    let customerId = "";
    try {
      const busca = await axios.get(`${ASAAS_URL}/customers?cpfCnpj=08899933944`, { headers });
      if (busca.data && busca.data.data && busca.data.data.length > 0) {
        customerId = busca.data.data[0].id;
      } else {
        const novo = await axios.post(`${ASAAS_URL}/customers`, {
          name: 'Cliente Pegadinha',
          cpfCnpj: '08899933944'
        }, { headers });
        customerId = novo.data.id;
      }
    } catch (e) {
      const novoGenerico = await axios.post(`${ASAAS_URL}/customers`, {
        name: 'Cliente Pegadinha'
      }, { headers });
      customerId = novoGenerico.data.id;
    }

    // 3. Cria a cobrança do Pix no valor de R$ 5,00
    const cobranca = await axios.post(`${ASAAS_URL}/payments`, {
      customer: customerId,
      billingType: 'PIX',
      value: 5.00, // Alterado para R$ 5,00 para respeitar o limite do Asaas
      dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      description: 'Liberacao de Video - Pegadinha Tatuagem'
    }, { headers });

    const paymentId = cobranca.data.id;

    // 4. Busca o QR Code e o código Copia e Cola
    const qrCode = await axios.get(`${ASAAS_URL}/payments/${paymentId}/pixQrCode`, { headers });

    return res.status(200).json({
      success: true,
      paymentId: paymentId,
      pixCode: qrCode.data.payload,
      qrCodeBase64: qrCode.data.encodedImage
    });

  } catch (error) {
    const msgErro = error.response && error.response.data && error.response.data.errors 
      ? error.response.data.errors[0].description 
      : error.message;

    console.error("Erro Asaas:", msgErro);
    return res.status(200).json({ 
      success: false, 
      erroMensagem: msgErro 
    });
  }
};
