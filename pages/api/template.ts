import type { NextApiRequest, NextApiResponse } from 'next';

// Para desenvolvimento local
let templateId = "2c424dba-1165-4818-ad34-827e76a7bf38";

const storage = {
  async get(key: string) {
    if (process.env.VERCEL) {
      const { kv } = await import('@vercel/kv');
      return await kv.get(key);
    }
    return templateId;
  },
  async set(key: string, value: string) {
    if (process.env.VERCEL) {
      const { kv } = await import('@vercel/kv');
      await kv.set(key, value);
    }
    templateId = value;
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const currentId = await storage.get('current_template_id') || templateId;
      console.log('GET solicitado, retornando templateId:', currentId);
      res.status(200).json({ templateId: currentId });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar template' });
    }
  } else if (req.method === 'POST') {
    try {
      const receivedId = req.body.templateId;
      if (typeof receivedId === 'string' && receivedId.trim() !== '') {
        await storage.set('current_template_id', receivedId);
        console.log('Novo templateId:', receivedId);
        res.status(200).json({ message: 'Template ID atualizado', templateId: receivedId });
      } else {
        res.status(400).json({ error: 'templateId inválido ou vazio.' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Erro ao atualizar template' });
    }
  } else {
    res.status(405).json({ error: 'Método não permitido' });
  }
} 