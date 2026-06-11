(function() {
  "use strict";

  const PANEL_HOST_ID = "copy-analyzer-root";
  const MAX_SELECTION_LENGTH = 10000;

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function getSelectedText(eventTarget) {
    const isTextField =
      eventTarget instanceof HTMLTextAreaElement ||
      (eventTarget instanceof HTMLInputElement &&
        /^(text|search|email|url|tel)$/i.test(eventTarget.type));

    if (isTextField && eventTarget.selectionStart !== eventTarget.selectionEnd) {
      return eventTarget.value.slice(eventTarget.selectionStart, eventTarget.selectionEnd);
    }

    return window.getSelection().toString();
  }

  function removePanel() {
    const existingPanel = document.getElementById(PANEL_HOST_ID);

    if (existingPanel) {
      existingPanel.remove();
    }
  }

  function scoreClass(score) {
    if (score >= 85) {
      return "score-strong";
    }

    if (score >= 70) {
      return "score-good";
    }

    if (score >= 50) {
      return "score-work";
    }

    return "score-weak";
  }

  function renderMainIssue(result) {
    if (!result.mainIssue) {
      return `
        <section class="main-issue main-issue-positive">
          <span class="eyebrow">Main finding</span>
          <h2>No obvious issue detected</h2>
          <p>The current rules did not find a major weakness. Read it aloud and confirm the message still sounds natural.</p>
        </section>
      `;
    }

    return `
      <section class="main-issue">
        <span class="eyebrow">Main issue - ${escapeHtml(result.mainIssue.categoryLabel)}</span>
        <h2>${escapeHtml(result.mainIssue.title)}</h2>
        <p>${escapeHtml(result.mainIssue.explanation)}</p>
        <div class="suggestion">
          <strong>Try this</strong>
          <span>${escapeHtml(result.mainIssue.suggestion)}</span>
        </div>
      </section>
    `;
  }

  function renderCategory(category) {
    if (!category.assessed) {
      return `
        <article class="category category-muted">
          <div class="category-heading">
            <h3>${escapeHtml(category.label)}</h3>
            <span>Not assessed</span>
          </div>
          <p>Select more text for a useful check in this category.</p>
        </article>
      `;
    }

    const firstIssue = category.issues[0];
    const categoryBody = firstIssue
      ? `
        <p>${escapeHtml(firstIssue.explanation)}</p>
        <div class="category-action">${escapeHtml(firstIssue.suggestion)}</div>
      `
      : "<p>No obvious issue detected by the current rules.</p>";

    return `
      <article class="category">
        <div class="category-heading">
          <h3>${escapeHtml(category.label)}</h3>
          <span class="${scoreClass(category.score)}">${category.score} - ${escapeHtml(
            category.status
          )}</span>
        </div>
        ${categoryBody}
      </article>
    `;
  }

  function createPanel(result, wasTruncated) {
    removePanel();

    const host = document.createElement("div");
    host.id = PANEL_HOST_ID;
    host.style.cssText = `
      all: initial !important;
      display: block !important;
      position: fixed !important;
      top: 16px !important;
      right: 16px !important;
      width: min(400px, calc(100vw - 32px)) !important;
      height: auto !important;
      z-index: 2147483647 !important;
    `;

    const shadow = host.attachShadow({ mode: "open" });
    const preview =
      result.text.length > 170 ? result.text.slice(0, 170).trim() + "..." : result.text;
    const truncatedNotice = wasTruncated
      ? '<p class="notice">Only the first 10,000 characters were analyzed.</p>'
      : "";

    shadow.innerHTML = `
      <style>
        * {
          box-sizing: border-box;
        }

        .panel {
          background: #ffffff;
          border: 1px solid #ddd6fe;
          border-radius: 18px;
          box-shadow: 0 20px 60px rgba(17, 12, 34, 0.24);
          color: #17131f;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          font-size: 14px;
          line-height: 1.5;
          max-height: calc(100vh - 32px);
          overflow: hidden;
        }

        .header {
          align-items: center;
          background: #17131f;
          color: #ffffff;
          display: flex;
          justify-content: space-between;
          padding: 16px 18px;
        }

        .brand {
          align-items: center;
          display: flex;
          gap: 10px;
        }

        .brand-mark {
          align-items: center;
          background: #7c3aed;
          border-radius: 9px;
          display: flex;
          font-size: 15px;
          font-weight: 800;
          height: 30px;
          justify-content: center;
          width: 30px;
        }

        .brand-name {
          font-size: 15px;
          font-weight: 750;
          letter-spacing: -0.01em;
        }

        .alpha-label {
          color: #c4b5fd;
          display: block;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .close-button {
          align-items: center;
          background: rgba(255, 255, 255, 0.1);
          border: 0;
          border-radius: 8px;
          color: #ffffff;
          cursor: pointer;
          display: flex;
          font: inherit;
          font-size: 20px;
          height: 32px;
          justify-content: center;
          line-height: 1;
          padding: 0;
          width: 32px;
        }

        .close-button:hover {
          background: rgba(255, 255, 255, 0.18);
        }

        .scroll-area {
          max-height: calc(100vh - 94px);
          overflow-y: auto;
          padding: 18px;
        }

        .score-row {
          align-items: center;
          display: flex;
          gap: 14px;
          margin-bottom: 16px;
        }

        .overall-score {
          align-items: center;
          background: #f5f3ff;
          border: 1px solid #ddd6fe;
          border-radius: 50%;
          color: #5b21b6;
          display: flex;
          flex: 0 0 auto;
          flex-direction: column;
          font-size: 22px;
          font-weight: 800;
          height: 68px;
          justify-content: center;
          line-height: 1;
          width: 68px;
        }

        .overall-score span {
          color: #7c3aed;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.06em;
          margin-top: 4px;
          text-transform: uppercase;
        }

        .score-copy h1 {
          font-size: 18px;
          letter-spacing: -0.02em;
          line-height: 1.2;
          margin: 0 0 4px;
        }

        .score-copy p {
          color: #6b6475;
          font-size: 12px;
          margin: 0;
        }

        .main-issue {
          background: #f5f3ff;
          border: 1px solid #ddd6fe;
          border-radius: 14px;
          margin-bottom: 16px;
          padding: 14px;
        }

        .main-issue-positive {
          background: #f0fdf4;
          border-color: #bbf7d0;
        }

        .eyebrow {
          color: #6d28d9;
          display: block;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.08em;
          margin-bottom: 5px;
          text-transform: uppercase;
        }

        .main-issue h2 {
          font-size: 15px;
          line-height: 1.3;
          margin: 0 0 6px;
        }

        .main-issue p {
          color: #554e60;
          font-size: 12px;
          margin: 0;
        }

        .suggestion {
          background: #ffffff;
          border-radius: 9px;
          display: grid;
          font-size: 12px;
          gap: 2px;
          margin-top: 11px;
          padding: 10px;
        }

        .suggestion strong {
          color: #5b21b6;
        }

        .section-title {
          font-size: 12px;
          letter-spacing: 0.06em;
          margin: 18px 0 9px;
          text-transform: uppercase;
        }

        .categories {
          display: grid;
          gap: 8px;
        }

        .category {
          border: 1px solid #e7e3eb;
          border-radius: 12px;
          padding: 12px;
        }

        .category-muted {
          background: #fafafa;
        }

        .category-heading {
          align-items: center;
          display: flex;
          gap: 12px;
          justify-content: space-between;
        }

        .category-heading h3 {
          font-size: 13px;
          margin: 0;
        }

        .category-heading span {
          border-radius: 999px;
          font-size: 10px;
          font-weight: 800;
          padding: 3px 7px;
          white-space: nowrap;
        }

        .category p {
          color: #6b6475;
          font-size: 11px;
          margin: 7px 0 0;
        }

        .category-action {
          border-left: 2px solid #8b5cf6;
          color: #3f3849;
          font-size: 11px;
          margin-top: 8px;
          padding-left: 8px;
        }

        .category-muted .category-heading span {
          background: #eeeeee;
          color: #77717e;
        }

        .score-strong {
          background: #dcfce7;
          color: #166534;
        }

        .score-good {
          background: #ecfccb;
          color: #3f6212;
        }

        .score-work {
          background: #fef3c7;
          color: #92400e;
        }

        .score-weak {
          background: #fee2e2;
          color: #991b1b;
        }

        .preview {
          background: #fafafa;
          border: 1px solid #eeeeee;
          border-radius: 10px;
          color: #625a6c;
          font-size: 11px;
          margin-top: 16px;
          padding: 10px;
          white-space: pre-wrap;
        }

        .notice {
          background: #fff7ed;
          border-radius: 8px;
          color: #9a3412;
          font-size: 11px;
          margin: 12px 0 0;
          padding: 8px;
        }

        .disclaimer {
          color: #91899b;
          font-size: 10px;
          margin: 12px 0 0;
          text-align: center;
        }
      </style>

      <aside class="panel" aria-label="Copy Analyzer results">
        <header class="header">
          <div class="brand">
            <div class="brand-mark">C</div>
            <div>
              <span class="brand-name">Copy Analyzer</span>
              <span class="alpha-label">Rule-based alpha</span>
            </div>
          </div>
          <button class="close-button" type="button" aria-label="Close Copy Analyzer">&times;</button>
        </header>

        <div class="scroll-area">
          <div class="score-row">
            <div class="overall-score">
              ${result.overallScore}
              <span>Score</span>
            </div>
            <div class="score-copy">
              <h1>${escapeHtml(result.verdict)}</h1>
              <p>${result.stats.wordCount} words - ${result.stats.sentenceCount} sentences - average ${result.stats.averageSentenceLength} words per sentence</p>
            </div>
          </div>

          ${renderMainIssue(result)}

          <h2 class="section-title">Category feedback</h2>
          <div class="categories">
            ${result.categories.map(renderCategory).join("")}
          </div>

          <div class="preview">${escapeHtml(preview)}</div>
          ${truncatedNotice}
          <p class="disclaimer">Use these findings as editing prompts, not absolute truth.</p>
        </div>
      </aside>
    `;

    shadow.querySelector(".close-button").addEventListener("click", removePanel);
    document.documentElement.appendChild(host);
  }

  function handleMouseUp(event) {
    const existingPanel = document.getElementById(PANEL_HOST_ID);

    if (existingPanel && event.composedPath().includes(existingPanel)) {
      return;
    }

    setTimeout(function() {
      const rawSelection = getSelectedText(event.target).trim();

      if (!rawSelection) {
        return;
      }

      const wasTruncated = rawSelection.length > MAX_SELECTION_LENGTH;
      const textToAnalyze = rawSelection.slice(0, MAX_SELECTION_LENGTH);
      const result = globalThis.CopyAnalyzerEngine.analyzeCopy(textToAnalyze);

      createPanel(result, wasTruncated);
    }, 0);
  }

  document.addEventListener("mouseup", handleMouseUp, true);
  document.addEventListener("keydown", function(event) {
    if (event.key === "Escape") {
      removePanel();
    }
  });

  console.log("Copy Analyzer alpha loaded");
})();
