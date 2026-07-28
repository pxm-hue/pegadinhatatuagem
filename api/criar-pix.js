const axios = require('axios');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  // Sua chave da API do Asaas ($aact_...)
  const ASAAS_API_KEY = '$aact_prod_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjJhMzVlNzJjLTE2YTMtNGM1My05ZjE3LWQ5YzVkMTMzZDRjODo6JGFhY2hfYmJmY2Q0MmItNjY1MS00NjcwLTg2ZDktOTZlOGJkNTMzZTdi'; 
  const ASAAS_URL = 'https://www.asaas.com/api/v3';

  try {
    const headers = { 'access_token': ASAAS_API_KEY };

    // Para valores abaixo de R$ 5,00, geramos o QR Code via API de Pix Direto do Asaas
    const qrCodePix = await axios.post(`${ASAAS_URL}/pix/qrCodes/static`, {
      addressKey: 'e7101de5-1ff3-48f7-866d-9f1817ba3bb1', // 👈 Coloque aqui sua Chave Pix cadastrada no Asaas (e-mail, CPF ou aleatória)
      description: 'Pegadinha Tatuagem',
      value: 2.00,
      format: 'ALL'
    }, { headers });

    return res.status(200).json({
      success: true,
      paymentId: qrCodePix.data.id || 'pix_static',
      pixCode: qrCodePix.data.payload,
      qrCodeBase64: qrCodePix.data.encodedImage
    });

  } catch (error) {
    const msgErro = error.response && error.response.data && error.response.data.errors 
      ? error.response.data.errors[0].description 
      : error.message;

    console.error("Erro Asaas Pix:", msgErro);
    return res.status(200).json({ 
      success: false, 
      erroMensagem: msgErro 
    });
  }
};
