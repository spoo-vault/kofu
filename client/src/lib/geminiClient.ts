import { ParsedAgreementInput } from '@kofu/shared';

// Client-side Gemini key from environment variables (never committed to git)
const CLIENT_GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

export class ClientGeminiService {
  /**
   * Parse natural language into structured Soroban escrow agreement using Gemini 2.5 Flash
   */
  public static async parseWithGemini(prompt: string): Promise<ParsedAgreementInput | null> {
    const text = prompt.trim();
    if (!text) return null;

    const apiKey = CLIENT_GEMINI_KEY;
    if (!apiKey) return null;

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const systemInstruction = `You are KOFU's AI Escrow Protocol Parser on Stellar and Soroban.
Extract structured economic agreement parameters from user input.
Supported currencies on Stellar: USDC, XLM, EURC. Default to USDC.
Return strictly valid JSON conforming to this schema:
{
  "counterparty": "string (name, handle, or agent)",
  "counterpartyType": "human" | "agent",
  "amount": number,
  "currency": "USDC" | "XLM" | "EURC",
  "condition": "string (clear verifiable deliverable milestone)",
  "deadline": "string (e.g. Tomorrow, 48 Hours, Friday)",
  "escrowRequired": boolean,
  "autonomyLevel": "MANUAL" | "ASSISTED" | "AUTONOMOUS",
  "confidence": number between 0.85 and 0.99
}`;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: `${systemInstruction}\n\nUser Prompt: "${text}"` }],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      }),
    });

    if (!res.ok) {
      throw new Error(`Gemini API returned status ${res.status}`);
    }

    const json = await res.json();
    const rawContent = json?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawContent) return null;

    const parsed = JSON.parse(rawContent);
    const parsedAmount = typeof parsed.amount === 'number'
      ? parsed.amount
      : (parseFloat(parsed.amount) || 50);

    return {
      counterparty: parsed.counterparty || 'Counterparty',
      counterpartyType: parsed.counterpartyType === 'agent' ? 'agent' : 'human',
      amount: parsedAmount,
      currency: ['USDC', 'XLM', 'EURC'].includes(parsed.currency) ? parsed.currency : 'USDC',
      condition: parsed.condition || 'Deliverable completed and verified',
      deadline: parsed.deadline || 'Tomorrow',
      escrowRequired: parsed.escrowRequired !== false,
      rawText: text,
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.96,
      autonomyLevel: ['MANUAL', 'ASSISTED', 'AUTONOMOUS'].includes(parsed.autonomyLevel)
        ? parsed.autonomyLevel
        : 'ASSISTED',
    };
  }

  /**
   * Refines/clarifies a condition to make it cryptographically or programmatically verifiable
   */
  public static async refineCondition(condition: string): Promise<string> {
    const text = condition.trim();
    if (!text) return condition;

    const apiKey = CLIENT_GEMINI_KEY;
    if (!apiKey) return condition;

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{
              text: `Refine this escrow condition into a concise, verifiable on-chain milestone for a smart contract (e.g. mention specific verifiable artifacts like PR, commit, test report, or signature). Keep under 15 words. Return only the revised condition sentence without quotes:\n\nCondition: "${text}"`
            }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 60,
        },
      }),
    });

    if (!res.ok) return condition;
    const json = await res.json();
    const refined = json?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    return refined || condition;
  }
}
