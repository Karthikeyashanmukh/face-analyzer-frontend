export async function analyzeBase64Image(base64Image) {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: base64Image,
      }),
    });
  
    const result = await response.json();
    return result;
  }
  