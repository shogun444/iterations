import { createLibrary, defineComponent } from "@openuidev/lang-core";
import type { ComponentRenderer } from "@openuidev/react-lang";
import { z } from "zod/v4";

export const priorities = ["urgent", "high", "normal", "low", "priority", "not priority"] as const;

export const todoProps = {
  Option: z.object({
    label: z.string().describe("What the user might tap or say next, 2 to 6 words"),
    kind: z.enum(["urgent", "focus", "plan", "clean"]).optional(),
  }),
  TaskItem: z.object({
    id: z.string().describe("Short unique ID, e.g. 't1'"),
    title: z.string().describe("The task action, 3 to 8 words"),
    done: z.boolean().optional().describe("Whether this task is completed"),
    priority: z.enum(priorities).optional().describe("Urgency level"),
    due: z.string().optional().describe("When it is due, e.g. 'Today 2pm', 'Tomorrow'"),
    note: z.string().optional().describe("Handwritten aside, 1 to 4 words"),
  }),
  TaskCard: z.object({
    id: z.string().describe("Short ID, e.g. 'card1'"),
    title: z.string().describe("Task description"),
    priority: z.enum(priorities).describe("Urgency level"),
    due: z.string().optional().describe("Due time or deadline"),
    tag: z.string().optional().describe("Category label"),
    note: z.string().optional().describe("Handwritten tip"),
  }),
  StatCard: z.object({
    label: z.string().describe("What is measured, e.g. 'High Priority', 'Completed'"),
    value: z.string().describe("The stat, e.g. '3 of 5', '80%'"),
    note: z.string().optional().describe("Handwritten note, 1 to 3 words"),
  }),
  MealCard: z.object({
    name: z.string().describe("Meal or recipe name, 2 to 6 words"),
    protein: z.string().describe("Protein content, e.g. '48g Protein'"),
    calories: z.string().optional().describe("Calorie estimate, e.g. '540 kcal'"),
    tag: z.string().optional().describe("Meal slot, e.g. 'Breakfast', 'Post-Workout', 'Dinner'"),
    imageUrl: z.string().optional().describe("High-res food photo URL from Unsplash"),
    description: z.string().optional().describe("Nutritional breakdown and benefits, 8 to 20 words"),
    note: z.string().optional().describe("Handwritten note, 1 to 4 words"),
  }),
  ExerciseCard: z.object({
    name: z.string().describe("Exercise name, e.g. 'Barbell Bench Press'"),
    setsReps: z.string().describe("Sets and reps, e.g. '3 sets x 8 reps'"),
    muscle: z.string().optional().describe("Target muscle group, e.g. 'Chest & Triceps'"),
    imageUrl: z.string().optional().describe("Gym or exercise photo URL from Unsplash"),
    cue: z.string().optional().describe("Form coaching cue, 6 to 18 words"),
    note: z.string().optional().describe("Handwritten note, 1 to 4 words"),
  }),
};

export const todoBlocks = [
  "AgentActivity",
  "DailyHeadline",
  "FocusPull",
  "Heading",
  "TaskList",
  "TodoCalendar",
  "StatsRow",
  "Question",
  "FollowUps",
  "MacroSummary",
  "MealPlan",
  "TrainingPlan",
] as const;

type Views = {
  [K in keyof typeof todoProps]: ComponentRenderer<z.infer<(typeof todoProps)[K]>>;
} & Record<(typeof todoBlocks)[number] | "TodoBoard" | "TaskCards", ComponentRenderer<never>>;

