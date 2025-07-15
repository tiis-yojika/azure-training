export default async function handler(req, res) {
  const { event_id } = req.query;
  
  console.log('API eventinfo called with event_id:', event_id);
  
  try {
    // バックエンドAPIを呼び出し
    const response = await fetch(`http://localhost:7071/api/eventinfo?event_id=${event_id}`);
    
    console.log('Backend response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Backend data:', data);
    
    res.status(200).json(data);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
