import {
  PScriptContext,
  bool,
  data,
  pBool,
  pfn,
  Script,
  compile,
  makeValidator,
  pstruct,
  PCurrencySymbol,
  palias,
  bs,
  Term,
  pBs,
  int,
  str,
} from "@harmoniclabs/plu-ts";

const simpleFaucetContract = pfn(
  [data, data, PScriptContext.type],
  bool
)((_datum, _redeemer, ctx) => {
  const cs = palias(bs);
  const accessTokenSymbol: Term<typeof cs> = cs.from(
    pBs("903c419ee7ebb6bf4687c61fb133d233ef9db2f80e4d734db3fbaf0b")
  );

  const txInfo = ctx.tx;

  const inputHasAccessToken = txInfo.inputs.some((input) =>
    input.resolved.value.some((value) => value.fst.eq(accessTokenSymbol))
  );
  return inputHasAccessToken;
});

///////////////////////////////////////////////////////////////////
// ------------------------------------------------------------- //
// ------------------------- utilities ------------------------- //
// ------------------------------------------------------------- //
///////////////////////////////////////////////////////////////////

export const untypedValidator = makeValidator(simpleFaucetContract);

export const compiledContract = compile(untypedValidator);

export const script = new Script("PlutusScriptV2", compiledContract);