export function buildTodoLibrary(views: Views) {
  const part = <K extends keyof typeof todoProps>(name: K, description: string) =>
    defineComponent({ name, props: todoProps[name], description, component: views[name] as ComponentRenderer<never> });

  const Option = part("Option", "A tappable quick reply action.");
  const TaskItem = part("TaskItem", "A single row item inside a TaskList.");
  const TaskCard = part("TaskCard", "Deprecated: do NOT use.");
  const StatCard = part("StatCard", "A small status summary metric.");
  const MealCard = part("MealCard", "A rich editorial meal card with photo, protein content, calories, and benefits.");
  const ExerciseCard = part("ExerciseCard", "An exercise card with sets, reps, muscle target, photo, and technique cue.");

  const block = (name: (typeof todoBlocks)[number], shape: z.ZodObject, description: string) =>
    defineComponent({ name, props: shape, description, component: views[name] });

  const AgentActivity = block(
    "AgentActivity",
    z.object({
      title: z.string().optional().describe("Summary of what agent did"),
      tasks: z.array(z.any()).optional().describe("List of task activities"),
    }),
    "A streaming log of what an agent actually did.",
  );

  const DailyHeadline = block(
    "DailyHeadline",
    z.object({
      text: z.string().describe("The editorial headline, 3 to 10 words. May mark with ==highlight== or _underline_"),
    }),
    "A grand editorial headline that opens the board.",
  );

  const FocusPull = block(
    "FocusPull",
    z.object({
      text: z.string().describe("One clear sentence defining the key priority, 6 to 18 words"),
      note: z.string().optional().describe("A handwritten note in the margin, 2 to 6 words, lower case"),
    }),
    "A pull-quote defining the day's singular focus.",
  );

  const Heading = block(
    "Heading",
    z.object({ text: z.string().describe("Section header, 2 to 5 words") }),
    "A section heading.",
  );

  const TaskCards = defineComponent({
    name: "TaskCards",
    props: z.object({ cards: z.array(z.any()).optional() }),
    description: "Deprecated: do NOT use. Cards are removed.",
    component: views.TaskCards as never,
  });

  const TaskList = block(
    "TaskList",
    z.object({
      title: z.string().describe("The list section title, e.g. 'Today's High Impact'"),
      items: z.array(TaskItem.ref).describe("3 to 6 task items"),
    }),
    "An interactive checklist of tasks.",
  );

  const TodoCalendar = block(
    "TodoCalendar",
    z.object({
      title: z.string().optional().describe("Schedule or month title, e.g. 'Schedule & Deadlines'"),
      selectedDate: z.string().optional().describe("Selected ISO date 'YYYY-MM-DD'"),
      markedDates: z.array(z.string()).optional().describe("Dates with scheduled tasks 'YYYY-MM-DD'"),
      note: z.string().optional().describe("Handwritten tip, 2 to 6 words"),
    }),
    "An interactive monthly calendar marking dates that have scheduled todos.",
  );

  const StatsRow = block(
    "StatsRow",
    z.object({ stats: z.array(StatCard.ref).describe("2 or 3 stat summaries") }),
    "A row of metric chips or stat counters.",
  );

  const Question = block(
    "Question",
    z.object({
      text: z.string().describe("Question to clarify next step, 4 to 10 words"),
      options: z.array(Option.ref).describe("3 to 5 options"),
    }),
    "A question with tappable options to steer priorities.",
  );

  const FollowUps = block(
    "FollowUps",
    z.object({
      options: z.array(Option.ref).describe("3 or 4 suggested follow-up actions"),
    }),
    "Tappable pills for what to do or ask next.",
  );

  const MacroSummary = block(
    "MacroSummary",
    z.object({
      bodyWeight: z.string().describe("Body weight, e.g. '70 kg' or '165 lbs'"),
      proteinTarget: z.string().describe("Calculated daily protein target, e.g. '145g - 160g / day'"),
      formula: z.string().optional().describe("Formula used, e.g. '2.1g protein / kg body weight'"),
      calories: z.string().optional().describe("Daily calories, e.g. '2,450 kcal'"),
      carbs: z.string().optional().describe("Carbs target, e.g. '280g Carbs'"),
      fats: z.string().optional().describe("Fats target, e.g. '65g Healthy Fats'"),
      explanation: z.string().optional().describe("Scientific reason for this protein intake, 10 to 25 words"),
      note: z.string().optional().describe("Handwritten nutritional tip, 2 to 5 words"),
    }),
    "A macronutrient and protein calculation card tailored to the user's body weight.",
  );

  const MealPlan = block(
    "MealPlan",
    z.object({
      title: z.string().describe("Section title, e.g. 'High-Protein Daily Fuel'"),
      meals: z.array(MealCard.ref).describe("2 to 4 high-protein meal cards"),
      note: z.string().optional().describe("Handwritten aside, 2 to 6 words"),
    }),
    "A visual culinary card deck of high-protein meals with photos, macros, and coaching tips.",
  );

  const TrainingPlan = block(
    "TrainingPlan",
    z.object({
      title: z.string().describe("Routine title, e.g. 'Push Day Hypertrophy Workout'"),
      focus: z.string().optional().describe("Target focus, e.g. 'Chest, Front Delts & Triceps'"),
      exercises: z.array(ExerciseCard.ref).describe("3 to 5 exercise cards with sets and reps"),
      note: z.string().optional().describe("Handwritten coaching note, 2 to 6 words"),
    }),
    "A visual training routine featuring exercise cards, sets, reps, coaching cues, and photos.",
  );

  const all = [
    AgentActivity,
    DailyHeadline,
    FocusPull,
    Heading,
    TaskList,
    TodoCalendar,
    StatsRow,
    Question,
    FollowUps,
    MacroSummary,
    MealPlan,
    TrainingPlan,
  ];

  const TodoBoard = defineComponent({
    name: "TodoBoard",
    props: z.object({
      blocks: z.array(z.union(all.map((b) => b.ref) as never)),
    }),
    description: "The root container: one todo board reply.",
    component: views.TodoBoard,
  });

  return createLibrary<ComponentRenderer<any>>({
    root: "TodoBoard",
    components: [
      TodoBoard,
      ...all,
      Option,
      TaskItem,
      StatCard,
      TaskCard,
      TaskCards,
      MealCard,
      ExerciseCard,
    ] as never[],
  });
}

export const todoSpec = () => {
  const none = () => null;
  const views = Object.fromEntries(
    [...todoBlocks, "TaskCards", "TodoBoard", ...Object.keys(todoProps)].map((k) => [k, none]),
  );
  return buildTodoLibrary(views as unknown as Views).toSpec();
};
