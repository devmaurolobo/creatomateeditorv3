import { NextApiRequest, NextApiResponse } from 'next';

// Variável para armazenar o template atual
let currentTemplateId = process.env.NEXT_PUBLIC_TEMPLATE_ID;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { templateId } = req.body;
    
    if (!templateId) {
      return res.status(400).json({ error: 'Template ID é obrigatório' });
    }

    // Atualiza o template atual
    currentTemplateId = templateId;

    // Retorna o novo template ID
    return res.status(200).json({ 
      templateId: currentTemplateId,
      message: 'Template ID atualizado e renderizado com sucesso' 
    });
  }

  res.status(405).json({ error: 'Método não permitido' });
} 