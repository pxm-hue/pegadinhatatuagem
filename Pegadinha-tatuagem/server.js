const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// === CONFIGURAÇÕES DAS SUAS APIS ===
const ASAAS_API_KEY = "SUA_CHAVE_API_DO_ASAAS_AQUI"; 
const SHOTSTACK_API_KEY = "SUA_STAGE_KEY_DO_SHOTSTACK_AQUI"; 
const VIDEO_BASE_URL = "SUA_URL_DO_CLOUDINARY_AQUI.mp4";

// 1. Rota para gerar cobrança no Asaas
app.post('/api/create-pix', async (req, res) => {
  try {
    // Cria cobrança PIX
    const paymentResponse = await axios.post('https://www.asaas.com/api/v3/payments', {
      billingType: 'PIX',
      value: 4.90,
      dueDate: new Date().toISOString().split('T')[0],
      description: `Pegadinha Tatuagem`
    }, {
      headers: { 'access_token': ASAAS_API_KEY }
    });

    const paymentId = paymentResponse.data.id;

    // Busca o QR Code
    const qrResponse = await axios.get(`https://www.asaas.com/api/v3/payments/${paymentId}/pixQrCode`, {
      headers: { 'access_token': ASAAS_API_KEY }
    });

    res.json({
      success: true,
      paymentId: paymentId,
      encodedImage: qrResponse.data.encodedImage,
      payload: qrResponse.data.payload
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao gerar PIX' });
  }
});

// 2. Rota para verificar status do pagamento
app.get('/api/check-payment', async (req, res) => {
  const { paymentId } = req.query;
  try {
    const response = await axios.get(`https://www.asaas.com/api/v3/payments/${paymentId}`, {
      headers: { 'access_token': ASAAS_API_KEY }
    });
    res.json({ status: response.data.status });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao verificar pagamento' });
  }
});

// 3. Rota para gerar o vídeo no Shotstack com o efeito realista
app.post('/api/render-video', async (req, res) => {
  const { seuNome, nomeAmigo } = req.body;

  const shotstackPayload = {
    timeline: {
      tracks: [
        {
          clips: [
            // TATUAGEM 1: Ombro da mulher (Estilo cursivo, opacidade e blur para realismo)
            {
              asset: {
                type: "html",
                html: `<div style="font-family: 'Great Vibes', cursive; font-size: 30px; color: #1a2421; opacity: 0.85; filter: blur(0.4px); text-shadow: 0px 0px 1px rgba(0,0,0,0.2);">${seuNome}</div>`
              },
              start: 0.5,
              length: 3.5,
              position: "topLeft",
              offset: { x: 0.12, y: -0.10 }
            },
            // TATUAGEM 2: Costas do Paulão (Estilo marcador, opacidade ajustada)
            {
              asset: {
                type: "html",
                html: `<div style="font-family: 'Impact', sans-serif; font-size: 48px; color: #111827; opacity: 0.88; filter: blur(0.5px); text-align: center;">${nomeAmigo}</div>`
              },
              start: 6.0,
              length: 6.0,
              position: "center",
              offset: { x: 0.0, y: -0.05 }
            }
          ]
        },
        {
          clips: [
            {
              asset: {
                type: "video",
                src: VIDEO_BASE_URL
              },
              start: 0,
              length: 12
            }
          ]
        }
      ]
    },
    output: {
      format: "mp4",
      resolution: "sd"
    }
  };

  try {
    const renderRes = await axios.post('https://api.shotstack.io/stage/render', shotstackPayload, {
      headers: { 'x-api-key': SHOTSTACK_API_KEY }
    });

    const renderId = renderRes.data.response.id;

    // Aguarda a renderização finalizar
    let videoUrl = null;
    while (!videoUrl) {
      await new Promise(r => setTimeout(r, 2000));
      const statusRes = await axios.get(`https://api.shotstack.io/stage/render/${renderId}`, {
        headers: { 'x-api-key': SHOTSTACK_API_KEY }
      });
      if (statusRes.data.response.status === 'done') {
        videoUrl = statusRes.data.response.url;
      }
    }

    res.json({ videoUrl: videoUrl });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao renderizar vídeo' });
  }
});

module.exports = app;