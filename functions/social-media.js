// openAiSocialMediaGenerator.js
const OpenAI = require("openai");

// Initialize OpenAI API client
const openai = new OpenAI({
  apiKey:
    "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",
});

async function generateSocialMediaContent(
  transcription,
  platforms = ["twitter", "instagram", "linkedin"],
  tone = "neutral"
) {
  const prompt = `
    Based on the following video transcription, generate a title, description, and hashtags for ${platforms.join(
      ", "
    )} platforms.
    The tone should be ${tone}.
    
    Transcription: ${transcription.slice(
      0,
      1000
    )}... // Truncated for API limits
    
    For each platform, provide:
    1. A catchy title (maximum 50 characters for Twitter, 100 for others)
    2. An engaging description (maximum 280 characters for Twitter, 2200 for Instagram, 700 for LinkedIn)
    3. Relevant hashtags (up to 5 for each platform)
    4. Summarize the video in 1-2 sentences explaining the key points as its TLDR;
    
    Format the response as a JSON object with platforms as keys.
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that generates social media content.",
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 500,
      n: 1,
      temperature: 0.7,
    });

    // const content = JSON.parse(response.choices[0].message.content.trim());
    // return content;
    // Remove possible markdown formatting like ```json or ```
    let content = response.choices[0].message.content.trim();
    content = content.replace(/```json/g, "").replace(/```/g, "");

    // Try parsing the content as JSON
    const jsonResponse = JSON.parse(content);

    return jsonResponse;
  } catch (error) {
    console.error("Error generating social media content:", error);
    throw error;
  }
}

module.exports = { generateSocialMediaContent };
