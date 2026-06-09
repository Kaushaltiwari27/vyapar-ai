import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export interface Intent {
  type: 'approval' | 'query' | 'briefing' | 'action' | 'other';
  subtype?: string;
  entity?: string;
  confidence: number;
}

export async function classifyIntent(text: string): Promise<Intent> {
  const lower = text.toLowerCase().trim();

  // Fast pattern matching first (no AI call needed)
  if (/^(haan|ha|yes|approve|kar do|theek hai|ok|okay|haa|bilkul)$/i.test(lower)) {
    return { type: 'approval', subtype: 'yes', confidence: 1.0 };
  }
  if (/^(nahi|na|no|reject|mat karo|band karo|cancel)$/i.test(lower)) {
    return { type: 'approval', subtype: 'no', confidence: 1.0 };
  }
  if (/briefing|summary|update|aaj ka|kya ho raha|status/i.test(lower)) {
    return { type: 'briefing', confidence: 0.95 };
  }

  // Gemini for complex intents
  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      systemInstruction: `Classify WhatsApp messages from Indian business owners. Return ONLY valid JSON without markdown formatting like \`\`\`json.
Intent types:
- "approval": approving/rejecting something (haan, nahi, approve, reject)
- "query": asking about data (revenue, deals, employees, stock, payroll)
- "briefing": asking for a summary or update
- "action": requesting a task (send invoice, create PO, mark attendance)
- "other": general conversation

Return: {"type":"string","subtype":"optional","entity":"optional","confidence":0.0-1.0}`
    });

    const response = await model.generateContent(`Message: "${text}"`);
    let textResult = response.response.text().trim();
    if (textResult.startsWith('```json')) {
      textResult = textResult.replace(/^```json\n/, '').replace(/\n```$/, '');
    } else if (textResult.startsWith('```')) {
      textResult = textResult.replace(/^```\n/, '').replace(/\n```$/, '');
    }
    return JSON.parse(textResult);
  } catch (error) {
    console.error("Intent classification error:", error);
    return { type: 'other', confidence: 0.5 };
  }
}
