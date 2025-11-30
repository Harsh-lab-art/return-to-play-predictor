import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, messages } = await req.json();
    console.log("Received message:", message);

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from JWT
    const jwt = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(jwt);
    
    if (userError || !user) {
      console.error("User error:", userError);
      throw new Error("Unauthorized");
    }

    console.log("User authenticated:", user.id);

    // Get athlete profile
    const { data: profile, error: profileError } = await supabase
      .from("athlete_profiles")
      .select("id, full_name, sport, date_of_birth")
      .eq("user_id", user.id)
      .single();

    if (profileError || !profile) {
      console.error("Profile error:", profileError);
      throw new Error("Profile not found");
    }

    console.log("Profile found:", profile.id);

    // Get current injury
    const { data: injury, error: injuryError } = await supabase
      .from("injuries")
      .select("*")
      .eq("athlete_id", profile.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    console.log("Injury data:", injury);

    // Get recovery recommendations
    const { data: recommendations, error: recError } = await supabase
      .from("recovery_recommendations")
      .select("*")
      .eq("athlete_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(1);

    console.log("Recommendations:", recommendations);

    if (!recommendations || recommendations.length === 0) {
      return new Response(
        JSON.stringify({ 
          response: "I don't have any recovery recommendations to discuss yet. Please upload a medical report to get started." 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const recoveryData = recommendations[0];

    // Build context for AI
    const context = `
You are a healthcare AI assistant helping an athlete understand their recovery plan.

ATHLETE INFORMATION:
- Name: ${profile.full_name}
- Sport: ${profile.sport}
- Age: ${new Date().getFullYear() - new Date(profile.date_of_birth).getFullYear()} years

${injury ? `CURRENT INJURY:
- Type: ${injury.injury_type}
- Location: ${injury.injury_location}
- Severity: ${injury.severity}
- Date: ${injury.injury_date}
- Mechanism: ${injury.mechanism || 'Not specified'}
- Symptoms: ${injury.symptoms || 'Not specified'}
` : ''}

RECOVERY RECOMMENDATIONS:
- Predicted Return-to-Play: ${recoveryData.predicted_rtp_days_min}-${recoveryData.predicted_rtp_days_max} days
- Rest Days Recommended: ${recoveryData.rest_days_recommended}
- Daily Calories: ${recoveryData.daily_calories}
- Daily Protein: ${recoveryData.daily_protein_grams}g
- Model Confidence: ${Math.round(recoveryData.confidence_score * 100)}%

${recoveryData.key_risk_factors ? `KEY RISK FACTORS:
${JSON.stringify(recoveryData.key_risk_factors, null, 2)}` : ''}

${recoveryData.rehabilitation_phases ? `REHABILITATION PHASES:
${JSON.stringify(recoveryData.rehabilitation_phases, null, 2)}` : ''}

CLINICAL NOTES:
${recoveryData.clinical_notes || 'No clinical notes available'}

Instructions:
- Answer questions about the recovery plan, clinical notes, and recommendations
- Be empathetic and supportive
- Provide clear, actionable advice based on the data
- If asked about something not in the data, be honest about limitations
- Always remind the user to consult with their healthcare provider for medical decisions
- Keep responses concise but informative
`;

    console.log("Calling Lovable AI...");

    // Call Lovable AI
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // Build messages array for AI
    const aiMessages = [
      { role: "system", content: context },
      ...messages.slice(0, -1).map((msg: any) => ({
        role: msg.role,
        content: msg.content
      })),
      { role: "user", content: message }
    ];

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: aiMessages,
        temperature: 0.7,
        max_tokens: 500
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI API error:", aiResponse.status, errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    console.log("AI response received");

    const assistantMessage = aiData.choices?.[0]?.message?.content || "I apologize, but I couldn't generate a response.";

    return new Response(
      JSON.stringify({ response: assistantMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in healthcare-chat:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        response: "I encountered an error processing your request. Please try again." 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});