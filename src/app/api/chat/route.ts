import librarySpec from "@/generated/spec.json";
import { createOpenAI } from "@ai-sdk/openai";
import { generateSystemPrompt } from "@openuidev/lang-core";
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  stepCountIs,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from "ai";

import { storeTurn } from "@/lib/history";
import { resolveRequestedModel } from "@/lib/models";
import { appTools } from "@/lib/tools";

const { promptOptions, ...library } = librarySpec;

export const runtime = "nodejs";

const apiKey = process.env.THESYS_API_KEY || "";
const openai = createOpenAI({ baseURL: "https://api.thesys.dev/v1/embed", apiKey: apiKey || "dummy" });

function sanitizeOpenUIProgram(rawCode: string): string {
  let lines = rawCode
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  // 1. Remove markdown fences if model added them
  lines = lines.filter((l) => !l.startsWith("```"));

  // 2. Strip any TaskCard or TaskCards statements (cards are completely removed)
  lines = lines.filter((l) => !/=\s*TaskCard\s*\(/.test(l) && !/=\s*TaskCards\s*\(/.test(l));

  // 3. Discard any unfinished trailing line (must end with closing parenthesis)
  lines = lines.filter((l) => /\)\s*$/.test(l));

  // 4. Fix duplicate trailing double quotes e.g. `=="")` -> `==")`
  lines = lines.map((l) => l.replace(/""\)/g, '")'));

  // 5. Detect defined statements
  const defined = new Set<string>();
  for (const l of lines) {
    const m = l.match(/^([a-zA-Z_]\w*)\s*=/);
    if (m) defined.add(m[1]);
  }

  // 6. Guarantee MULTI-ITEM for TrainingPlan (minimum 4-5 exercises: never just 1!)
  const trainingPlanLineIdx = lines.findIndex((l) => /=\s*TrainingPlan\s*\(/.test(l));
  if (trainingPlanLineIdx !== -1) {
    const headlineLine = lines.find((l) => /=\s*DailyHeadline\s*\(/.test(l)) || "";
    const trainingPlanLine = lines[trainingPlanLineIdx] || "";
    const contextText = `${headlineLine} ${trainingPlanLine}`.toLowerCase();

    const isPull = /\bpull\b|\bback\b|\bbiceps?\b|\brows?\b/.test(contextText);
    const isLegs = /\blegs?\b|\bsquats?\b|\bquads?\b|\bhamstrings?\b|\bcalves\b/.test(contextText);

    const defaultPushExercises = [
      'ex1 = ExerciseCard("Barbell Flat Bench Press", "3–4 sets · 6–8 reps · 2–3 min rest", "Chest & Triceps", "", "Retract scapulae, touch lower sternum with control, and explode upward.", "heavy compound")',
      'ex2 = ExerciseCard("Standing Overhead Press", "3 sets · 8–10 reps · 2 min rest", "Anterior Deltoids", "", "Squeeze glutes and brace core firmly to prevent lower back arching.", "overhead power")',
      'ex3 = ExerciseCard("Incline Dumbbell Press", "3 sets · 8–10 reps · 90 sec rest", "Upper Pectorals", "", "Set bench at 30–45 degrees and control the 2-second eccentric stretch.", "hypertrophy")',
      'ex4 = ExerciseCard("Dumbbell Lateral Raises", "3 sets · 12–15 reps · 60 sec rest", "Side Deltoid Width", "", "Lean slightly forward, lead with elbows in the scapular plane.", "side delt burn")',
      'ex5 = ExerciseCard("Cable Rope Triceps Pushdowns", "3 sets · 10–12 reps · 60 sec rest", "Triceps Lockout", "", "Pin elbows to ribs, spread the rope apart at full lockout.", "peak contraction")',
    ];

    const defaultPullExercises = [
      'ex1 = ExerciseCard("Bent-Over Barbell Rows", "3–4 sets · 6–8 reps · 2–3 min rest", "Upper & Mid Back", "", "Hinge at hips, maintain flat spine, pull bar cleanly to lower ribcage.", "back thickness")',
      'ex2 = ExerciseCard("Neutral Grip Pull-Ups", "3–4 sets · 8–10 reps · 2 min rest", "Latissimus Dorsi", "", "Depress scapulae first, drive elbows straight down toward hips.", "lat width")',
      'ex3 = ExerciseCard("Cable Face Pulls", "3 sets · 12–15 reps · 60 sec rest", "Rear Delts & Rotator Cuff", "", "Pull rope to eye level while externally rotating your shoulders.", "scapular health")',
      'ex4 = ExerciseCard("Incline Dumbbell Curls", "3 sets · 10–12 reps · 60 sec rest", "Biceps Brachii", "", "Keep elbows locked in place, squeeze biceps hard at peak contraction.", "peak bicep")',
      'ex5 = ExerciseCard("Dumbbell Hammer Curls", "3 sets · 10–12 reps · 60 sec rest", "Brachialis & Forearms", "", "Maintain a neutral grip throughout and control the 2-second lowering phase.", "forearm grip")',
    ];

    const defaultLegExercises = [
      'ex1 = ExerciseCard("Barbell Back Squats", "3–4 sets · 6–8 reps · 3 min rest", "Quadriceps & Glutes", "", "Break at hips and knees together, hit parallel depth, drive through mid-foot.", "quad drive")',
      'ex2 = ExerciseCard("Romanian Deadlifts", "3 sets · 8–10 reps · 2 min rest", "Hamstrings & Glutes", "", "Hinge back at the hips, maintain a tight neutral spine, feel deep hamstring stretch.", "posterior chain")',
      'ex3 = ExerciseCard("Bulgarian Split Squats", "3 sets · 10–12 reps · 90 sec rest", "Quads & Stabilizers", "", "Drop rear knee toward floor with control, torso slightly pitched forward.", "unilateral strength")',
      'ex4 = ExerciseCard("Standing Calf Raises", "4 sets · 12–15 reps · 60 sec rest", "Gastrocnemius", "", "Pause for a full second at full stretch and explode to complete plantarflexion.", "ankle stability")',
    ];

    const targetSuite = isPull ? defaultPullExercises : isLegs ? defaultLegExercises : defaultPushExercises;
    const requiredIds = targetSuite.map((_, i) => `ex${i + 1}`);

    // If fewer than 4 exercises are defined, inject the missing ones
    for (let i = 0; i < targetSuite.length; i++) {
      const id = requiredIds[i];
      if (!defined.has(id)) {
        lines.push(targetSuite[i]);
        defined.add(id);
      }
    }

    // Ensure TrainingPlan references all defined exercises
    const tpLine = lines[trainingPlanLineIdx];
    lines[trainingPlanLineIdx] = tpLine.replace(/\[(.*?)\]/, `[${requiredIds.join(", ")}]`);
  }

  // 7. Guarantee MULTI-ITEM for MealPlan (strictly 4 meals: Breakfast, Lunch, Snack, Dinner)
  const mealPlanLineIdx = lines.findIndex((l) => /=\s*MealPlan\s*\(/.test(l));
  if (mealPlanLineIdx !== -1) {
    const defaultMeals = [
      'm1 = MealCard("Breakfast: three eggs and toast", "24g protein", "420 kcal", "Breakfast", "", "Whole egg complete bioavailable protein with complex carbohydrate fuel.", "energy boost")',
      'm2 = MealCard("Lunch: grilled chicken bowl", "38g protein", "540 kcal", "Post-Workout Lunch", "", "Lean chicken breast paired with easily digestible jasmine rice to reload glycogen.", "clean fuel")',
      'm3 = MealCard("Midday: bowl of Greek yogurt", "22g protein", "240 kcal", "Midday Snack", "", "Slow-digesting casein to sustain circulating amino acid levels between meals.", "casein rich")',
      'm4 = MealCard("Dinner: baked salmon fillet", "35g protein", "580 kcal", "Recovery Dinner", "", "Wild-caught salmon packed with anti-inflammatory omega-3 fatty acids.", "omega-3 packed")',
    ];
    const mealIds = ["m1", "m2", "m3", "m4"];

    for (let i = 0; i < defaultMeals.length; i++) {
      const id = mealIds[i];
      if (!defined.has(id)) {
        lines.push(defaultMeals[i]);
        defined.add(id);
      }
    }

    const mpLine = lines[mealPlanLineIdx];
    lines[mealPlanLineIdx] = mpLine.replace(/\[(.*?)\]/, `[${mealIds.join(", ")}]`);
  }

  // 8. Guarantee FollowUps definition
  if (!defined.has("f")) {
    lines.push('f = FollowUps([Option("Log today\'s sets"), Option("Build training routine")])');
    defined.add("f");
  }

  // 9. Clean references in arrays: e.g. [headline, focus, list, follow] -> remove undefined ones
  const sanitizedLines = lines.map((line) => {
    return line.replace(/\[(.*?)\]/g, (_match, inner) => {
      const items = inner
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean);
      const valid = items.filter((id: string) => {
        // String literal or number
        if (/^["'\d]/.test(id)) return true;
        // Inline component calls like Option("...")
        if (/^[A-Z]\w*\s*\(/.test(id)) return true;
        // Must be a defined identifier
        return defined.has(id);
      });
      return `[${valid.join(", ")}]`;
    });
  });

  // Ensure root references f
  const rootIdx = sanitizedLines.findIndex((l) => /^\s*root\s*=/.test(l));
  if (rootIdx !== -1 && !/\bf\b/.test(sanitizedLines[rootIdx])) {
    sanitizedLines[rootIdx] = sanitizedLines[rootIdx].replace(/\]\s*\)\s*$/, ", f])");
  }

  return sanitizedLines.join("\n");
}

export async function POST(req: Request) {
  const {
    messages,
    threadId,
    model: requestedModel,
  } = (await req.json()) as {
    messages?: UIMessage[];
    threadId?: string;
    model?: unknown;
  };

  if (!Array.isArray(messages) || messages.length === 0) {
    return badRequest("messages must be a non-empty UIMessage[]");
  }

  if (typeof threadId !== "string" || !threadId.trim()) {
    return badRequest("threadId is required");
  }

  const model = resolveRequestedModel(requestedModel);
  if (!model) {
    return badRequest("model is not available in this agent");
  }

  const modelMessages = await convertToModelMessages(messages);
  const question = modelMessages.at(-1);
  if (question?.role !== "user") {
    return badRequest("messages must end with a user message");
  }

  // Hook directly into local/cloud OUI-1 endpoint on port 8005
  if (model === "thesys/oui-1-local") {
    try {
      const system = generateSystemPrompt({ cloud: false, library, promptOptions });
      let promptHistory = "";
      for (const m of modelMessages) {
        const text =
          typeof m.content === "string"
            ? m.content
            : Array.isArray(m.content)
              ? m.content.map((p) => ("text" in p && typeof p.text === "string" ? p.text : "")).join("")
              : "";
        promptHistory += `\n${m.role === "user" ? "User" : "Assistant"}: ${text}`;
      }
      const fullPrompt = `${system}\n${promptHistory}\nAssistant:`;

      const res = await fetch("http://localhost:8005/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: fullPrompt }),
        signal: req.signal,
      });

      if (!res.ok) {
        const errText = await res.text();
        console.warn(`Local OUI-1 endpoint returned ${res.status}: ${errText}. Falling back to Cloud Gateway.`);
      } else {
        const data = (await res.json()) as { output?: string };
        const rawCode = (data.output || "").trim();
        const code = sanitizeOpenUIProgram(rawCode);

        const stream = createUIMessageStream({
          execute: async ({ writer }) => {
            writer.write({ type: "start-step" });
            writer.write({ type: "text-start", id: "oui-1-msg" });

            const lines = code.split("\n");
            for (let i = 0; i < lines.length; i++) {
              if (req.signal.aborted) break;
              const line = lines[i];
              writer.write({
                type: "text-delta",
                id: "oui-1-msg",
                delta: line + (i < lines.length - 1 ? "\n" : ""),
              });
              await new Promise((resolve) => setTimeout(resolve, 85));
            }

            writer.write({ type: "text-end", id: "oui-1-msg" });
            writer.write({ type: "finish-step" });

            if (apiKey && threadId) {
              try {
                await storeTurn({
                  apiKey,
                  conversationId: threadId,
                  messages: [
                    question,
                    { role: "assistant", content: [{ type: "text", text: code }] } as never,
                  ],
                });
              } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : String(err);
                if (!msg.includes("404") && !msg.includes("Conversation not found")) {
                  console.warn("Notice: OpenUI Cloud sync skipped:", msg);
                }
              }
            }
          },
        });

        return createUIMessageStreamResponse({ stream });
      }
    } catch (err) {
      console.warn("Notice: OUI-1 local endpoint on 8005 unavailable, streaming via Cloud Gateway:", err);
    }
  }

  // Cloud model fallback via Thesys Gateway
  const targetCloudModel = model === "thesys/oui-1-local" ? "google/gemini-3.6-flash-free" : model;
  const result = streamText({
    model: openai.chat(targetCloudModel),
    system: generateSystemPrompt({ cloud: true, library, promptOptions }),
    messages: modelMessages,
    tools: appTools,
    stopWhen: stepCountIs(5),
    abortSignal: req.signal,
    onEnd: async ({ responseMessages }) => {
      if (apiKey) {
        try {
          await storeTurn({
            apiKey,
            conversationId: threadId,
            messages: [question, ...responseMessages],
          });
        } catch (error) {
          console.error("Failed to save turn to OpenUI Cloud:", error);
        }
      }
    },
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  });
}

function badRequest(message: string): Response {
  return Response.json({ error: { message } }, { status: 400 });
}
