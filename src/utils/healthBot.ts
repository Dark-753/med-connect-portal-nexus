import { supabase } from '@/integrations/supabase/client';

interface BotMessage {
  question: string;
  answer: string;
}

export async function askHealthBot(botQuestion: string): Promise<string> {
  if (!botQuestion.trim()) return '';
  
  try {
    const { data, error } = await supabase.functions.invoke('health-bot', {
      body: { question: botQuestion }
    });

    if (error) {
      console.error('HealthBot function error:', error);
      return getOfflineResponse(botQuestion);
    }

    if (data?.fallback) {
      console.log('Using fallback response due to API issues');
      return getOfflineResponse(botQuestion);
    }

    if (data?.answer) {
      return data.answer;
    }

    return getOfflineResponse(botQuestion);
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
    return 'Diabetes is a condition where your body either does not make enough insulin or cannot effectively use the insulin it produces. Symptoms may include increased thirst, frequent urination, and fatigue. Management typically includes monitoring blood sugar, medication, proper diet, and regular exercise.';
  } else if (questionLower.includes('exercise') || questionLower.includes('workout')) {
    return 'Regular physical activity offers numerous health benefits including weight management, reduced risk of chronic diseases, stronger muscles and bones, and improved mental health. Aim for at least 150 minutes of moderate aerobic activity or 75 minutes of vigorous activity each week, along with muscle-strengthening activities.';
  } else if (questionLower.includes('diet') || questionLower.includes('nutrition')) {
    return 'A balanced diet rich in fruits, vegetables, whole grains, lean proteins, and healthy fats provides essential nutrients for good health. Limit processed foods, added sugars, and excessive sodium. Proper nutrition helps maintain a healthy weight and reduces the risk of chronic diseases.';
  } else if (questionLower.includes('sleep') || questionLower.includes('insomnia')) {
    return 'Good sleep hygiene is essential for health. Adults should aim for 7-9 hours of sleep per night. Maintain a regular sleep schedule, create a comfortable sleep environment, limit screen time before bed, and avoid caffeine late in the day. If sleep problems persist, consult a healthcare professional.';
  } else if (questionLower.includes('stress') || questionLower.includes('anxiety')) {
    return 'Stress management is important for overall health. Try relaxation techniques like deep breathing, meditation, or yoga. Regular exercise, adequate sleep, and social support can help. If stress or anxiety significantly impacts your daily life, consider speaking with a mental health professional.';
  } else if (questionLower.includes('heart') || questionLower.includes('cardiovascular')) {
    return 'Heart health can be maintained through regular exercise, a balanced diet low in saturated fats, not smoking, limiting alcohol, and managing stress. Regular check-ups and monitoring blood pressure and cholesterol levels are important for cardiovascular health.';
  } else if (questionLower.includes('weight') || questionLower.includes('obesity')) {
    return 'Healthy weight management involves a balanced diet and regular physical activity. Focus on whole foods, portion control, and sustainable lifestyle changes rather than quick fixes. Consult with healthcare professionals for personalized advice and support.';
  } else {
    return "I'm currently operating in offline mode due to connectivity issues with the main AI service. However, I can still help with basic health questions about common conditions like headaches, diabetes, blood pressure, exercise, diet, and more. For specific medical advice, please consult a healthcare professional.";
  }
}

export function saveToHistory(botHistory: BotMessage[], question: string, answer: string): BotMessage[] {
  return [...botHistory, {question, answer}];
}
