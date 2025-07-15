export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  console.log('API inquiry called with body:', req.body);
  
  try {
    const { id, event_id, subject, message } = req.body;
    
    const params = new URLSearchParams({
      id,
      event_id,
      subject,
      message
    });
    
    console.log('Calling backend with params:', params.toString());
    
    const response = await fetch(`http://localhost:7071/api/inquiry?${params.toString()}`);
    
    console.log('Backend inquiry response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }
    
    const text = await response.text();
    console.log('Backend inquiry response:', text);
    
    res.status(200).send(text);
  } catch (error) {
    console.error('Inquiry API Error:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
