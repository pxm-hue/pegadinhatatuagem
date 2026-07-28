const axios = require('axios');

module.exports = async (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'ID do pagamento não fornecido' });
  }

  const ASAAS_API_KEY = '$aact_prod_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjJhMzVlNzJjLTE2YTMtNGM1My05ZjE3LWQ5YzVkMTMzZDRjODo6JGFhY2hfYmJmY2Q0MmItNjY1MS00NjcwLTg2ZDktOTZlOGJkNTMzZTdi';
  const ASAAS_URL = 'https://www.asaas.com/api/v3';

  try {
    const response = await axios.get(`${ASAAS_URL}/payments/${id}`, {
      headers: { 'access_token': ASAAS_API_KEY }
    });

    const status = response.data.status;
    const estaPago = status === 'RECEIVED' || status === 'CONFIRMED';

    return res.status(200).json({ pago: estaPago });

  } catch (error) {
    return res.status(500).json({ pago: false, error: 'Erro ao consultar pagamento' });
  }
};
