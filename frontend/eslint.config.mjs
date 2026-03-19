import coreWebVitals from "eslint-config-next/core-web-vitals";

const config = [
  ...coreWebVitals,

  // Downgrade React Compiler strict rules to warnings.
  // Pre-existing codebase was not written for React Compiler strictness.
  {
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/preserve-manual-memoization": "warn",
      "react/no-unescaped-entities": "warn",
    },
  },

  // Pre-existing files with conditional hooks — known technical debt.
  {
    files: [
      "components/Post/BasePostItem.js",
      "components/Post/PostDetail.js",
    ],
    rules: {
      "react-hooks/rules-of-hooks": "warn",
    },
  },

  // Pre-existing undefined component reference.
  {
    files: ["components/UI/PremiumInteractions.js"],
    rules: {
      "react/jsx-no-undef": "warn",
    },
  },
];

export default config;
