import me from 'math-expressions';

export var appliedFunctionSymbols = [
  "abs", "exp", "log", "ln", "log10", "sign", "sqrt", "erf",
  "acos", "acosh", "acot", "acoth", "acsc", "acsch", "asec",
  "asech", "asin", "asinh", "atan", "atanh",
  "cos", "cosh", "cot", "coth", "csc", "csch", "sec",
  "sech", "sin", "sinh", "tan", "tanh",
  'arcsin', 'arccos', 'arctan', 'arccsc', 'arcsec', 'arccot', 'cosec',
  'arg',
  'min', 'max', 'mean', 'median',
  'floor', 'ceil', 'round',
  'sum', 'prod', 'var', 'std',
  'count', 'mod'
];

export var textToAst = new me.converters.textToAstObj({
  appliedFunctionSymbols
});

export var latexToAst = new me.converters.latexToAstObj({
  appliedFunctionSymbols
});


export function normalizeMathExpression({ value, simplify, expand = false,
  createVectors = false, createIntervals = false
}) {

  if (createVectors) {
    value = value.tuples_to_vectors();
  }
  if (createIntervals) {
    value = value.to_intervals();
  }
  if (expand) {
    value = value.expand();
  }
  if (simplify === "full") {
    return value.simplify();
  } else if (simplify === "numbers") {
    return value.evaluate_numbers();
  } else if (simplify === "numberspreserveorder") {
    return value.evaluate_numbers({ skip_ordering: true });
  }
  return value;
}

export function findFiniteNumericalValue(value) {
  // return undefined if value is undefined
  // returns null if value has a non-numerical value (including Infinity)
  // otherwise, returns numerical value

  if (value === undefined) {
    return undefined;
  }

  if (Number.isFinite(value)) {
    return value;
  }

  if (value.evaluate_to_constant !== undefined) {
    value = value.evaluate_to_constant();
    if (Number.isFinite(value)) {
      return value;
    }
  }

  // couldn't find numerical value
  return null;
}


export function convertValueToMathExpression(value) {
  if (value === undefined || value === null) {
    return me.fromAst('\uFF3F');  // long underscore
  } else if (value instanceof me.class) {
    return value;
  } else if (typeof value === "number" || typeof value === "string") {
    // let value be math-expression based on value
    return me.fromAst(value);
  } else {
    return me.fromAst('\uFF3F');  // long underscore
  }
}

export function returnNVariables(n, variablesSpecified) {

  // console.log(`return N variables`, n, variablesSpecified)

  if (!Number.isInteger(n) || n < 1) {
    return [];
  }

  let nVariablesSpecified = variablesSpecified.length;

  if (nVariablesSpecified === 0) {
    if (n === 1) {
      return [me.fromAst("x")];
    } else if (n === 2) {
      return [me.fromAst("x"), me.fromAst("y")];
    } else if (n === 3) {
      return [me.fromAst("x"), me.fromAst("y"), me.fromAst("z")]
    } else {
      let variables = [];
      for (let i = 1; i <= n; i++) {
        variables.push(me.fromAst(textToAst.convert(`x_${i}`)))
      }
      return variables;
    }
  }


  if ((new Set(variablesSpecified.map(x => x.toString()))).size
    < nVariablesSpecified) {
    console.warn('Duplicate variables specified')
  }

  if (n <= nVariablesSpecified) {
    return variablesSpecified.slice(0, n);
  }

  let variablesUsed = [...variablesSpecified.map(x => x.toString())];
  let variables = [...variablesSpecified];
  for (let i = nVariablesSpecified + 1; i <= n; i++) {
    let preferredVariables;
    if (i == 1) {
      if (n > 3) {
        preferredVariables = ["x_1"];
      } else {
        preferredVariables = ["x"];
      }
    } else if (i == 2) {
      if (n > 3) {
        preferredVariables = ["x_2", "y_2"];
      } else {
        preferredVariables = ["y", "x_2"];
      }
    } else if (i == 3) {
      if (n > 3) {
        preferredVariables = ["x_3", "y_3", "z_3"];
      } else {
        preferredVariables = ["z", "x_3", "z_3"];
      }
    } else {
      preferredVariables =
        ["x", "y", "z", "u", "v", "w", "X", "Y", "Z"].map(x => `${x}_${i}`)
    }
    let addedVariable = false;
    for (let v of preferredVariables) {
      if (!variablesUsed.includes(v)) {
        variables.push(me.fromAst(textToAst.convert(v)));
        variablesUsed.push(v);
        addedVariable = true;
        break;
      }
    }
    if (!addedVariable) {
      let v = preferredVariables[0]
      variables.push(me.fromAst(textToAst.convert(v)));
      variablesUsed.push(v);
      console.warn(`Variables added were not unique`)
    }
  }

  return variables;

}


