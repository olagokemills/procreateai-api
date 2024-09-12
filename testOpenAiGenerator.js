// testOpenAiGenerator.js
require("dotenv").config(); // Load environment variables from .env file
const { generateSocialMediaContent } = require("./functions/social-media");

async function testGenerator() {
  // Sample transcription text
  const sampleTranscription = `
    In this video, we explore the fascinating world of artificial intelligence and its impact on modern society. 
    We discuss how AI is transforming industries such as healthcare, finance, and transportation. 
    We also delve into the ethical considerations surrounding AI development and implementation. 
    Experts in the field share their insights on the future of AI and its potential to solve complex global challenges. 
    Whether you're a tech enthusiast or simply curious about the role of AI in our lives, this video provides valuable insights into this rapidly evolving field.
  `;

  try {
    console.log("Generating social media content...");
    const result = await generateSocialMediaContent(
      sampleTranscription,
      ["twitter", "instagram", "linkedin"],
      "informative"
    );

    console.log("Generated Content:");
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("Error in test:", error);
  }
}

testGenerator();
