import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import App from "./App";
import { PrivacyPage } from "./pages/Privacy";
import { NotFoundPage } from "./pages/NotFound";

export function render() {
  return renderToString(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

export function renderPrivacy() {
  return renderToString(<PrivacyPage />);
}

export function renderNotFound() {
  return renderToString(<NotFoundPage />);
}
