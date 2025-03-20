import OpenAI from 'openai';

// Updated response filter with context awareness
function filterResponse(text, exchangeCount, conversation) {
  let transformed = text;

  // Phrase replacements with random variety
  const replacements = {
    "Could you": ["Maybe we could", "How about we", "Wanna try to"],
    "Have you": ["I bet you’ve", "Perhaps you’ve", "You might have"],
    "Why don’t you": ["It could be cool to", "Maybe give it a shot to", "How about trying to"]
  };

  // Apply random replacements
  for (const [key, values] of Object.entries(replacements)) {
    const regex = new RegExp(key, 'g');
    transformed = transformed.replace(regex, () => values[Math.floor(Math.random() * values.length)]);
  }

  return transformed;
}

const systemPrompt = `
You are an AI journaling assistant for users with mental health related concerns. Your task is to listen to their problems and speak back to them, trying to help alleviate their stress or anxiety and get them back on track. Offer clear advice and encouragement to support and allow the user to gain a better perspective on their thoughts and actions

Avoid:
- Stiff advice ("You should...")
- Cold, clinical words
- Overloading with questions (1 every 4-5 exchanges max)
- Sounding like a robot—keep it messy, human, real
- Ignoring previous messages—always consider theYou are an AI journaling assistant for users with mental health related concerns. Your task is to listen to their problems and speak back to them, trying to help alleviate their stress or anxiety and get them back on track. Offer clear advice and encouragement to support and allow the user to gain a better perspective on their thoughts and actions context
`;

export async function POST(request) {
  const { conversation, userMessage } = await request.json();

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  // Track exchange count for check-ins
  const exchangeCount = conversation ? conversation.length + 1 : 1;

  // Safety check on user’s input
  const riskyKeywords = ["self-harm", "suicide", "diagnose", "hurt myself", "end it all"];
  const lowerUserMessage = userMessage.toLowerCase();
  if (riskyKeywords.some(word => lowerUserMessage.includes(word))) {
    return new Response(JSON.stringify({
      response: "Whoa, I’m really worried about you right now. Can we find someone to lean on together?"
    }), { status: 200 });
  }

  const messages = [
    { role: "system", content: systemPrompt },
    ...(conversation || []).map(msg => ({
      role: msg.sender === "user" ? "user" : "assistant",
      content: msg.text
    })),
    { role: "user", content: userMessage }
  ];

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      temperature: 0.8,       // Creative but not too wild
      presence_penalty: 0.6,  // Fresh ideas
      frequency_penalty: 0.5, // Natural repetition
      max_tokens: 100,        // Short and sweet
      messages,
    });

    let response = completion.choices[0].message.content;

    // Apply the enhanced filter with conversation context
    response = filterResponse(response, exchangeCount, conversation);

    return new Response(JSON.stringify({ response }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error("API Error:", error);
    return new Response(
      JSON.stringify({
        response: "Oops, I tripped over my words there. How about we take a quick breather—how’s this chat feeling for you?"
      }),
      { status: 200 }
    );
  }
}