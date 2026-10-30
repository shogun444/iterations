"use client";

import React, { useState, useEffect, useId } from "react";

export type TaskChip = {
  label: string;
  icon?: "code" | "file" | "calendar" | "check" | "tag" | "react";
};

export type TaskStep = {
  label: string;
  chips?: TaskChip[];
};

export type AgentTask = {
  id?: string;
  title: string;
  runningTitle?: string;
  icon?: React.ComponentType<{ className?: string }> | "search" | "edit" | "check" | "sparkles" | "folder";
  steps: TaskStep[];
  isCompleted?: boolean;
};

export interface TaskListProps {
  tasks?: AgentTask[];
  className?: string;
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
      <path d="M12.001 13.5001C11.1725 13.5001 10.501 12.8285 10.501 12.0001C10.501 11.1716 11.1725 10.5001 12.001 10.5001C12.8294 10.5001 13.501 11.1716 13.501 12.0001C13.501 12.8285 12.8294 13.5001 12.001 13.5001ZM11.4733 16.4945C11.6479 16.705 11.8239 16.908 12.001 17.103C12.178 16.908 12.3541 16.705 12.5286 16.4945C12.3538 16.4982 12.1779 16.5001 12.001 16.5001C11.824 16.5001 11.6481 16.4982 11.4733 16.4945ZM9.47837 16.3694C8.6762 16.2846 7.91035 16.1603 7.19268 16.0016C7.11832 16.3512 7.06134 16.6904 7.02243 17.0166C6.83358 18.6 7.09805 19.5617 7.50098 19.7943C7.9039 20.0269 8.86893 19.7751 10.1458 18.8199C10.4088 18.6231 10.6741 18.4042 10.9397 18.1649C10.4434 17.6228 9.95287 17.0217 9.47837 16.3694ZM16.8093 16.0016C16.0916 16.1603 15.3257 16.2846 14.5236 16.3694C14.0491 17.0217 13.5585 17.6228 13.0622 18.1649C13.3279 18.4042 13.5931 18.6231 13.8562 18.8199C15.133 19.7751 16.0981 20.0269 16.501 19.7943C16.9039 19.5617 17.1684 18.6 16.9795 17.0166C16.9406 16.6904 16.8836 16.3512 16.8093 16.0016ZM18.2598 15.6136C18.8364 18.2526 18.5328 20.3533 17.251 21.0933C15.9691 21.8334 13.9981 21.046 12.001 19.2271C10.0038 21.046 8.03282 21.8334 6.75098 21.0933C5.46913 20.3533 5.16555 18.2526 5.74217 15.6136C3.16842 14.7935 1.50098 13.4802 1.50098 12.0001C1.50098 10.5199 3.16842 9.20668 5.74217 8.38654C5.16555 5.74754 5.46913 3.64687 6.75098 2.9068C8.03282 2.16673 10.0038 2.95415 12.001 4.77302C13.9981 2.95415 15.9691 2.16673 17.251 2.9068C18.5328 3.64687 18.8364 5.74754 18.2598 8.38654C20.8335 9.20668 22.501 10.5199 22.501 12.0001C22.501 13.4802 20.8335 14.7935 18.2598 15.6136ZM10.9397 5.83521C10.6741 5.59597 10.4088 5.37703 10.1458 5.18024C8.86893 4.22499 7.9039 3.97321 7.50098 4.20584C7.09805 4.43847 6.83358 5.4001 7.02243 6.9835C7.06134 7.30969 7.11832 7.6489 7.19268 7.99857C7.91035 7.83985 8.6762 7.71556 9.47837 7.63078C9.95287 6.97848 10.4434 6.37737 10.9397 5.83521ZM14.5236 7.63078C15.3257 7.71556 16.0916 7.83985 16.8093 7.99857C16.8836 7.6489 16.9406 7.30969 16.9795 6.9835C17.1684 5.4001 16.9039 4.43847 16.501 4.20584C16.0981 3.97321 15.133 4.22499 13.8562 5.18024C13.5931 5.37703 13.3279 5.59597 13.0622 5.83521C13.5585 6.37737 14.0491 6.97848 14.5236 7.63078ZM12.5286 7.50565C12.3541 7.29515 12.178 7.09211 12.001 6.89711C11.8239 7.09211 11.6479 7.29515 11.4733 7.50565C11.6481 7.50194 11.824 7.50007 12.001 7.50007C12.1779 7.50007 12.3538 7.50194 12.5286 7.50565ZM8.37252 14.7042C8.28191 14.5547 8.19233 14.4033 8.10386 14.2501C8.01539 14.0968 7.92906 13.9435 7.84488 13.7903C7.74985 14.0467 7.66205 14.3007 7.58169 14.5515C7.83908 14.6074 8.10295 14.6583 8.37252 14.7042ZM10.3049 14.9377C10.8579 14.9788 11.4251 15.0001 12.001 15.0001C12.5769 15.0001 13.144 14.9788 13.697 14.9377C14.0091 14.4793 14.3111 13.9988 14.5991 13.5001C14.887 13.0013 15.1522 12.4995 15.393 12.0001C15.1522 11.5006 14.887 10.9988 14.5991 10.5001C14.3111 10.0013 14.0091 9.52081 13.697 9.06246C13.144 9.02133 12.5769 9.00007 12.001 9.00007C11.4251 9.00007 10.8579 9.02133 10.3049 9.06246C9.99283 9.52081 9.69086 10.0013 9.4029 10.5001C9.11494 10.9988 8.8498 11.5006 8.60892 12.0001C8.8498 12.4995 9.11494 13.0013 9.4029 13.5001C9.69086 13.9988 9.99283 14.4793 10.3049 14.9377ZM16.1571 10.2098C16.2521 9.9534 16.3399 9.6994 16.4203 9.44859C16.1629 9.39278 15.899 9.34182 15.6294 9.29591C15.72 9.44543 15.8096 9.59683 15.8981 9.75007C15.9866 9.9033 16.0729 10.0566 16.1571 10.2098ZM6.13143 9.83671C5.79142 9.94714 5.46917 10.0674 5.16723 10.1968C3.70154 10.825 3.00098 11.5348 3.00098 12.0001C3.00098 12.4653 3.70154 13.1752 5.16723 13.8033C5.46917 13.9327 5.79142 14.053 6.13143 14.1634C6.35281 13.4625 6.6281 12.7371 6.95576 12.0001C6.6281 11.263 6.35281 10.5376 6.13143 9.83671ZM7.58169 9.44859C7.66205 9.6994 7.74985 9.9534 7.84488 10.2098C7.92906 10.0566 8.01539 9.9033 8.10386 9.75007C8.19233 9.59683 8.28191 9.44543 8.37252 9.29591C8.10295 9.34182 7.83908 9.39278 7.58169 9.44859ZM17.8705 14.1634C18.2105 14.053 18.5328 13.9327 18.8347 13.8033C20.3004 13.1752 21.001 12.4653 21.001 12.0001C21.001 11.5348 20.3004 10.825 18.8347 10.1968C18.5328 10.0674 18.2105 9.94714 17.8705 9.83671C17.6491 10.5376 17.3739 11.263 17.0462 12.0001C17.3739 12.7371 17.6491 13.4625 17.8705 14.1634ZM16.4203 14.5515C16.3399 14.3007 16.2521 14.0467 16.1571 13.7903C16.0729 13.9435 15.8981 14.2501C15.8096 14.4033 15.72 14.5547 15.6294 14.7042C15.899 14.6583 16.1629 14.6074 16.4203 14.5515Z" />
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

export function TaskList({ tasks = [], className = "" }: TaskListProps) {
  // Expansion state for each group
  const [expandedGroups, setExpandedGroups] = useState<Record<number, boolean>>({});
  const listId = useId();

  // Keep groups expanded by default
  useEffect(() => {
    const initialExpanded: Record<number, boolean> = {};
    tasks.forEach((_, idx) => {
      initialExpanded[idx] = true;
    });
    setExpandedGroups(initialExpanded);
  }, [tasks.length]);

  const toggleGroup = (idx: number) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const renderIcon = (icon?: AgentTask["icon"]) => {
    if (!icon) return <SearchIcon className="remixicon text-foreground-icon-secondary" />;
    if (typeof icon === "function") {
      const CustomIcon = icon;
      return <CustomIcon className="remixicon text-foreground-icon-secondary" />;
    }
    switch (icon) {
      case "edit":
        return <EditIcon className="remixicon text-foreground-icon-secondary" />;
      case "check":
        return <CheckIcon className="remixicon text-foreground-icon-secondary" />;
      case "sparkles":
        return <SparklesIcon className="remixicon text-foreground-icon-secondary" />;
      default:
        return <SearchIcon className="remixicon text-foreground-icon-secondary" />;
    }
  };

  const renderChipIcon = (chipIcon?: TaskChip["icon"]) => {
    switch (chipIcon) {
      case "calendar":
        return <CalendarChipIcon className="remixicon text-neutral-500" />;
      case "tag":
        return <TagChipIcon className="remixicon text-neutral-500" />;
      case "check":
        return <CheckIcon className="remixicon text-emerald-500" />;
      case "code":
      case "react":
      case "file":
      default:
        return <ReactChipIcon className="remixicon text-[#61dafb]" />;
    }
  };

  if (!tasks || tasks.length === 0) {
    return null;
  }

  return (
    <div className={`bui-task-list-root ${className}`}>
      <div className="bui-task-list-card">
        <div className="bui-task-list-groups">
          {tasks.map((task, groupIdx) => {
            const isExpanded = expandedGroups[groupIdx] ?? true;

            return (
              <section
                key={task.id || `${listId}-group-${groupIdx}`}
                className="bui-task-group overflow-hidden"
              >
                <button
                  type="button"
                  aria-expanded={isExpanded}
                  className="group flex w-full cursor-pointer items-center gap-2 rounded-md py-0.5 text-start outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring bui-task-group-btn"
                  onClick={() => toggleGroup(groupIdx)}
                >
                  <span className="bui-icon-holder">{renderIcon(task.icon)}</span>
                  <span className="min-w-0 flex-1 text-body-medium text-text-secondary bui-task-title-wrap">
                    <span className="relative flex min-w-0 overflow-hidden">
                      <span className="block truncate bui-settled-title">
                        {task.title}
                      </span>
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
                    transition: "height 0.2s ease, opacity 0.15s ease",
                  }}
                >
                  <ul aria-live="polite" className="mt-0.5 ms-2 flex flex-col bui-step-list">
                    {task.steps.map((step, stepIdx) => {
                      const isLast = stepIdx === task.steps.length - 1;
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
                                strokeDashoffset="0"
                                strokeDasharray="1 1"
                              />
                            </svg>
                            {!isLast && (
                              <span
                                className="absolute start-0 w-px origin-top bg-current bui-branch-line"
                                style={{ top: "8px", bottom: "0px", transform: "none" }}
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
      </div>
    </div>
  );
}

export default TaskList;
