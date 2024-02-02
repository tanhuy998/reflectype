module.exports = {
    "env": {
        "browser": true,
        "commonjs": true,
        "es2021": true
    },
    "extends": "eslint:recommended",
    "overrides": [
        {
            "env": {
                "node": true
            },
            "files": [
                ".eslintrc.{js,cjs}"
            ],
            "parserOptions": {
                "sourceType": "script"
            }
        }
    ],
    "parserOptions": {
        "ecmaVersion": "latest"
    },
    "rules": {
        "no-console": "warn",
        "no-unused-vars": "warn",
        "no-undef": "error",
        "no-constant-condition": "off",
        "no-this-before-super": "error",
        "no-unused-private-class-members": "warn",
        "block-scoped-var": "error",
        "no-var": "error",
        "prefer-const": "error",
        "vars-on-top": "error",
        "constructor-super": "error",
        "getter-return": "error",
        "no-debugger": "warn",
        "no-dupe-class-members": "error",
        "no-dupe-keys": "error",
        "no-duplicate-case": "error",
        "no-duplicate-imports": "error",
        "no-irregular-whitespace": "warn",
        "no-new-symbol": "error",
    }
}
