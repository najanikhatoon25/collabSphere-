const ai = require("../config/gemini");

const generateAIResponse = async (prompt) => {
  const result = await ai.interactions.create({
    model: "gemini-3.8-flash",
    input: prompt
  });

  return result.output_text;
};

module.exports = { generateAIResponse };