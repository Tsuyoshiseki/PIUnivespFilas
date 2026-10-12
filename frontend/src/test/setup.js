import "@testing-library/jest-dom/vitest";
import { beforeEach } from "vitest";

// Cada teste começa com o "navegador" limpo
beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  document.title = "";
});
