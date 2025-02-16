import express from 'express';
const app = express();

app.use(express.json());

/**
 * Endpoint para receber os parâmetros enviados pelo setPropertyValue.
 * Aqui, a rota é definida como /api/update-properties, mas você pode escolher outro nome.
 */
app.post('/api/update-properties', (req, res) => {
  const { selector, value, modifications } = req.body;
  
  // Aqui você pode realizar qualquer lógica necessária, como salvar em um banco de dados
  console.log('Dados recebidos:', { selector, value, modifications });

  // Responde com uma mensagem de sucesso
  res.status(200).json({ message: 'Dados recebidos com sucesso' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
}); 