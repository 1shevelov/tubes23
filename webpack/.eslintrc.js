module.exports = {
    root: true,
    env: {
        commonjs: true,
        es6: true,
        node: true,
    },
    extends: ["airbnb-base", "prettier", "plugin:node/recommended", "plugin:import/recommended"],
    plugins: ["prettier"],
    parserOptions: {
        // Only ESLint 6.2.0 and later support ES2020.
        ecmaVersion: 2020,
        sourceType: "module",
    },
    rules: {
        "prettier/prettier": "error",
        "global-require": "off",
        "import/no-dynamic-require": "off",
        "no-console": "off",
        "node/no-unsupported-features/es-syntax": "off",
        "import/no-extraneous-dependencies": "off",
        "node/no-unpublished-require": "off",
        "node/no-unpublished-import": "off",
    },
};
