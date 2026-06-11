(function(global) {
  "use strict";

  const VAGUE_TERMS = [
    "amazing",
    "better",
    "best",
    "effective",
    "great",
    "high-quality",
    "improve",
    "innovative",
    "many",
    "powerful",
    "revolutionary",
    "seamless",
    "several",
    "solution",
    "solutions",
    "some",
    "stuff",
    "things",
    "various",
    "world-class"
  ];

  const BENEFIT_TERMS = [
    "avoid",
    "build",
    "convert",
    "earn",
    "gain",
    "get",
    "grow",
    "increase",
    "learn",
    "protect",
    "reach",
    "reduce",
    "save",
    "sell",
    "simplify",
    "understand",
    "win"
  ];

  const ACTION_TERMS = [
    "apply",
    "book",
    "buy",
    "click",
    "comment",
    "contact",
    "discover",
    "download",
    "join",
    "learn",
    "read",
    "register",
    "reply",
    "schedule",
    "send",
    "share",
    "start",
    "subscribe",
    "try",
    "visit"
  ];

  const FRICTION_TERMS = [
    "best-in-class",
    "cutting-edge",
    "ecosystem",
    "easy",
    "game-changing",
    "innovative",
    "leverage",
    "maybe",
    "optimize",
    "paradigm",
    "perhaps",
    "potentially",
    "seamless",
    "simply",
    "state-of-the-art",
    "synergy",
    "transformative",
    "utilize"
  ];

  function normalizeText(text) {
    return String(text || "")
      .replace(/\r\n/g, "\n")
      .replace(/[ \t]+/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  function getWords(text) {
    return text.match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu) || [];
  }

  function getSentences(text) {
    const sentences = text
      .split(/[.!?]+(?:\s+|$)/)
      .map(function(sentence) {
        return sentence.trim();
      })
      .filter(Boolean);

    return sentences.length > 0 ? sentences : [text];
  }

  function countTerms(text, terms) {
    const lowerText = text.toLowerCase();

    return terms.filter(function(term) {
      const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return new RegExp("\\b" + escapedTerm + "\\b", "i").test(lowerText);
    });
  }

  function makeIssue(title, explanation, suggestion, deduction) {
    return {
      title: title,
      explanation: explanation,
      suggestion: suggestion,
      deduction: deduction
    };
  }

  function makeCategory(id, label, assessed, issues) {
    if (!assessed) {
      return {
        id: id,
        label: label,
        assessed: false,
        score: null,
        status: "Not assessed",
        issues: []
      };
    }

    const totalDeduction = issues.reduce(function(total, issue) {
      return total + issue.deduction;
    }, 0);
    const score = Math.max(0, 100 - totalDeduction);

    return {
      id: id,
      label: label,
      assessed: true,
      score: score,
      status: getStatus(score),
      issues: issues
    };
  }

  function getStatus(score) {
    if (score >= 85) {
      return "Strong";
    }

    if (score >= 70) {
      return "Good";
    }

    if (score >= 50) {
      return "Needs work";
    }

    return "Weak";
  }

  function getVerdict(score, wordCount) {
    if (wordCount < 4) {
      return "Too little text to judge";
    }

    if (score >= 85) {
      return "Strong copy";
    }

    if (score >= 70) {
      return "Good copy";
    }

    if (score >= 50) {
      return "Copy needs work";
    }

    return "Weak copy";
  }

  function analyzeClarity(text, words, sentences) {
    const issues = [];
    const sentenceLengths = sentences.map(function(sentence) {
      return getWords(sentence).length;
    });
    const averageSentenceLength =
      sentenceLengths.reduce(function(total, length) {
        return total + length;
      }, 0) / sentenceLengths.length;
    const veryLongSentences = sentenceLengths.filter(function(length) {
      return length > 30;
    }).length;
    const complexWordCount = words.filter(function(word) {
      return word.length >= 13;
    }).length;

    if (averageSentenceLength > 26) {
      issues.push(
        makeIssue(
          "Sentences carry too much at once",
          "Long sentences make readers hold several ideas in their mind before reaching the point.",
          "Split the longest sentence and give each sentence one main job.",
          24
        )
      );
    } else if (averageSentenceLength > 20) {
      issues.push(
        makeIssue(
          "Sentences could be easier to scan",
          "The average sentence is long enough to slow down a busy reader.",
          "Shorten one or two sentences without removing the main meaning.",
          12
        )
      );
    }

    if (veryLongSentences > 1) {
      issues.push(
        makeIssue(
          "Several sentences are very long",
          "Repeated long sentences make the copy feel dense.",
          "Turn supporting details into separate sentences or bullets.",
          16
        )
      );
    }

    if (words.length >= 20 && complexWordCount / words.length > 0.12) {
      issues.push(
        makeIssue(
          "The wording may feel complex",
          "A high share of long words can make the message harder to absorb quickly.",
          "Replace formal words with shorter everyday alternatives where possible.",
          14
        )
      );
    }

    return makeCategory("clarity", "Clarity", true, issues);
  }

  function analyzeSpecificity(text, words) {
    const issues = [];
    const vagueMatches = countTerms(text, VAGUE_TERMS);
    const hasConcreteSignal = /(?:\d|[$€£%])/.test(text);

    if (vagueMatches.length >= 2) {
      issues.push(
        makeIssue(
          "Several claims are vague",
          "Broad words can sound positive without helping the reader picture the result.",
          "Replace at least one broad claim with a number, example, timeframe, or concrete outcome.",
          24
        )
      );
    } else if (vagueMatches.length === 1) {
      issues.push(
        makeIssue(
          "One claim could be more concrete",
          "A broad claim is harder for the reader to trust or remember.",
          "Support the claim with a number, example, timeframe, or concrete outcome.",
          12
        )
      );
    }

    if (words.length >= 25 && !hasConcreteSignal) {
      issues.push(
        makeIssue(
          "No concrete proof detected",
          "The copy does not include an obvious number, result, or measurable detail.",
          "Add one specific result, constraint, example, or timeframe if it is relevant.",
          12
        )
      );
    }

    return makeCategory("specificity", "Specificity", words.length >= 8, issues);
  }

  function analyzeValue(text, words) {
    const issues = [];
    const lowerText = text.toLowerCase();
    const hasReaderLanguage = /\b(you|your|reader|customer|client|team|business)\b/i.test(
      lowerText
    );
    const hasBenefit = countTerms(lowerText, BENEFIT_TERMS).length > 0;

    if (!hasReaderLanguage) {
      issues.push(
        makeIssue(
          "The reader is not clearly present",
          "Copy feels less relevant when readers cannot quickly see that it speaks to them.",
          "Name the intended reader or use 'you' to connect the message to their situation.",
          20
        )
      );
    }

    if (!hasBenefit) {
      issues.push(
        makeIssue(
          "The outcome is unclear",
          "The copy does not clearly show what changes or improves for the reader.",
          "State the practical result the reader gains, avoids, saves, or learns.",
          24
        )
      );
    }

    return makeCategory("value", "Value", words.length >= 8, issues);
  }

  function analyzeFriction(text, words) {
    const issues = [];
    const frictionMatches = countTerms(text, FRICTION_TERMS);
    const capitalizedWords = words.filter(function(word) {
      return word.length > 2 && word === word.toUpperCase() && /[A-Z]/.test(word);
    });

    if (frictionMatches.length >= 2) {
      issues.push(
        makeIssue(
          "The copy contains avoidable friction",
          "Jargon, filler, or unsupported ease claims can make the message feel less direct.",
          "Replace the most abstract phrases with plain language that describes what actually happens.",
          22
        )
      );
    } else if (frictionMatches.length === 1) {
      issues.push(
        makeIssue(
          "One phrase may create friction",
          "This wording may feel abstract, inflated, or less direct than necessary.",
          "Try stating the same idea using plain, specific language.",
          10
        )
      );
    }

    if (/!{2,}/.test(text) || capitalizedWords.length >= 2) {
      issues.push(
        makeIssue(
          "The emphasis may feel too strong",
          "Repeated exclamation marks or capitalized words can reduce trust.",
          "Let the value of the message create emphasis instead.",
          14
        )
      );
    }

    return makeCategory("friction", "Friction", true, issues);
  }

  function analyzeCta(text, words) {
    const issues = [];
    const hasAction = countTerms(text, ACTION_TERMS).length > 0;
    const hasQuestion = /\?/.test(text);
    const shouldAssess = words.length >= 20 || hasAction || hasQuestion;

    if (!hasAction && !hasQuestion) {
      issues.push(
        makeIssue(
          "No clear next step detected",
          "Readers may understand the message but still be unsure what to do next.",
          "End with one clear action, invitation, or focused question.",
          28
        )
      );
    }

    return makeCategory("cta", "CTA / Next step", shouldAssess, issues);
  }

  function analyzeStructure(text, words, sentences) {
    const issues = [];
    const paragraphs = text.split(/\n{2,}/).filter(Boolean);
    const hasLineBreak = /\n/.test(text);

    if (words.length >= 70 && !hasLineBreak) {
      issues.push(
        makeIssue(
          "The copy is one dense block",
          "Long blocks are easy to skip, especially on mobile.",
          "Break the copy into short paragraphs or bullets around distinct ideas.",
          24
        )
      );
    }

    if (words.length >= 35 && sentences.length <= 1) {
      issues.push(
        makeIssue(
          "The structure needs clearer stops",
          "A long passage without sentence breaks is difficult to follow.",
          "Use punctuation to separate the main point from supporting details.",
          22
        )
      );
    }

    if (paragraphs.some(function(paragraph) {
      return getWords(paragraph).length > 90;
    })) {
      issues.push(
        makeIssue(
          "A paragraph is too long",
          "A very long paragraph hides important points inside a wall of text.",
          "Start a new paragraph when the idea, example, or purpose changes.",
          16
        )
      );
    }

    return makeCategory("structure", "Structure", words.length >= 20, issues);
  }

  function analyzeCopy(input) {
    const text = normalizeText(input);
    const words = getWords(text);

    if (words.length === 0) {
      return {
        text: "",
        stats: {
          wordCount: 0,
          sentenceCount: 0,
          averageSentenceLength: 0,
          paragraphCount: 0
        },
        overallScore: 0,
        verdict: "Select some text",
        mainIssue: null,
        categories: [],
        issues: []
      };
    }

    const sentences = getSentences(text);
    const categories = [
      analyzeClarity(text, words, sentences),
      analyzeSpecificity(text, words),
      analyzeValue(text, words),
      analyzeFriction(text, words),
      analyzeCta(text, words),
      analyzeStructure(text, words, sentences)
    ];
    const assessedCategories = categories.filter(function(category) {
      return category.assessed;
    });
    const averageScore =
      assessedCategories.reduce(function(total, category) {
        return total + category.score;
      }, 0) / assessedCategories.length;
    const weakestScore = Math.min.apply(
      null,
      assessedCategories.map(function(category) {
        return category.score;
      })
    );
    const overallScore = Math.round(averageScore * 0.6 + weakestScore * 0.4);
    const issues = categories
      .flatMap(function(category) {
        return category.issues.map(function(issue) {
          return {
            categoryId: category.id,
            categoryLabel: category.label,
            title: issue.title,
            explanation: issue.explanation,
            suggestion: issue.suggestion,
            deduction: issue.deduction
          };
        });
      })
      .sort(function(firstIssue, secondIssue) {
        return secondIssue.deduction - firstIssue.deduction;
      });

    return {
      text: text,
      stats: {
        wordCount: words.length,
        sentenceCount: sentences.length,
        averageSentenceLength: Math.round(words.length / sentences.length),
        paragraphCount: text.split(/\n{2,}/).filter(Boolean).length
      },
      overallScore: overallScore,
      verdict: getVerdict(overallScore, words.length),
      mainIssue: issues[0] || null,
      categories: categories,
      issues: issues
    };
  }

  const api = {
    analyzeCopy: analyzeCopy
  };

  global.CopyAnalyzerEngine = api;

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
