async function listModels() {
  const res = await fetch('https://openrouter.ai/api/v1/models');
  const data = await res.json();
  const geminiModels = data.data.filter(m => m.id.toLowerCase().includes('gemini'));
  console.log("Gemini Models on OpenRouter:");
  geminiModels.forEach(m => console.log(`- ${m.id}`));
}

listModels();
