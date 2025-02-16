const express = require('express');
const router = express.Router();

router.post('/update-properties', async (req, res) => {
  console.log('🛠 Início do endpoint update-properties');
  console.log('🛠 Payload recebido:', req.body);

  try {
    const { selector, value, modifications } = req.body;

    // Validação mínima (opcional)
    if (!selector || typeof value === 'undefined' || !modifications) {
      return res.status(400).json({
        message: 'Payload inválido. Esperado { selector, value, modifications }'
      });
    }

    console.log(`🛠 Atualizando a propriedade "${selector}" com o valor: ${value}`);

    // Exemplo: atualize as modificações conforme alguma lógica de negócio
    // Aqui você pode, por exemplo, realizar validações, atualizar um banco de dados, etc.
    const updatedModifications = { ...modifications, [selector]: value };

    console.log('🛠 Modificações atualizadas:', updatedModifications);

    // Retorne a resposta com as modificações atualizadas
    res.json({
      message: 'Propriedades atualizadas com sucesso',
      modifications: updatedModifications
    });
  } catch (error) {
    console.error('🛠 Erro no endpoint update-properties:', error);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

module.exports = router; 