const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Extract JSON from GPT response
 * @param {string} text - GPT response text
 * @returns {Object} Parsed JSON object
 */
const extractJsonFromResponse = (text) => {
  try {
    // Find JSON object in the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    throw new Error("Failed to parse GPT response: " + error.message);
  }
};

/**
 * Generate learning schedule using GPT
 * @param {string} prompt - User's learning prompt
 * @param {number} days - Number of days for the schedule
 * @returns {Promise<Object>} Generated schedule
 */
const generateLearningSchedule = async (prompt, days) => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a learning schedule generator. Create a detailed learning schedule in JSON format.
          Include daily tasks with titles, descriptions, durations, and relevant resources (articles, videos, documentation).
          Format the response as a valid JSON object with this structure:
          {
            "title": "Schedule title",
            "topics": ["topic1", "topic2"],
            "dailyTasks": [
              {
                "date": "YYYY-MM-DD",
                "tasks": [
                  {
                    "title": "Task title",
                    "description": "Task description",
                    "duration": minutes,
                    "resources": [
                      {
                        "type": "article|video|documentation|other",
                        "title": "Resource title",
                        "url": "Resource URL",
                        "description": "Resource description"
                      }
                    ]
                  }
                ]
              }
            ]
          }`
        },
        {
          role: "user",
          content: `Create a ${days}-day learning schedule for: ${prompt}`
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const response = completion.choices[0].message.content;
    return extractJsonFromResponse(response);
  } catch (error) {
    throw new Error("Failed to generate learning schedule: " + error.message);
  }
};

module.exports = {
  generateLearningSchedule
}; 