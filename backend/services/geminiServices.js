const ai = require("../config/gemini");

const generateAIResponse = async (prompt) => {
  const result = await ai.interactions.create({
    model: "gemini-2.5-flash",
    input: prompt
  });

  return result.output_text;
};

module.exports = { generateAIResponse };