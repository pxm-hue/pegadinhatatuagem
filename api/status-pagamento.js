const axios = require('axios');

module.exports = async (req, res) => {
  const { id } = req.query;
  const ASAAS_API_KEY = 'SUA_CHAVE_ASAAS_AQUI'; 
  const ASAAS_URL = 'https://www.asaas.com/api/v3';

  try {
    const status = await axios.get(`${ASAAS_URL}/payments/${id}`, {
      headers: { 'access_token': ASAAS_API_KEY }
    });

    const estaPago = status.data.status === 'RECEIVED' || status.data.status === 'CONFIRMED';
    return res.status(200).json({ pago: estaPago });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao verificar pagamento' });
  }
};