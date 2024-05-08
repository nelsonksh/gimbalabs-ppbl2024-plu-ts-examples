import { PScriptContext, bool, data, pBool, pfn, Script, compile, makeValidator } from "@harmoniclabs/plu-ts";

const alwaysSucceedsContract = pfn(
  [data, data, PScriptContext.type],
  bool
)((_datum, _redeemer, ctx) => {
  return pBool(true);
});

///////////////////////////////////////////////////////////////////
// ------------------------------------------------------------- //
// ------------------------- utilities ------------------------- //
// ------------------------------------------------------------- //
///////////////////////////////////////////////////////////////////

export const untypedValidator = makeValidator(alwaysSucceedsContract);

export const compiledContract = compile(untypedValidator);

export const script = new Script("PlutusScriptV2", compiledContract);
