import { getDaysInMonth, getFirstDayOfWeek, getTasksForDate } from "../js/views/calendarView.js";
import { describe, test, expect } from "@jest/globals";

describe("Calendar helper functions", () => {

    // ── getDaysInMonth ──

    describe("getDaysInMonth", () => {
        test("returns 31 for January", () => {
            expect(getDaysInMonth(2026, 0)).toBe(31);
        });

        test("returns 28 for February in a non-leap year", () => {
            expect(getDaysInMonth(2026, 1)).toBe(28);
        });

        test("returns 29 for February in a leap year", () => {
            expect(getDaysInMonth(2024, 1)).toBe(29);
        });

        test("returns 30 for April", () => {
            expect(getDaysInMonth(2026, 3)).toBe(30);
        });
    });

    // ── getFirstDayOfWeek ──

    describe("getFirstDayOfWeek", () => {
        test("returns a value between 0 and 6", () => {
            const result = getFirstDayOfWeek(2026, 1);
            expect(result).toBeGreaterThanOrEqual(0);
            expect(result).toBeLessThanOrEqual(6);
        });

        test("Sunday 1st maps to index 6 (Mon-based week)", () => {
            // 2026-02-01 is a Sunday
            expect(getFirstDayOfWeek(2026, 1)).toBe(6);
        });

        test("Monday 1st maps to index 0", () => {
            // 2026-06-01 is a Monday
            expect(getFirstDayOfWeek(2026, 5)).toBe(0);
        });
    });

    // ── getTasksForDate ──

    describe("getTasksForDate", () => {
        const tasks = [
            { id: 1, title: "Task A", deadline: "2026-02-17" },
            { id: 2, title: "Task B", deadline: "2026-02-17" },
            { id: 3, title: "Task C", deadline: "2026-02-20" },
            { id: 4, title: "Task D", deadline: 0 },
        ];

        test("returns tasks matching the given date", () => {
            const result = getTasksForDate(tasks, "2026-02-17");
            expect(result.length).toBe(2);
            expect(result[0].title).toBe("Task A");
        });

        test("returns empty array for a date with no tasks", () => {
            expect(getTasksForDate(tasks, "2026-01-01")).toEqual([]);
        });

        test("returns empty array for empty date string", () => {
            expect(getTasksForDate(tasks, "")).toEqual([]);
        });

        test("returns empty array for empty task list", () => {
            expect(getTasksForDate([], "2026-02-17")).toEqual([]);
        });

        test("returns empty array when tasks is not an array", () => {
            expect(getTasksForDate(null, "2026-02-17")).toEqual([]);
        });
    });
});
