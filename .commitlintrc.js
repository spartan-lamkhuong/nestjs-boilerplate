module.exports = {
  plugins: [
    {
      rules: {
        'header-match-team-pattern': (parsed) => {
          const { ticket, subject } = parsed;
          if (ticket === null && subject === null) {
            return [
              false,
              "Type of commit 'TP-1234: description' or 'ci|feat|fix|docs|style|refactor|test|revert|chore|build: description'",
            ];
          }
          return [true, ''];
        },
      },
    },
  ],
  parserPreset: {
    parserOpts: {
      headerPattern:
        /^(TP-\d+|ci|feat|fix|docs|style|refactor|test|revert|chore|build):\s.+$/,
      headerCorrespondence: ['ticket', 'subject'],
    },
  },
  rules: {
    'header-match-team-pattern': [2, 'always'],
  },
};
