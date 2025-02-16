export const finishVideo = async (preview: Preview) => {
  const response = await fetch('/api/render', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ preview }),
  });
  
  return response.json();
}; 