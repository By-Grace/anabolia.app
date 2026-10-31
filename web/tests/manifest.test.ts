import { describe, it, expect } from "vitest";
import manifest from "@/app/manifest";

describe("manifest do PWA", () => {
  it("o app instalado abre em '/', que decide entre o cadastro e Hoje", () => {
    expect(manifest().start_url).toBe("/");
  });
});
