import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// Template ID padrão
const DEFAULT_TEMPLATE = "2c424dba-1165-4818-ad34-827e76a7bf38";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('templates')
        .select('template_id')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      
      const currentId = data?.template_id || DEFAULT_TEMPLATE;
      console.log('GET solicitado, retornando templateId:', currentId);
      res.status(200).json({ templateId: currentId });

    } else if (req.method === 'POST') {
      const receivedId = req.body.templateId;
      
      if (typeof receivedId === 'string' && receivedId.trim() !== '') {
        const { error } = await supabase
          .from('templates')
          .insert({ template_id: receivedId });

        if (error) throw error;

        console.log('Novo templateId:', receivedId);
        res.status(200).json({ message: 'Template ID atualizado', templateId: receivedId });
      } else {
        res.status(400).json({ error: 'templateId inválido ou vazio.' });
      }
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro na API:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
} 