export function mergeVectorsForInverseDefinition({ desiredVector, currentVector, workspace, workspaceKey }) {

  if (desiredVector.tree[0] === "vector" && currentVector.tree[0] === "vector") {

    let vectorAst;
    if (workspace[workspaceKey]) {
      vectorAst = workspace[workspaceKey].slice(0);
    } else {
      vectorAst = currentVector.tree.slice(0);
    }

    for (let [ind, value] of desiredVector.tree.entries()) {
      if (value !== undefined) {
        vectorAst[ind] = value;
      }
    }

    desiredVector = me.fromAst(vectorAst);
    workspace[workspaceKey] = vectorAst;

  }

  return desiredVector;
}

export function substituteUnicodeInLatexString(latexString) {

  let substitutions = [
    ['\u03B1', '\\alpha '], // '??'
    ['\u03B2', '\\beta '], // '??'
    ['\u03D0', '\\beta '], // '??'
    ['\u0393', '\\Gamma '], // '??'
    ['\u03B3', '\\gamma '], // '??'
    ['\u0394', '\\Delta '], // '??'
    ['\u03B4', '\\delta '], // '??'
    ['\u03B5', '\\epsilon '], // '??' should this be varepsilon?
    ['\u03F5', '\\epsilon '], // '??'
    ['\u03B6', '\\zeta '], // '??'
    ['\u03B7', '\\eta '], // '??'
    ['\u0398', '\\Theta '], // '??'
    ['\u03F4', '\\Theta '], // '??'
    ['\u03B8', '\\theta '], // '??'
    ['\u1DBF', '\\theta '], // '???'
    ['\u03D1', '\\theta '], // '??'
    ['\u03B9', '\\iota '], // '??'
    ['\u03BA', '\\kappa '], // '??'
    ['\u039B', '\\Lambda '], // '??'
    ['\u03BB', '\\lambda '], // '??'
    ['\u03BC', '\\mu '], // '??'
    ['\u00B5', '\\mu '], // '??' should this be micro?
    ['\u03BD', '\\nu '], // '??'
    ['\u039E', '\\Xi '], // '??'
    ['\u03BE', '\\xi '], // '??'
    ['\u03A0', '\\Pi '], // '??'
    ['\u03C0', '\\pi '], // '??'
    ['\u03D6', '\\pi '], // '??' should this be varpi?
    ['\u03C1', '\\rho '], // '??'
    ['\u03F1', '\\rho '], // '??' should this be varrho?
    ['\u03A3', '\\Sigma '], // '??'
    ['\u03C3', '\\sigma '], // '??'
    ['\u03C2', '\\sigma '], // '??' should this be varsigma?
    ['\u03C4', '\\tau '], // '??'
    ['\u03A5', '\\Upsilon '], // '??'
    ['\u03C5', '\\upsilon '], // '??'
    ['\u03A6', '\\Phi '], // '??'
    ['\u03C6', '\\phi '], // '??' should this be varphi?
    ['\u03D5', '\\phi '], // '??'
    ['\u03A8', '\\Psi '], // '??'
    ['\u03C8', '\\psi '], // '??'
    ['\u03A9', '\\Omega '], // '??'
    ['\u03C9', '\\omega '], // '??'
  ]

  for(let sub of substitutions) {
    latexString = latexString.replaceAll(sub[0], sub[1])
  }

  return latexString;

}