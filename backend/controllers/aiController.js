import { GoogleGenAI } from '@google/genai';
import asyncHandler from '../middleware/asyncHandler.js';
import User from '../models/User.js';

// @desc    Smart AI Support Assistant (Gemini)
// @route   POST /api/ai/assistant
// @access  Public
export const askAssistant = asyncHandler(async (req, res, next) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "Messages array is required." });
  }

  const userQuery = messages[messages.length - 1].text;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    console.warn("Using smart local fallback responder because GEMINI_API_KEY is not configured.");
    const fallbackResponse = generateSmartLocalResponse(userQuery);
    return res.json({ response: fallbackResponse });
  }

  try {
    // Instantiate real GoogleGenAI server-side SDK
    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    // Extract verified service providers summary
    let providersListSummary = "";
    try {
      const verifiedUsers = await User.find({ role: 'provider' });
      providersListSummary = verifiedUsers
        .map((p) => `- Name: ${p.name}, Category: ${p.providerDetails?.category}, Hourly Rate: ₹${p.providerDetails?.rate}/hr, Rating: ${p.providerDetails?.rating}★, Bio: ${p.providerDetails?.bio}`)
        .join('\n');
    } catch (err) {
      // Database not connected, fallback to standard list
      providersListSummary = "- Name: Ramesh Kumar, Category: Electrician, Hourly Rate: ₹299/hr\n- Name: Sunita Sharma, Category: Cook / Chef, Rate: ₹199/hr";
    }

    const systemInstruction = `You are "SevaSaathi AI Mitra", a humanized, warm, and hyper-helpful expert local household support assistant for Indian customers.
Your role is to:
1. Provide diagnostic checklists and easy, practical DIY steps for household issues like pipe leakages, circuit trips, AC diagnostics, food preparation advice, or car breakdowns.
2. Recommend local SevaSaathi service providers when tasks require expert handymen. Use the active marketplace database provided below.
3. Keep answers friendly, professional, practical, and highly formatted with bullet points or clear steps. Use occasional polite Hindi words if natural (like Namaste, Shreya, Seva).

Marketplace active experts available for hiring right now:
${providersListSummary}

Answer user questions directly based on this instruction. Refer specifically to real experts Ramesh Kumar (Electrician), Sunita Sharma (Cook), or Vikram Singh (Plumber) if relevant to their inquiry!`;

    const chatHistory = messages.map((m) => ({
      role: m.sender === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }]
    }));

    // Generate output with gemini-3.5-flash
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: chatHistory,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7
      }
    });

    const aiText = response.text || "I am here to assist you with SevaSaathi services. How can I help you today?";
    return res.json({ response: aiText });

  } catch (error) {
    console.error("Gemini AI API Call failed:", error);
    const fallbackResponse = generateSmartLocalResponse(userQuery);
    return res.json({ response: `[AI Mitra Mode] ${fallbackResponse}` });
  }
});

// Context-aware fallback generator
function generateSmartLocalResponse(query) {
  const q = query.toLowerCase();
  
  if (q.includes('leak') || q.includes('pipe') || q.includes('water') || q.includes('plumb')) {
    return `Namaste! Leaking pipes or water clogging can quickly escalate. Here is a quick 3-step DIY checklist:
1. **Shut off the Main Valve**: Instantly stop the water supply to prevent flooding.
2. **Apply Sealant Tape**: If it is a minor crack, wrap Teflon tape or waterproof sealant tightly.
3. **Hire an Expert**: Plumbing work requires correct wrench sizing. 

On SevaSaathi, I highly recommend booking **Vikram Singh**, our certified plumber (rated 4.5★, ₹249/hr) who has completed multiple high-quality jobs! You can hire him right now from the "Book Service" tab.`;
  }
  
  if (q.includes('wire') || q.includes('short') || q.includes('light') || q.includes('electricity') || q.includes('fan') || q.includes('electrician')) {
    return `Electrical issues are hazardous. Please prioritize safety!
1. **Trip the Main MCB**: Head to your fuse box and shut down power to that zone immediately.
2. **Avoid Wet Areas**: Never touch wiring or metal fixtures with damp hands or while standing on wet floors.
3. **Check Inverter Connection**: If power went out, ensure your home inverter didn't trip.

For a permanent electrical fix, you can book our top-rated SevaSaathi expert, **Ramesh Kumar** (rated 4.8★, ₹299/hr). He is fully verified and carries certified safety equipment.`;
  }

  if (q.includes('food') || q.includes('cook') || q.includes('paneer') || q.includes('dinner') || q.includes('lunch') || q.includes('chef')) {
    return `A delicious, hygienic home-cooked meal makes any day better!
If you are planning an event or looking for a regular daily chef:
1. **Sunita Sharma** is our premium SevaSaathi Cook (rated 4.9★, ₹199/hr).
2. She specializes in authentic North Indian (Paneer Butter Masala, Dal Makhani) and healthy South Indian meals.
3. You can book her directly from your dashboard and mention your preferred spices and dietary guidelines in the notes!`;
  }

  return `Namaste! I am **SevaSaathi AI Mitra**, your 24/7 smart assistant. 

How can I help you today?
- Ask me for a **DIY troubleshooting checklist** for leaky taps, tripped MCBs, or bad brakes.
- Let me recommend verified local handymen like **Ramesh Kumar** (Electrician) or **Vikram Singh** (Plumber).
- Or ask about booking pricing and tracking your scheduled doorstep appointments!`;
}
