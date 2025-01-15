// geminiContentGenerator.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateSocialMediaContent(
  transcription,
  userDescription = "",
  userTags = [],
  platforms = ["twitter", "instagram", "linkedin"],
  tone = "neutral"
) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `
    Based on the following video transcription, user-provided description, and tags, generate a title, description, and hashtags for ${platforms.join(
      ", "
    )} platforms.
    The tone should be ${tone}.
    
    Transcription: ${transcription.slice(
      0,
      1000
    )}... // Truncated for API limits
    
    User-provided description: ${userDescription}
    
    User-provided tags: ${userTags.join(", ")}
    
    Provide:
    1. A single TLDR summary for the entire video (maximum 100 characters)
    2. A relevance score (0-100) indicating how well the user-provided description and tags match the video content
    3. Suggested additional tags based on the video content (up to 5)
    
    Then, for each platform, provide:
    1. A catchy title (maximum 50 characters for Twitter, 100 for others)
    2. An engaging description (maximum 280 characters for Twitter, 2200 for Instagram, 700 for LinkedIn)
    3. Relevant hashtags (up to 5 for each platform, incorporating user-provided tags where relevant)
    
    Format the response as a JSON object with 'tldr', 'relevanceScore', 'suggestedTags', and platforms as keys.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse the JSON response
    const content = JSON.parse(text);

    return content;
  } catch (error) {
    console.error("Error generating content with Gemini:", error);
    throw error;
  }
}

module.exports = { generateSocialMediaContent };
