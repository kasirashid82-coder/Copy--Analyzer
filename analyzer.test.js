const assert = require("node:assert/strict");
const { analyzeCopy } = require("./analyzer.js");

const shortResult = analyzeCopy("Write clearer emails that get more replies.");
assert.equal(shortResult.stats.wordCount, 7);
assert.equal(shortResult.categories.find((category) => category.id === "cta").assessed, false);

const tinyResult = analyzeCopy("Clearer emails");
assert.equal(tinyResult.verdict, "Too little text to judge");

const vagueResult = analyzeCopy(
  "Our innovative solution gives businesses amazing and seamless results."
);
assert.ok(vagueResult.issues.some((issue) => issue.categoryId === "specificity"));
assert.ok(vagueResult.issues.some((issue) => issue.categoryId === "friction"));
assert.ok(vagueResult.overallScore < 70);

const actionableResult = analyzeCopy(
  "Save five hours every week with a clearer client approval process. Book a demo today."
);
assert.equal(
  actionableResult.categories.find((category) => category.id === "cta").issues.length,
  0
);
assert.equal(
  actionableResult.categories.find((category) => category.id === "value").issues.length,
  0
);

const emptyResult = analyzeCopy("   ");
assert.equal(emptyResult.stats.wordCount, 0);

const denseResult = analyzeCopy(
  "Our platform helps companies improve their operations by bringing together many different tools and useful capabilities which are designed to support teams as they work through complex processes and attempt to achieve better outcomes while also making sure that everyone involved has access to the information they need at the appropriate time without having to move between several separate systems or rely on slow manual updates that may create unnecessary confusion and delays."
);
assert.ok(denseResult.issues.some((issue) => issue.categoryId === "structure"));
assert.ok(denseResult.issues.some((issue) => issue.categoryId === "clarity"));

console.log("Analyzer tests passed.");
