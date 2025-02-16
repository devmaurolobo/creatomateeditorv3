import { NextApiRequest, NextApiResponse } from 'next';
import { Client, RenderOutputFormat } from 'creatomate';

const client = new Client(process.env.CREATOMATE_API_KEY!);

// Helper para executar o middleware com tipos corretos
function runMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  fn: (req: NextApiRequest, res: NextApiResponse, next: (result: unknown) => void) => void
) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: unknown) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    // Return an HTTP 401 response when the API key was not provided
    if (!process.env.CREATOMATE_API_KEY) {
      res.status(401).end();
      return;
    }

    /** @type {import('creatomate').RenderOptions} */
    const options = {
      source: req.body.source,
    };

    try {
      const renders = await client.render(options);
      res.status(200).json(renders[0]);
    } catch (error) {
      res.status(400).end();
    }
  } else {
    res.status(404).end();
  }
}
