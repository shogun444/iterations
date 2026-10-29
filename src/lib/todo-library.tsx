"use client";

import React, { Fragment, useState } from "react";
import { Check, Clock, Plus, Tag } from "lucide-react";
import type { ComponentRenderProps } from "@openuidev/lang-core";
import { useTriggerAction } from "@openuidev/react-lang";
import { DrawablyCircle, DrawablyHighlight, DrawablyUnderline } from "../drawably/react.js";
import { buildTodoLibrary } from "./todo-schema";
import "../drawably/style.css";
import "../app/todo.css";

const list = (nodes: unknown) => (Array.isArray(nodes) ? nodes : [nodes]).filter(Boolean);

export function Marked({
  text,
  stroke = "#52525b",
  fill = "rgba(254, 240, 138, 0.45)",
}: {
  text?: string;
  stroke?: string;
  fill?: string;
}) {
  if (!text) return null;
  return (
    <>
      {text.split(/(_[^_]+_|==[^=]+==|\(\([^)]+\)\))/).map((part, i) => {
        if (/^_[^_]+_$/.test(part)) {
          return (
            <DrawablyUnderline key={i} stroke={stroke} width={3}>
              {part.slice(1, -1)}
            </DrawablyUnderline>
          );
        }
        if (/^==.+==$/.test(part)) {
          return (
            <DrawablyHighlight key={i} fill={fill}>
              {part.slice(2, -2)}
            </DrawablyHighlight>
          );
        }
        if (/^\(\(.+\)\)$/.test(part)) {
          return (
            <DrawablyCircle key={i} stroke={stroke} width={3}>
              {part.slice(2, -2)}
            </DrawablyCircle>
          );
        }
        return <Fragment key={i}>{part}</Fragment>;
      })}
    </>
  );
}

function DailyHeadlineView({ props }: ComponentRenderProps<{ text?: string }>) {
  if (!props?.text) return null;
  return (
    <h1 className="todo-headline">
      <Marked text={props.text} stroke="#52525b" fill="rgba(254, 240, 138, 0.45)" />
    </h1>
  );
}

function FocusPullView({ props }: ComponentRenderProps<{ text?: string; note?: string }>) {
  if (!props?.text) return null;
  return (
    <div className="todo-focus-pull">
      <p className="todo-focus-text">
        <Marked text={props.text} stroke="#52525b" fill="rgba(254, 240, 138, 0.45)" />
      </p>
    </div>
  );
}

function PriorityBadge({ priority }: { priority?: string }) {
  if (!priority) return null;
  const isPrio = priority === "urgent" || priority === "high" || priority === "priority";
  return (
    <span className={`todo-badge ${isPrio ? "todo-badge--priority" : "todo-badge--not-priority"}`}>
      {isPrio ? "priority" : "not priority"}
    </span>
  );
}

function HeadingView({ props }: ComponentRenderProps<{ text?: string }>) {
  if (!props?.text) return null;
  return <h2 className="todo-heading">{props.text}</h2>;
}

function TaskCardView({
  props,
}: ComponentRenderProps<{
  id?: string;
  title?: string;
  priority?: "urgent" | "high" | "normal" | "low";
  due?: string;
  tag?: string;
  note?: string;
}>) {
  const [done, setDone] = useState(false);
  const prio = props?.priority ?? "normal";

  return (
    <div
      className={`todo-card ${done ? "is-done" : ""}`}
      onClick={() => setDone(!done)}
      role="button"
      tabIndex={0}
    >
      <div className="todo-card-top">
        <PriorityBadge priority={props?.priority} />
        {props?.tag && (
          <span className="todo-card-tag">
            <Tag size={12} style={{ display: "inline", marginRight: 4 }} />
            {props.tag}
          </span>
        )}
      </div>

      <h3 className="todo-card-title">
        <Marked text={props?.title} stroke="#52525b" fill="rgba(254, 240, 138, 0.45)" />
      </h3>

      <div className="todo-card-bottom">
        {props?.due ? (
          <span className="todo-card-due">
            <Clock size={13} />
            {props.due}
          </span>
        ) : (
          <span />
        )}
        {props?.note && <span className="todo-card-note">{props.note}</span>}
      </div>
    </div>
  );
}

function TaskCardsView({ props, renderNode }: ComponentRenderProps<{ cards?: unknown[] }>) {
  const cards = list(props?.cards);
  return (
    <div className="todo-cards-grid">
      {cards.map((node, i) => {
        const tiltDeg = [-1.5, 1.2, -0.9, 1.4][i % 4];
        return (
          <div key={i} style={{ ["--tilt" as string]: `${tiltDeg}deg` }}>
            {renderNode(node) as React.ReactNode}
          </div>
        );
      })}
    </div>
  );
}

function TaskItemView({
  props,
}: ComponentRenderProps<{
  id?: string;
  title?: string;
  done?: boolean;
  priority?: "urgent" | "high" | "normal" | "low";
  due?: string;
  note?: string;
}>) {
  const [done, setDone] = useState(!!props?.done);

  return (
    <div
      className={`todo-tasklist-item ${done ? "is-done" : ""}`}
      onClick={() => setDone(!done)}
      role="button"
      tabIndex={0}
    >
      <div className="todo-tasklist-left">
        <div className={`todo-checkbox ${done ? "checked" : ""}`}>
          {done && <Check size={12} strokeWidth={3} />}
        </div>
        <span className="todo-tasklist-title-text">{props?.title}</span>
      </div>

      <div className="todo-tasklist-right">
        <PriorityBadge priority={props?.priority} />
        {props?.due && (
          <span className="todo-card-due">
            <Clock size={12} /> {props.due}
          </span>
        )}
        {props?.note && <span className="todo-tasklist-note">{props.note}</span>}
      </div>
    </div>
  );
}

