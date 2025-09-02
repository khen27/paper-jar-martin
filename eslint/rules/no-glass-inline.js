module.exports = {
  meta: { type: "problem", docs: { description: "Disallow inline glass styles outside recipes" } },
  create(context) {
    const filename = context.getFilename();
    const allowed = filename.includes("/theme/") || filename.includes("/components/primitives/") || filename.includes("/components/glass/");
    return {
      Literal(node) {
        if (allowed) return;
        if (typeof node.value === "string" && node.value.includes("rgba(255, 255, 255")) {
          context.report({ node, message: "Inline glass rgba found. Use tokens/recipes." });
        }
      },
      Property(node) {
        if (allowed) return;
        const name = node.key && node.key.name;
        if (name === "shadowOpacity" || name === "shadowRadius") {
          context.report({ node, message: "Inline shadow found. Use tokens/recipes." });
        }
      }
    };
  },
};
