const REGEX_ASIGNMENT_EXPRESSION_RHS = /\s*=\s*\w+\s*/g;

module.exports = {
    REGEX_WHITE_SPACE: /\s/g,
    REGEX_PARAM_SEPERATOR: /\s*,\s*/g,
    //REGEX_DECORATOR_DETECT: /@.*/g,
    REGEX_DECORATOR_DETECT: /\s*@\w.*\s*/g,
    //REGEX_FUNCTION_DETECT: /^function(\s+\w*)*\s*\((.*)\)/,
    REGEX_FUNCTION_DETECT: /^function(\s+\w*)*\s*\(((.|\n)*)\)/,
    REGEX_FUNCTION_BODY_DETECT: /{(.|\n)*}/,
    REGEX_ASIGNMENT_EXPRESSION_RHS,
    REGEX_DEFAULT_ARG: REGEX_ASIGNMENT_EXPRESSION_RHS,
    REGEX_ES6_CLASS_DETECT: /^class/,
    REGEX_ES6_CONSTRUCTOR_DETECT: /constructor\s*\(((.|\n)*)\)/,
    REGEX_ES6_CONSTRUCTOR_EXTRACT: /constructor\s*(\((.|\n)*\))(.|\n)(.|\n)*}/,
    REGEX_REST_PARAM_DETECT: /^\.\.\./,
}