const EDGE_CONFIG_ID = 'ecfg_bwc89yhkeyo1ktda1vn61qck4uv';
const TOKEN = 'seu-token-aqui';

async function updateEdgeConfig() {
  const response = await fetch(`https://api.vercel.com/v1/edge-config/${EDGE_CONFIG_ID}/items`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      items: [
        {
          operation: 'upsert',
          key: 'current_template_id',
          value: '2c424dba-1165-4818-ad34-827e76a7bf38'
        }
      ]
    })
  });

  const data = await response.json();
  console.log('Resposta:', data);
}

updateEdgeConfig().catch(console.error); 