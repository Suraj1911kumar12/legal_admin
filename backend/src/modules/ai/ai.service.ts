import { env } from '../../config/env';
import { ApiError } from '../../utils/ApiError';
import { IAIStructuredResponse } from './aiSession.model';

const LEGAL_ASSISTANT_SYSTEM_PROMPT = `You are LegalDost AI, an educational legal information assistant for Indian citizens.
Your role is to explain legal situations clearly in plain, calm, non-technical language.

STRICT LEGAL SAFETY RULES:
1. Identify clearly that this is AI-generated general legal information, NOT formal legal advice or a lawyer's opinion.
2. NEVER guarantee legal outcomes or promise courtroom success.
3. NEVER invent statute sections, case names, or court citations. Only reference widely recognized general concepts or explicitly state uncertainty if exact jurisdiction/statute depends on facts.
4. Distinguish clearly between facts the user provided and general legal context.
5. Encourage consulting a verified advocate when deadlines, police action, court filings, or high financial/liberty stakes exist.

Respond STRICTLY as valid JSON matching this schema:
{
  "plainReply": "Short conversational summary addressing the citizen warmly.",
  "followUpQuestions": ["Specific clarifying question 1?", "Specific clarifying question 2?"],
  "structured": {
    "understandingYourProblem": "Plain-language summary of the user's stated situation.",
    "importantFacts": ["Fact 1 stated by user", "Fact 2 stated by user"],
    "missingInformation": ["Missing fact or document needed"],
    "whatLawGenerallySays": "Calm, plain-language explanation of general legal principles relevant in India without inventing citations.",
    "possibleOptions": [
      {
        "title": "Option title",
        "explanation": "Plain-language explanation of this path",
        "whenRelevant": "When this option typically applies",
        "informationNeeded": ["Detail needed"],
        "documentsRequired": ["Document name"],
        "nextStep": "Concrete safe next step",
        "limitations": "Important risks or limits of this option",
        "sources": ["General statutory framework name if certain, else empty"]
      }
    ],
    "documentsYouMayNeed": ["Document 1", "Document 2"],
    "suggestedNextSteps": ["Step 1", "Step 2"],
    "whenProfessionalHelpUseful": "Clear guidance on when speaking with an advocate is recommended.",
    "uncertaintyNotes": "Any caveats depending on missing facts or local rules.",
    "disclaimer": "AI-generated legal information only. Not formal legal advice.",
    "likelyCategory": "One of: Employment & Labour, Landlord & Tenant, Property & Real Estate, Consumer Protection, Family & Matrimonial, Criminal & Police Matters, Civil & Contract Disputes, Cyber & Financial Fraud, General Legal",
    "sources": [
      { "title": "General Reference", "reference": "Description without fabricated citations" }
    ]
  }
}`;

export interface AIProviderStatus {
  configured: boolean;
  provider: 'gemini' | 'openai' | 'none';
  message: string;
}

export class AIService {
  static getStatus(): AIProviderStatus {
    if (env.GEMINI_API_KEY && env.GEMINI_API_KEY.trim().length > 10) {
      return {
        configured: true,
        provider: 'gemini',
        message: 'AI legal information service is ready.'
      };
    }
    if (env.OPENAI_API_KEY && env.OPENAI_API_KEY.trim().length > 10) {
      return {
        configured: true,
        provider: 'openai',
        message: 'AI legal information service is ready.'
      };
    }
    return {
      configured: false,
      provider: 'none',
      message:
        'AI analysis provider is not configured on the server. You can still save your legal problem, upload documents, and connect with verified lawyers.'
    };
  }

  static async analyzeConversation(params: {
    history: { role: 'user' | 'assistant'; content: string }[];
    preferredLanguage?: string;
    contextSummary?: string;
  }): Promise<{
    reply: string;
    followUpQuestions: string[];
    structuredResponse: IAIStructuredResponse;
  }> {
    const status = this.getStatus();
    if (!status.configured) {
      throw new ApiError(503, status.message, [{ code: 'AI_UNAVAILABLE', configured: false }]);
    }

    const langInstruction =
      params.preferredLanguage && params.preferredLanguage !== 'en'
        ? `User preferred language code: ${params.preferredLanguage}. Provide plain explanations keeping English JSON keys.`
        : '';

    const contextBlock = params.contextSummary
      ? `Background context from user intake/documents:\n${params.contextSummary}\n`
      : '';

    const conversationText = params.history
      .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
      .join('\n\n');

    const fullUserPrompt = `${langInstruction}\n${contextBlock}\nConversation:\n${conversationText}\n\nReturn ONLY valid JSON.`;

    let rawJsonText = '';

    if (status.provider === 'gemini') {
      const model = env.AI_MODEL || 'gemini-2.5-flash';
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(
        env.GEMINI_API_KEY
      )}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: LEGAL_ASSISTANT_SYSTEM_PROMPT }] },
          contents: [{ role: 'user', parts: [{ text: fullUserPrompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.2
          }
        })
      });

      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        throw new ApiError(502, 'AI service returned an upstream error. Please try again later.', [
          { provider: 'gemini', status: response.status, detail: errText.slice(0, 200) }
        ]);
      }

      const data: any = await response.json();
      rawJsonText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } else if (status.provider === 'openai') {
      const model = env.AI_MODEL || 'gpt-4o-mini';
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model,
          temperature: 0.2,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: LEGAL_ASSISTANT_SYSTEM_PROMPT },
            { role: 'user', content: fullUserPrompt }
          ]
        })
      });

      if (!response.ok) {
        throw new ApiError(502, 'AI service returned an upstream error. Please try again later.', [
          { provider: 'openai', status: response.status }
        ]);
      }

      const data: any = await response.json();
      rawJsonText = data?.choices?.[0]?.message?.content || '';
    }

    if (!rawJsonText) {
      throw new ApiError(502, 'AI provider returned an empty response. Please try again.');
    }

    let parsed: any;
    try {
      const cleaned = rawJsonText.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      throw new ApiError(502, 'AI provider response could not be parsed cleanly. Please retry.');
    }

    const structured = parsed.structured || {};
    const structuredResponse: IAIStructuredResponse = {
      understandingYourProblem: String(structured.understandingYourProblem || ''),
      importantFacts: Array.isArray(structured.importantFacts) ? structured.importantFacts.map(String) : [],
      missingInformation: Array.isArray(structured.missingInformation)
        ? structured.missingInformation.map(String)
        : [],
      whatLawGenerallySays: String(structured.whatLawGenerallySays || ''),
      possibleOptions: Array.isArray(structured.possibleOptions) ? structured.possibleOptions : [],
      documentsYouMayNeed: Array.isArray(structured.documentsYouMayNeed)
        ? structured.documentsYouMayNeed.map(String)
        : [],
      suggestedNextSteps: Array.isArray(structured.suggestedNextSteps)
        ? structured.suggestedNextSteps.map(String)
        : [],
      whenProfessionalHelpUseful: String(structured.whenProfessionalHelpUseful || ''),
      uncertaintyNotes: String(structured.uncertaintyNotes || ''),
      disclaimer: String(
        structured.disclaimer ||
          'AI-generated legal information only. This is not legal advice and does not create an attorney-client relationship.'
      ),
      likelyCategory: String(structured.likelyCategory || 'General Legal'),
      sources: Array.isArray(structured.sources) ? structured.sources : []
    };

    return {
      reply: String(parsed.plainReply || structuredResponse.understandingYourProblem),
      followUpQuestions: Array.isArray(parsed.followUpQuestions)
        ? parsed.followUpQuestions.map(String)
        : [],
      structuredResponse
    };
  }
}
