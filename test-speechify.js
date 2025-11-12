// Test Speechify API
const SPEECHIFY_API_KEY = 'E83y8sU8rB6uHh_CRWF26gGF5-_vMSfBrt5-rlqzes8=';

async function testSpeechify() {
  console.log('Testing Speechify API...');
  console.log('API Key:', SPEECHIFY_API_KEY.substring(0, 20) + '...');

  try {
    const response = await fetch('https://api.sws.speechify.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SPEECHIFY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        input: 'Hello, this is a test.',
        voice_id: 'henry',
        audio_format: 'mp3',
        speed: 1.0
      })
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      return;
    }

    const audioBlob = await response.blob();
    console.log('Audio blob size:', audioBlob.size, 'bytes');
    console.log('Audio blob type:', audioBlob.type);

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result;
      console.log('Base64 data URL length:', base64.length);
      console.log('Base64 prefix:', base64.substring(0, 50));

      // Try to play it
      const audio = new Audio(base64);
      console.log('Audio element created, attempting to play...');

      audio.addEventListener('canplay', () => {
        console.log('Audio can play!');
      });

      audio.addEventListener('error', (e) => {
        console.error('Audio playback error:', e);
      });

      audio.play().then(() => {
        console.log('Audio started playing successfully!');
      }).catch(err => {
        console.error('Play failed:', err);
      });
    };
    reader.readAsDataURL(audioBlob);

  } catch (error) {
    console.error('Test failed:', error);
  }
}

testSpeechify();
