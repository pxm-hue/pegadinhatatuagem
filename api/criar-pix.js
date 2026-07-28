const axios = require('axios');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  // 1. Cole seu Token da API do Asaas (começa com $aact_...)
  const ASAAS_API_KEY = '$aact_prod_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjJhMzVlNzJjLTE2YTMtNGM1My05ZjE3LWQ5YzVkMTMzZDRjODo6JGFhY2hfYmJmY2Q0MmItNjY1MS00NjcwLTg2ZDktOTZlOGJkNTMzZTdi'; 
  const ASAAS_URL = 'https://www.asaas.com/api/v3';

  try {
    const headers = { 'access_token': ASAAS_API_KEY };

    // Busca seu cliente cadastrado pelo CPF para pegar o 'id' correto
    const buscaCliente = await axios.get(`${ASAAS_URL}/customers?cpfCnpj=08899933944`, { headers });
    
    let customerId = "";

    if (buscaCliente.data.data && buscaCliente.data.data.length > 0) {
      customerId = buscaCliente.data.data[0].id; // Pega o id no formato correto (ex: cus_000005810283)
    } else {
      // Se não achar, cria um cliente novo
      const novoCliente = await axios.post(`${ASAAS_URL}/customers`, {
        name: 'Cliente Pegadinha',
        cpfCnpj: '08899933944'
      }, { headers });
      customerId = novoCliente.data.id;
    }

    // 2. Cria a cobrança Pix de R$ 2,00
    const cobranca = await axios.post(`${ASAAS_URL}/payments`, {
      customer: customerId,
      billingType: 'PIX',
      value: 2.00,
      dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      description: 'Liberacao de Video - Pegadinha Tatuagem'
    }, { headers });

    const paymentId = cobranca.data.id;

    // 3. Pega o QR Code e o Copia e Cola
    const qrCode = await axios.get(`${ASAAS_URL}/payments/${paymentId}/pixQrCode`, { headers });

    return res.status(200).json({
      paymentId: paymentId,
      pixCode: qrCode.data.payload,
      qrCodeBase64: qrCode.data.encodedImage
    });

  } catch (error) {
    console.error("Erro no Asaas:", error.response ? error.response.data : error.message);
    return res.status(500).json({ 
      error: 'Erro ao gerar PIX',
      detalhes: error.response ? error.response.data : error.message 
    });
  }
};
