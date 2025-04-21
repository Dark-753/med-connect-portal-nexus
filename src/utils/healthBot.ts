
interface BotMessage {
  question: string;
  answer: string;
}

export async function askHealthBot(botQuestion: string): Promise<string> {
  if (!botQuestion.trim()) return '';
  
  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer pk-lovable-demo`, // Replace with your Perplexity API key for production!
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          { role: 'system', content: 'You are an empathetic healthcare assistant. Respond only with clear, concise, medically accurate advice and answers regarding diseases, symptoms, and health conditions.' },
          { role: 'user', content: botQuestion }
        ],
        temperature: 0.2,
        max_tokens: 300
      })
    });
    
    if (!response.ok) {
      console.error('HealthBot API error:', response.status);
      return getOfflineResponse(botQuestion);
    }
    
    const data = await response.json();
    return data.choices?.[0]?.message?.content || getOfflineResponse(botQuestion);
  } catch (err) {
    console.error('HealthBot error:', err);
    return getOfflineResponse(botQuestion);
  }
}

// Provide offline responses for common health questions when the API is unavailable
function getOfflineResponse(question: string): string {
  const questionLower = question.toLowerCase();
  
  if (questionLower.includes('headache') || questionLower.includes('head ache')) {
    return 'Headaches can be caused by stress, dehydration, lack of sleep, or eye strain. For occasional headaches, rest, hydration, and over-the-counter pain relievers may help. If you experience severe or recurring headaches, please consult a healthcare professional.';
  } else if (questionLower.includes('cold') || questionLower.includes('flu') || questionLower.includes('fever')) {
    return 'Common cold and flu symptoms include fever, cough, sore throat, body aches, and fatigue. Rest, stay hydrated, and consider over-the-counter medications for symptom relief. If symptoms are severe or persistent, please consult a healthcare professional.';
  } else if (questionLower.includes('blood pressure') || questionLower.includes('hypertension')) {
    return 'Healthy blood pressure is typically around 120/80 mmHg. Lifestyle changes like regular exercise, reduced sodium intake, stress management, and maintaining a healthy weight can help manage blood pressure. Regular monitoring is important, especially if you have risk factors.';
  } else if (questionLower.includes('diabetes')) {
    return 'Diabetes is a condition where your body either doesn't make enough insulin or can't effectively use the insulin it produces. Symptoms may include increased thirst, frequent urination, and fatigue. Management typically includes monitoring blood sugar, medication, proper diet, and regular exercise.';
  } else if (questionLower.includes('exercise') || questionLower.includes('workout')) {
    return 'Regular physical activity offers numerous health benefits including weight management, reduced risk of chronic diseases, stronger muscles and bones, and improved mental health. Aim for at least 150 minutes of moderate aerobic activity or 75 minutes of vigorous activity each week, along with muscle-strengthening activities.';
  } else if (questionLower.includes('diet') || questionLower.includes('nutrition')) {
    return 'A balanced diet rich in fruits, vegetables, whole grains, lean proteins, and healthy fats provides essential nutrients for good health. Limit processed foods, added sugars, and excessive sodium. Proper nutrition helps maintain a healthy weight and reduces the risk of chronic diseases.';
  } else {
    return 'I apologize, but I\'m currently operating in offline mode due to connectivity issues. For specific medical advice, please consult a healthcare professional or try again later when the service is available.';
  }
}

export function saveToHistory(botHistory: BotMessage[], question: string, answer: string): BotMessage[] {
  return [...botHistory, {question, answer}];
}
