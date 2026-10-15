import { describe, expect, it } from "vitest";
import { isAllowedImageSrc } from "./image-src";

describe("isAllowedImageSrc", () => {
  it.each([
    "https://res.cloudinary.com/demo/image.jpg",
    "/demo/mangrove.svg",
    "data:image/jpeg;base64,/9j/4AAQ",
  ])("allows %s", (src) => expect(isAllowedImageSrc(src)).toBe(true));

  it.each([
    "javascript:alert(1)",
    "data:image/svg+xml;base64,PHN2Zz4=",
    "data:text/html,<script>",
    "//evil.example/x.png",
    42,
  ])("rejects %s", (src) => expect(isAllowedImageSrc(src)).toBe(false));
});
