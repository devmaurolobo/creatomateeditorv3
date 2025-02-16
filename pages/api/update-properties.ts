import type { NextApiRequest, NextApiResponse } from 'next';

// OBJETO EM MEMÓRIA (de exemplo) PARA ARMAZENAR MODIFICAÇÕES
let globalModifications: Record<string, any> = {};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('[update-properties] - Método:', req.method);

  if (req.method === 'POST') {
    // Recebe e processa dados
    const { selector, value, modifications } = req.body;
    if (value && value.trim()) {
      globalModifications[selector] = value;
    } else {
      delete globalModifications[selector];
    }
    // Faz merge com as modificações que vieram
    globalModifications = {
      ...globalModifications,
      ...modifications,
    };
    console.log('POST -> globalModifications atual:', globalModifications);

    return res.status(200).json({
      message: '[POST] Sucesso',
      modifications: globalModifications,
    });
  } else if (req.method === 'GET') {
    // Retorna o estado atual armazenado
    console.log('GET -> Retornando globalModifications:', globalModifications);
    return res.status(200).json({
      message: '[GET] Sucesso',
      modifications: globalModifications,
    });
  } else {
    // Outros métodos não suportados
    return res.status(405).json({ error: 'Método não suportado' });
  }
} 