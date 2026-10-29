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
    title: z.string().describe("Task description, may use ==highlight== or _underline_"),
    priority: z.enum(priorities).describe("Urgency level"),
    due: z.string().optional().describe("Due time or deadline, e.g. '2h left', 'Today 5pm'"),
    tag: z.string().optional().describe("Category label, e.g. 'Product', 'Dev', 'Admin'"),
    note: z.string().optional().describe("Handwritten tip, 2 to 5 words, lower case"),
  }),
  StatCard: z.object({
    label: z.string().describe("What is measured, e.g. 'High Priority', 'Completed'"),
    value: z.string().describe("The stat, e.g. '3 of 5', '80%'"),
    note: z.string().optional().describe("Handwritten note, 1 to 3 words"),
  }),
};

export const todoBlocks = [
  "DailyHeadline",
  "FocusPull",
  "Heading",
  "TaskCards",
  "TaskList",
  "StatsRow",
  "Question",
  "FollowUps",
] as const;

type Views = {
  [K in keyof typeof todoProps]: ComponentRenderer<z.infer<(typeof todoProps)[K]>>;
} & Record<(typeof todoBlocks)[number] | "TodoBoard", ComponentRenderer<never>>;

export function buildTodoLibrary(views: Views) {
  const part = <K extends keyof typeof todoProps>(name: K, description: string) =>
    defineComponent({ name, props: todoProps[name], description, component: views[name] as ComponentRenderer<never> });

  const Option = part("Option", "A tappable quick reply action.");
  const TaskItem = part("TaskItem", "A single row item inside a TaskList.");
  const TaskCard = part("TaskCard", "A physical tilted card for a highlight task.");
  const StatCard = part("StatCard", "A small status summary metric.");

  const block = (name: (typeof todoBlocks)[number], shape: z.ZodObject, description: string) =>
    defineComponent({ name, props: shape, description, component: views[name] });

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

  const TaskCards = block(
    "TaskCards",
    z.object({ cards: z.array(TaskCard.ref).describe("2 to 4 highlight task cards") }),
    "A grid of physical, slightly tilted cards for prominent tasks.",
  );

  const TaskList = block(
    "TaskList",
    z.object({
      title: z.string().describe("The list section title, e.g. 'Today's High Impact'"),
      items: z.array(TaskItem.ref).describe("3 to 6 task items"),
    }),
    "An interactive checklist of tasks.",
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

  const all = [DailyHeadline, FocusPull, Heading, TaskCards, TaskList, StatsRow, Question, FollowUps];

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
    components: [TodoBoard, ...all, Option, TaskItem, TaskCard, StatCard] as never[],
  });
}

export const todoSpec = () => {
  const none = () => null;
  const views = Object.fromEntries(
    [...todoBlocks, "TodoBoard", ...Object.keys(todoProps)].map((k) => [k, none]),
  );
  return buildTodoLibrary(views as unknown as Views).toSpec();
};

