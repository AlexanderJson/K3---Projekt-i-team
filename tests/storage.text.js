import {
  TASK_STATUSES,
  isValidTaskStatus,
  requiresCommentForStatus
} from "../js/status.js";

describe("Task status validation", () => {
  test("allows all defined task statuses", () => {
    Object.values(TASK_STATUSES).forEach(status => {
      expect(isValidTaskStatus(status)).toBe(true);
    });
  });

  test("rejects invalid task statuses", () => {
    expect(isValidTaskStatus("invalid")).toBe(false);
    expect(isValidTaskStatus("")).toBe(false);
    expect(isValidTaskStatus(null)).toBe(false);
    expect(isValidTaskStatus(undefined)).toBe(false);
  });

  test("requires comment only for closed status", () => {
    expect(requiresCommentForStatus(TASK_STATUSES.CLOSED)).toBe(true);
    expect(requiresCommentForStatus(TASK_STATUSES.TODO)).toBe(false);
    expect(requiresCommentForStatus(TASK_STATUSES.IN_PROGRESS)).toBe(false);
    expect(requiresCommentForStatus(TASK_STATUSES.DONE)).toBe(false);
  });
});