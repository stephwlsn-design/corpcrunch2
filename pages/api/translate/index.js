// Translation API endpoint using LibreTranslate (free and open-source)
// Alternative: Can be replaced with Google Translate API or MyMemory API

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text, targetLang, sourceLang = 'en' } = req.body;

  if (!text || !targetLang) {
    return res.status(400).json({ error: 'Missing required fields: text and targetLang' });
  }

  // If source and target are the same, return original text
  if (sourceLang === targetLang) {
    return res.status(200).json({ translatedText: text, sourceLang, targetLang });
  }

  try {
    // Using LibreTranslate public API (free, no API key required)
    // Alternative: Use MyMemory Translation API or Google Translate API
    const LIBRETRANSLATE_API = 'https://libretranslate.de/translate';
    
    // Map language codes to LibreTranslate format
    const langMap = {
      'en': 'en',
      'es': 'es',
      'ar': 'ar',
      'fr': 'fr',
      'de': 'de',
      'it': 'it',
      'pt': 'pt',
      'zh': 'zh',
      'ja': 'ja',
      'ko': 'ko',
      'ru': 'ru'
    };

    const sourceLangCode = langMap[sourceLang] || 'en';
    const targetLangCode = langMap[targetLang] || 'en';

    // For large texts, split into chunks
    const maxChunkLength = 5000;
    const chunks = [];
    
    if (text.length > maxChunkLength) {
      // Split by sentences or paragraphs
      const sentences = text.split(/(?<=[.!?])\s+/);
      let currentChunk = '';
      
      for (const sentence of sentences) {
        if ((currentChunk + sentence).length > maxChunkLength && currentChunk) {
          chunks.push(currentChunk);
          currentChunk = sentence;
        } else {
          currentChunk += (currentChunk ? ' ' : '') + sentence;
        }
      }
      if (currentChunk) chunks.push(currentChunk);
    } else {
      chunks.push(text);
    }

    // Translate each chunk
    const translatedChunks = await Promise.all(
      chunks.map(async (chunk) => {
        try {
          // Try MyMemory Translation API first (more reliable, free, no API key needed)
          const myMemoryUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(chunk)}&langpair=${sourceLangCode}|${targetLangCode}`;
          
          try {
            const response = await fetch(myMemoryUrl, {
              method: 'GET',
              headers: {
                'Accept': 'application/json',
              },
            });

            if (!response.ok) {
              throw new Error(`MyMemory API error: ${response.status}`);
            }

            // Check if response is JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
              const text = await response.text();
              // If it's HTML, throw error to use fallback
              if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
                throw new Error('Received HTML instead of JSON');
              }
              throw new Error('Invalid content type');
            }

            const data = await response.json();
            
            if (data.responseStatus === 200 && data.responseData && data.responseData.translatedText) {
              return data.responseData.translatedText;
            }
            
            throw new Error('Invalid response from MyMemory API');
          } catch (myMemoryError) {
            console.warn('MyMemory API failed, trying LibreTranslate:', myMemoryError.message);
            
            // Fallback to LibreTranslate
            try {
              const response = await fetch(LIBRETRANSLATE_API, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  q: chunk,
                  source: sourceLangCode,
                  target: targetLangCode,
                  format: 'text'
                }),
              });

              if (!response.ok) {
                throw new Error(`LibreTranslate API error: ${response.status}`);
              }

              // Check if response is JSON
              const contentType = response.headers.get('content-type');
              if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                // If it's HTML, throw error
                if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
                  throw new Error('Received HTML instead of JSON from LibreTranslate');
                }
                throw new Error('Invalid content type from LibreTranslate');
              }

              const data = await response.json();
              return data.translatedText || chunk;
            } catch (libreError) {
              console.error('Both translation APIs failed:', libreError.message);
              // Return original chunk if both fail
              return chunk;
            }
          }
        } catch (error) {
          console.error('Translation error for chunk:', error);
          // Fallback: return original chunk if translation fails
          return chunk;
        }
      })
    );

    const translatedText = translatedChunks.join(' ');

    return res.status(200).json({
      translatedText,
      sourceLang: sourceLangCode,
      targetLang: targetLangCode,
      success: true
    });

  } catch (error) {
    console.error('Translation API error:', error);
    
    // Fallback: Return original text if translation fails
    return res.status(200).json({
      translatedText: text,
      sourceLang,
      targetLang,
      success: false,
      error: error.message
    });
  }
}

