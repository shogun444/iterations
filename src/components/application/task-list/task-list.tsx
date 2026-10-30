"use client";

import React, { useState, useEffect, useId, useMemo, useRef } from "react";

export type TaskChip = {
  label: string;
  icon?: React.ReactNode | "code" | "file" | "calendar" | "check" | "tag" | "react";
};

export type TaskStep = {
  label: string;
  chips?: TaskChip[];
};

export type AgentTask = {
  id?: string;
  title: string;
  runningTitle?: string;
  icon?: React.ReactNode | React.ComponentType<{ className?: string }> | "search" | "edit" | "check" | "sparkles" | "code" | "folder";
  steps: TaskStep[];
  isCompleted?: boolean;
};

export interface TaskListProps {
  tasks?: AgentTask[];
  className?: string;
  startDelay?: number;
  stepInterval?: number;
  collapseOnComplete?: boolean | "all";
  revealed?: number;
  onComplete?: () => void;
  showWorking?: boolean;
}

function SearchIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      className={className}
      style={{ width: 16, height: 16, flexShrink: 0 }}
    >
      <path d="M18.031 16.6168L22.3137 20.8995L20.8995 22.3137L16.6168 18.031C15.0769 19.263 13.124 20 11 20C6.032 20 2 15.968 2 11C2 6.032 6.032 2 11 2C15.968 2 20 6.032 20 11C20 13.124 19.263 15.0769 18.031 16.6168ZM16.0247 15.8748C17.2475 14.6146 18 12.8956 18 11C18 7.1325 14.8675 4 11 4C7.1325 4 4 7.1325 4 11C4 14.8675 7.1325 18 11 18C12.8956 18 14.6146 17.2475 15.8748 16.0247L16.0247 15.8748Z" />
    </svg>
  );
}

function EditIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      className={className}
      style={{ width: 16, height: 16, flexShrink: 0 }}
    >
      <path d="M15 4H5V20H19V8H15V4ZM3 2.9918C3 2.44405 3.44749 2 3.9985 2H16L20.9997 7L21 20.9925C21 21.5489 20.5551 22 20.0066 22H3.9934C3.44476 22 3 21.5447 3 21.0082V2.9918ZM17.6569 12L14.1213 15.5355L12.7071 14.1213L14.8284 12L12.7071 9.87868L14.1213 8.46447L17.6569 12ZM6.34315 12L9.87868 8.46447L11.2929 9.87868L9.17157 12L11.2929 14.1213L9.87868 15.5355L6.34315 12Z" />
    </svg>
  );
}

function CheckIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      className={className}
      style={{ width: 16, height: 16, flexShrink: 0 }}
    >
      <path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM11.0026 16L18.0737 8.92893L16.6595 7.51472L11.0026 13.1716L8.17417 10.3431L6.75996 11.7574L11.0026 16Z" />
    </svg>
  );
}

function CodeIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      className={className}
      style={{ width: 16, height: 16, flexShrink: 0 }}
    >
      <path d="M24 12L18.3431 17.6569L16.9289 16.2426L21.1716 12L16.9289 7.75736L18.3431 6.34315L24 12ZM2.82843 12L7.07107 16.2426L5.65685 17.6569L0 12L5.65685 6.34315L7.07107 7.75736L2.82843 12Z" />
    </svg>
  );
}

function SparklesIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      className={className}
      style={{ width: 16, height: 16, flexShrink: 0 }}
    >
      <path d="M12 2L14.4 7.2L20 8.5L16 12.3L17 18L12 15.2L7 18L8 12.3L4 8.5L9.6 7.2L12 2Z" />
    </svg>
  );
}

function WorkingSparklesIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width={14}
      height={14}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      className={className}
      style={{ width: 14, height: 14, flexShrink: 0 }}
    >
      <path d="M12 2L13.8 6.6L18.4 8.4L13.8 10.2L12 14.8L10.2 10.2L5.6 8.4L10.2 6.6L12 2ZM19 15L20 17.5L22.5 18.5L20 19.5L19 22L18 19.5L15.5 18.5L18 17.5L19 15ZM6 16L6.8 18L8.8 18.8L6.8 19.6L6 21.6L5.2 19.6L3.2 18.8L5.2 18L6 16Z" />
    </svg>
  );
}

function ReactChipIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width={13}
      height={13}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      className={className}
      style={{ width: 13, height: 13, flexShrink: 0 }}
    >
      <path d="M12.001 13.5001C11.1725 13.5001 10.501 12.8285 10.501 12.0001C10.501 11.1716 11.1725 10.5001 12.001 10.5001C12.8294 10.5001 13.501 11.1716 13.501 12.0001C13.501 12.8285 12.8294 13.5001 12.001 13.5001ZM11.4733 16.4945C11.6479 16.705 11.8239 16.908 12.001 17.103C12.178 16.908 12.3541 16.705 12.5286 16.4945C12.3538 16.4982 12.1779 16.5001 12.001 16.5001C11.824 16.5001 11.6481 16.4982 11.4733 16.4945ZM9.47837 16.3694C8.6762 16.2846 7.91035 16.1603 7.19268 16.0016C7.11832 16.3512 7.06134 16.6904 7.02243 17.0166C6.83358 18.6 7.09805 19.5617 7.50098 19.7943C7.9039 20.0269 8.86893 19.7751 10.1458 18.8199C10.4088 18.6231 10.6741 18.4042 10.9397 18.1649C10.4434 17.6228 9.95287 17.0217 9.47837 16.3694ZM16.8093 16.0016C16.0916 16.1603 15.3257 16.2846 14.5236 16.3694C14.0491 17.0217 13.5585 17.6228 13.0622 18.1649C13.3279 18.4042 13.5931 18.6231 13.8562 18.8199C15.133 19.7751 16.0981 20.0269 16.501 19.7943C16.9039 19.5617 17.1684 18.6 16.9795 17.0166C16.9406 16.6904 16.8836 16.3512 16.8093 16.0016ZM18.2598 15.6136C18.8364 18.2526 18.5328 20.3533 17.251 21.0933C15.9691 21.8334 13.9981 21.046 12.001 19.2271C10.0038 21.046 8.03282 21.8334 6.75098 21.0933C5.46913 20.3533 5.16555 18.2526 5.74217 15.6136C3.16842 14.7935 1.50098 13.4802 1.50098 12.0001C1.50098 10.5199 3.16842 9.20668 5.74217 8.38654C5.16555 5.74754 5.46913 3.64687 6.75098 2.9068C8.03282 2.16673 10.0038 2.95415 12.001 4.77302C13.9981 2.95415 15.9691 2.16673 17.251 2.9068C18.5328 3.64687 18.8364 5.74754 18.2598 8.38654C20.8335 9.20668 22.501 10.5199 22.501 12.0001C22.501 13.4802 20.8335 14.7935 18.2598 15.6136Z" />
    </svg>
  );
}

function CalendarChipIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width={13}
      height={13}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      className={className}
      style={{ width: 13, height: 13, flexShrink: 0 }}
    >
      <path d="M9 1V3H15V1H17V3H21C21.5523 3 22 3.44772 22 4V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V4C2 3.44772 2.44772 3 3 3H7V1H9ZM20 10H4V19H20V10ZM19 5H5V8H19V5Z" />
    </svg>
  );
}

function TagChipIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width={13}
      height={13}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      className={className}
      style={{ width: 13, height: 13, flexShrink: 0 }}
    >
      <path d="M10.9 2.1L20.9 12.1C21.3 12.5 21.3 13.1 20.9 13.5L13.5 20.9C13.1 21.3 12.5 21.3 12.1 20.9L2.1 10.9V2.1H10.9ZM6.5 7.5C7.3 7.5 8 6.8 8 6C8 5.2 7.3 4.5 6.5 4.5C5.7 4.5 5 5.2 5 6C5 6.8 5.7 7.5 6.5 7.5Z" />
    </svg>
  );
}

function FileChipIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width={13}
      height={13}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      className={className}
      style={{ width: 13, height: 13, flexShrink: 0 }}
    >
      <path d="M15 4H5V20H19V8H15V4ZM3 2.9918C3 2.44405 3.44749 2 3.9985 2H16L20.9997 7L21 20.9925C21 21.5489 20.5551 22 20.0066 22H3.9934C3.44476 22 3 21.5447 3 21.0082V2.9918Z" />
    </svg>
  );
}