function TaskListView({ props, renderNode }: ComponentRenderProps<{ title?: string; items?: unknown[] }>) {
  const initialItems = list(props?.items);
  const [customTasks, setCustomTasks] = useState<Array<{ id: string; title: string; done: boolean }>>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const handleAdd = () => {
    const trimmed = newTaskTitle.trim();
    if (!trimmed) return;
    setCustomTasks((prev) => [
      ...prev,
      { id: `custom-${Date.now()}-${Math.random()}`, title: trimmed, done: false },
    ]);
    setNewTaskTitle("");
  };

  const toggleTask = (id: string) => {
    setCustomTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  return (
    <div className="todo-tasklist">
      <div className="todo-tasklist-header">
        <h3 className="todo-tasklist-title">{props?.title ?? "Tasks"}</h3>
      </div>
      <div className="todo-tasklist-items">
        {initialItems.map((node, i) => (
          <Fragment key={i}>{renderNode(node) as React.ReactNode}</Fragment>
        ))}

        {customTasks.map((task) => (
          <div
            key={task.id}
            className={`todo-tasklist-item ${task.done ? "is-done" : ""}`}
            onClick={() => toggleTask(task.id)}
            role="button"
            tabIndex={0}
          >
            <div className="todo-tasklist-left">
              <div className={`todo-checkbox ${task.done ? "checked" : ""}`}>
                {task.done && <Check size={12} strokeWidth={3} />}
              </div>
              <span className="todo-tasklist-title-text">{task.title}</span>
            </div>

            <div className="todo-tasklist-right">
              <PriorityBadge priority="not priority" />
            </div>
          </div>
        ))}
      </div>

      <div className="todo-tasklist-add">
        <Plus size={16} className="todo-tasklist-add-icon" />
        <input
          type="text"
          className="todo-tasklist-input"
          placeholder={props?.title ? `Add a new task to ${props.title}...` : "Add a new task..."}
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAdd();
            }
          }}
        />
        {newTaskTitle.trim() && (
          <button
            type="button"
            className="todo-tasklist-add-btn"
            onClick={handleAdd}
          >
            Add
          </button>
        )}
      </div>
    </div>
  );
}

function StatCardView({ props }: ComponentRenderProps<{ label?: string; value?: string; note?: string }>) {
  return (
    <div className="todo-stat-card">
      <span className="todo-stat-label">{props?.label}</span>
      <span className="todo-stat-value">{props?.value}</span>
      {props?.note && <span className="todo-stat-note">{props.note}</span>}
    </div>
  );
}

function StatsRowView({ props, renderNode }: ComponentRenderProps<{ stats?: unknown[] }>) {
  const stats = list(props?.stats);
  return (
    <div className="todo-stats-row">
      {stats.map((node, i) => (
        <Fragment key={i}>{renderNode(node) as React.ReactNode}</Fragment>
      ))}
    </div>
  );
}

function OptionView({ props }: ComponentRenderProps<{ label?: string; kind?: string }>) {
  const triggerAction = useTriggerAction();
  return (
    <button
      type="button"
      className="todo-option-pill"
      onClick={() => {
        if (props?.label) {
          triggerAction(props.label);
        }
      }}
    >
      {props?.label}
    </button>
  );
}

function QuestionView({ props, renderNode }: ComponentRenderProps<{ text?: string; options?: unknown[] }>) {
  const options = list(props?.options);
  return (
    <div className="todo-question-box">
      <h3 className="todo-question-text">{props?.text}</h3>
      <div className="todo-options-row">
        {options.map((node, i) => (
          <Fragment key={i}>{renderNode(node) as React.ReactNode}</Fragment>
        ))}
      </div>
    </div>
  );
}

function FollowUpsView({ props, renderNode }: ComponentRenderProps<{ options?: unknown[] }>) {
  const options = list(props?.options);
  if (options.length === 0) return null;
  return (
    <div className="todo-options-row">
      {options.map((node, i) => (
        <Fragment key={i}>{renderNode(node) as React.ReactNode}</Fragment>
      ))}
    </div>
  );
}

function TodoBoardView({ props, renderNode }: ComponentRenderProps<{ blocks?: unknown[] }>) {
  const blocks = list(props?.blocks);
  return (
    <div className="todo-board-container">
      {blocks.map((node, i) => (
        <Fragment key={i}>{renderNode(node) as React.ReactNode}</Fragment>
      ))}
    </div>
  );
}

export const todoLibrary = buildTodoLibrary({
  DailyHeadline: DailyHeadlineView as never,
  FocusPull: FocusPullView as never,
  Heading: HeadingView as never,
  TaskCard: TaskCardView as never,
  TaskCards: TaskCardsView as never,
  TaskItem: TaskItemView as never,
  TaskList: TaskListView as never,
  StatCard: StatCardView as never,
  StatsRow: StatsRowView as never,
  Question: QuestionView as never,
  Option: OptionView as never,
  FollowUps: FollowUpsView as never,
  TodoBoard: TodoBoardView as never,
});
