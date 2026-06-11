# Copy Analyzer

Copy Analyzer is a rule-based Chrome extension that gives practical feedback on highlighted copy.

## What the alpha checks

- Clarity
- Specificity
- Value
- Friction
- CTA / next step
- Structure

The feedback is designed to reveal possible weaknesses. It is not an objective judgment of writing quality.

## Install

1. Open `chrome://extensions`.
2. Turn on **Developer mode**.
3. Click **Load unpacked**.
4. Select this `Copy- Analyzer` folder.

After changing the extension files, reload the extension and refresh any webpage where you want to test it.

## Use

1. Open a normal webpage.
2. Highlight some text.
3. Read the Copy Analyzer panel in the top-right corner.
4. Press Escape or the close button to close it.

Chrome does not allow extensions to run on protected pages such as `chrome://extensions`.

## Test

Open `manual-test.html` in Chrome and highlight the prepared copy samples.

Run the automatic analysis-engine checks with:

```powershell
node analyzer.test.js
```

## Current limitations

- The analysis uses transparent rules, not AI.
- The rules cannot fully understand context, tone, or factual accuracy.
- Some complex editors, including canvas-based editors, may not expose selected text to the extension.
- Scores should be treated as editing prompts, not absolute truth.
