// openAiSocialMediaGenerator.js
const OpenAI = require("openai");
// const { TextServiceClient } = require("@google-ai/generative-ai");
const { GoogleGenerativeAI } = require("@google/generative-ai");

require("dotenv").config();
// Initialize OpenAI API client
const openai = new OpenAI({
  apiKey: process.env.OpenAI_API_KEY,
});

const geminiClient = new GoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY, // Add your Google Cloud API key here
});

async function generateSocialMediaContent(
  transcription,
  userDescription = "",
  userTags = [],
  platforms = ["twitter", "instagram", "tiktok"],
  tone = "neutral",
  isPremiumUser = true
) {
  const prompt = `
    Based on the following video transcription, user-provided description, and tags, generate a title, description, and hashtags for ${platforms.join(
      ", "
    )} platforms, as well as a single TLDR (Too Long; Didn't Read) summary for the entire video.
    The tone should be ${tone}.
    
    Transcription: ${transcription.slice(
      0,
      1000
    )}... // Truncated for API limits
    
    User-provided description: ${userDescription}
    
    User-provided tags: ${userTags.length ?? userTags.join(", ")}
    
    Provide:
    1. A single TLDR summary for the entire video (maximum 100 characters)
    2. A relevance score (0-100) indicating how well the user-provided description and tags match the video content
    3. Suggested additional tags based on the video content (up to 5)
    
    Then, for each platform, provide:
    1. A catchy title (maximum 50 characters for Twitter, 100 for others)
    2. An engaging description (maximum 280 characters for Twitter, 2200 for Instagram, 700 for tiktok)
    3. Relevant hashtags (up to 5 for each platform, incorporating user-provided tags where relevant)
    
    Format the response as a JSON object with 'tldr', 'relevanceScore', 'suggestedTags', and platforms as keys.
  `;

  try {
    let content;
    // Remove possible markdown formatting like ```json or ```
    if (isPremiumUser) {
      // Use ChatGPT for premium users
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant that generates social media content.",
          },
          { role: "user", content: prompt.trim() },
        ],
        max_tokens: 100,
        n: 1,
        temperature: 0.5,
      });

      let rawContent = response.choices[0].message.content.trim();
      rawContent = rawContent.replace(/```json/g, "").replace(/```/g, "");
      content = JSON.parse(rawContent);
    } else {
      // Use Gemini for free users
      const model = geminiClient.getGenerativeModel({
        model: "text-bison-001",
      });
      const result = await model.generateContent(prompt);
      console.log(result.response.text());

      // Print the generated content
      console.log("Generated Content:", response.candidates[0].output);
      // const model = GoogleGenerativeAI.getGenerativeModel({
      //   model: "gemini-pro",
      // });
      // const result = await model.generateContent(prompt);
      // console.log(result);
      // const response = result.response;

      // content = JSON.parse(response.text());
    }
    // Ensure suggestedTags is an array
    if (!Array.isArray(content.suggestedTags)) {
      content.suggestedTags = content.suggestedTags
        ? [content.suggestedTags]
        : [];
    }

    const formattedContent = {
      tldr: content.tldr || "",
      relevanceScore: content.relevanceScore || 0,
      suggestedTags: Array.isArray(content.suggestedTags)
        ? content.suggestedTags
        : [],
      twitter: content.platforms?.twitter ||
        content.twitter || { title: "", description: "", hashtags: [] },
      instagram: content.platforms?.instagram ||
        content.instagram || { title: "", description: "", hashtags: [] },
      linkedin: content.platforms?.linkedin ||
        content.linkedin || { title: "", description: "", hashtags: [] },
    };
    return formattedContent;
  } catch (error) {
    console.error("Error generating social media content:", error);
    throw error;
  }
}

module.exports = { generateSocialMediaContent };
