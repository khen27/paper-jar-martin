module.exports = {
  plugins: ["local"],
  rules: { "local/no-glass-inline": "warn" },
  overrides: [
    { files: ["**/*.ts","**/*.tsx"], plugins:["local"], rules: {"local/no-glass-inline":"warn"} }
  ],
  settings: {
    "import/core-modules": ["local/no-glass-inline"]
  }
};
