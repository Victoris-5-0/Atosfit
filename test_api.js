import fs from 'fs';
const key = process.env.VITE_CHATBOT_API_KEY;

async function test() {
  try {
    if (!key) {
      throw new Error('Set VITE_CHATBOT_API_KEY before running this test.');
    }

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "hi" }] }]
      })
    });
    const data = await res.json();
    fs.writeFileSync('response.json', JSON.stringify(data, null, 2));
  } catch (e) {
    console.error(e);
  }
}
test();