export function TaskList({
  tasks = [],
  className = "",
  startDelay = 220,
  stepInterval = 380,
  collapseOnComplete,
  revealed: controlledRevealed,
  onComplete,
  showWorking = true,
}: TaskListProps) {
  const listId = useId();

  // Total units = 1 unit per task header + 1 unit per task step
  const totalUnits = useMemo(() => {
    return tasks.reduce((sum, t) => sum + 1 + (t.steps?.length || 0), 0);
  }, [tasks]);

  const isControlled = typeof controlledRevealed === "number";
  const [internalRevealed, setInternalRevealed] = useState<number>(0);
  const revealedUnits = isControlled ? controlledRevealed : internalRevealed;

  // Working timer
  const [elapsedMs, setElapsedMs] = useState(0);
  const startTimeRef = useRef<number>(Date.now());
  const completedRef = useRef<boolean>(false);

  // Progressive reveal timer in uncontrolled mode
  useEffect(() => {
    if (isControlled) return;
    if (tasks.length === 0) return;

    startTimeRef.current = Date.now();
    completedRef.current = false;
    setInternalRevealed(0);
    setElapsedMs(0);

    const startTimer = setTimeout(() => {
      setInternalRevealed(1);
    }, startDelay);

    return () => clearTimeout(startTimer);
  }, [tasks, isControlled, startDelay]);

  useEffect(() => {
    if (isControlled) return;
    if (internalRevealed === 0) return;
    if (internalRevealed >= totalUnits) {
      if (!completedRef.current) {
        completedRef.current = true;
        onComplete?.();
      }
      return;
    }

    const timer = setTimeout(() => {
      setInternalRevealed((prev) => Math.min(prev + 1, totalUnits));
    }, stepInterval);

    return () => clearTimeout(timer);
  }, [internalRevealed, totalUnits, isControlled, stepInterval, onComplete]);

  // Working clock timer while running
  useEffect(() => {
    if (revealedUnits >= totalUnits) return;
    const interval = setInterval(() => {
      setElapsedMs(Date.now() - startTimeRef.current);
    }, 100);
    return () => clearInterval(interval);
  }, [revealedUnits, totalUnits]);

  // Expansion state: manual user clicks override auto expansion
  const [userExpanded, setUserExpanded] = useState<Record<number, boolean>>({});

  const toggleGroup = (idx: number, currentOpen: boolean) => {
    setUserExpanded((prev) => ({
      ...prev,
      [idx]: !currentOpen,
    }));
  };

  const renderIcon = (icon?: AgentTask["icon"]) => {
    if (!icon) return <SearchIcon className="remixicon text-foreground-icon-secondary" />;
    if (React.isValidElement(icon)) return icon;
    if (typeof icon === "function") {
      const CustomIcon = icon as React.ComponentType<{ className?: string }>;
      return <CustomIcon className="remixicon text-foreground-icon-secondary" />;
    }
    switch (icon) {
      case "edit":
        return <EditIcon className="remixicon text-foreground-icon-secondary" />;
      case "check":
        return <CheckIcon className="remixicon text-emerald-500" />;
      case "sparkles":
        return <SparklesIcon className="remixicon text-foreground-icon-secondary" />;
      case "code":
        return <CodeIcon className="remixicon text-foreground-icon-secondary" />;
      default:
        return <SearchIcon className="remixicon text-foreground-icon-secondary" />;
    }
  };

  const renderChipIcon = (chipIcon?: TaskChip["icon"]) => {
    if (!chipIcon) return <ReactChipIcon className="remixicon text-[#61dafb]" />;
    if (React.isValidElement(chipIcon)) return chipIcon;
    if (typeof chipIcon === "function") {
      const CustomIcon = chipIcon as React.ComponentType<{ className?: string }>;
      return <CustomIcon className="remixicon text-[#61dafb]" />;
    }
    switch (chipIcon) {
      case "calendar":
        return <CalendarChipIcon className="remixicon text-neutral-500" />;
      case "tag":
        return <TagChipIcon className="remixicon text-neutral-500" />;
      case "check":
        return <CheckIcon className="remixicon text-emerald-500" />;
      case "file":
        return <FileChipIcon className="remixicon text-neutral-500" />;
      case "code":
        return <CodeIcon className="remixicon text-blue-500" />;
      case "react":
      default:
        return <ReactChipIcon className="remixicon text-[#61dafb]" />;
    }
  };

  if (!tasks || tasks.length === 0) {
    return null;
  }

  // Calculate layout items and units
  let unitIdx = 0;
  const isFinished = revealedUnits >= totalUnits;

  return (
    <div className={`bui-task-list-root ${className}`}>
      <div className="bui-task-list-card">
        <div className="bui-task-list-groups">
          {tasks.map((task, groupIdx) => {
            const headerUnit = unitIdx++;
            const isHeaderRevealed = revealedUnits > headerUnit;

            // Step units
            const stepItems = (task.steps || []).map((step, stepIdx) => {
              const stepUnit = unitIdx++;
              const isStepRevealed = revealedUnits > stepUnit;
              return { step, stepIdx, isStepRevealed, stepUnit };
            });

            const isTaskSettled = revealedUnits >= unitIdx;
            const isRunning = isHeaderRevealed && !isTaskSettled;

            // Determine if open
            let isAutoExpanded = true;
            if (collapseOnComplete === true && isTaskSettled) {
              isAutoExpanded = false;
            } else if (collapseOnComplete === "all" && isFinished) {
              isAutoExpanded = false;
            }

            const isExpanded = userExpanded[groupIdx] !== undefined ? userExpanded[groupIdx] : isAutoExpanded;

            if (!isHeaderRevealed) {
              return null;
            }

            return (
              <section
                key={task.id || `${listId}-group-${groupIdx}`}
                className="bui-task-group overflow-hidden"
              >
                <button
                  type="button"
                  aria-expanded={isExpanded}
                  className="group flex w-full cursor-pointer items-center gap-2 rounded-md py-0.5 text-start outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring bui-task-group-btn"
                  onClick={() => toggleGroup(groupIdx, isExpanded)}
                >
                  <span className="bui-icon-holder">{renderIcon(task.icon)}</span>
                  <span className="min-w-0 flex-1 text-body-medium text-text-secondary bui-task-title-wrap">
                    <span className="relative flex min-w-0 overflow-hidden">
                      {isRunning && task.runningTitle ? (
                        <span className="block truncate bui-running-title">
                          {task.runningTitle}
                        </span>
                      ) : (
                        <span className="block truncate bui-settled-title">
                          {task.title}
                        </span>
                      )}
                    </span>
                  </span>
                  <svg
                    width={16}
                    height={16}
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    aria-hidden="true"
                    className={`remixicon shrink-0 text-foreground-icon-tertiary transition-transform duration-200 ease group-hover:text-foreground-icon-secondary ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                    style={{ width: 16, height: 16, flexShrink: 0 }}
                  >
                    <path d="M11.9999 13.1714L16.9497 8.22168L18.3639 9.63589L11.9999 15.9999L5.63599 9.63589L7.0502 8.22168L11.9999 13.1714Z" />
                  </svg>
                </button>

                <div
                  className="overflow-hidden bui-task-content"
                  style={{
                    height: isExpanded ? "auto" : 0,
                    opacity: isExpanded ? 1 : 0,
                    transition: "height 0.22s ease, opacity 0.16s ease",
                  }}
                >
                  <ul aria-live="polite" className="mt-0.5 ms-2 flex flex-col bui-step-list">
                    {stepItems.map(({ step, stepIdx, isStepRevealed }) => {
                      if (!isStepRevealed) return null;
                      const isLast = stepIdx === stepItems.length - 1;

                      return (
                        <li
                          key={stepIdx}
                          className="relative overflow-hidden ps-4 bui-step-item"
                        >
                          <span
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-y-0 start-0 w-3 text-foreground-icon-quaternary bui-tree-connector"
                          >
                            <svg
                              width={12}
                              height={15}
                              viewBox="0 0 12 15"
                              fill="none"
                              className="absolute top-0 start-0 rtl:-scale-x-100"
                              style={{ width: 12, height: 15, flexShrink: 0 }}
                            >
                              <path
                                d="M0.5 0 V8 Q0.5 14 6.5 14 H11.5"
                                stroke="currentColor"
                                strokeWidth="1"
                                pathLength="1"
                                className="bui-branch-curve-path"
                              />
                            </svg>
                            {!isLast && (
                              <span
                                className="absolute start-0 w-px origin-top bg-current bui-branch-line"
                                style={{ top: "8px", bottom: "0px" }}
                              />
                            )}
                          </span>

                          <span className="block py-1 text-body-regular text-text-secondary bui-step-label-row">
                            {step.label}
                            {step.chips?.map((chip, chipIdx) => (
                              <span
                                key={chipIdx}
                                className="me-0.5 ms-[3px] inline-flex max-w-full -translate-y-px items-center gap-1 rounded-md border py-0.5 pe-1.5 align-middle border-border-button-default/50 bg-background-secondary-default transition-colors duration-150 ease hover:border-border-button-hover hover:bg-background-tertiary-default ps-1 bui-chip"
                              >
                                <span
                                  aria-hidden="true"
                                  className="flex shrink-0 items-center justify-center bui-chip-icon-wrap"
                                >
                                  {renderChipIcon(chip.icon)}
                                </span>
                                <span className="truncate text-caption-2-medium text-text-primary bui-chip-label">
                                  {chip.label}
                                </span>
                              </span>
                            ))}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </section>
            );
          })}
        </div>

        {/* Working status indicator while running */}
        {showWorking && !isFinished && (
          <div className="bui-working-row">
            <WorkingSparklesIcon className="bui-working-icon" />
            <span className="bui-working-text">Working</span>
            <span className="bui-working-time">{(elapsedMs / 1000).toFixed(1)}s</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default TaskList;
