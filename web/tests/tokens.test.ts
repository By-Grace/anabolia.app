import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect } from "vitest";

const css = readFileSync(join(__dirname, "../app/globals.css"), "utf8");

describe("tokens da direção B", () => {
  it.each([
    ["--color-acc", "#D4451F"],
    ["--color-ink", "#0E0E0E"],
    ["--color-grey", "#6B6B6B"],
    ["--color-hair", "#ECECEC"],
    ["--color-soft", "#F5F5F5"],
    ["--color-acc-soft", "#FBE4DC"],
    ["--color-acc-text", "#8E2F12"],
  ])("%s = %s", (name, value) => {
    expect(css).toMatch(new RegExp(`${name}:\\s*${value}`, "i"));
  });
  it("não contém lima nem azul do kit v1", () => {
    expect(css.toUpperCase()).not.toMatch(/#C8F24C|#3156FF|#17282B/);
  });
});
