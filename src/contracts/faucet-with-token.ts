import {
  PScriptContext,
  PTxInInfo,
  PMaybe,
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
  PPubKeyHash,
  plam,
  pmatch,
  PScriptPurpose,
  PTxOutRef,
  pStr,
  pif,
  perror,
  pInt,
  pData,
  toData,
  pIntToData,
  pBSToData,
} from "@harmoniclabs/plu-ts";

const FaucetDatum = pstruct({
  FaucetDatum: {
    withdrawalAmount: int, // the specific amount of tokens the user can withdraw at a time
    faucetTokenName: str, // the name of the token the faucet is dispensing
  },
});

const FaucetRedeemer = pstruct({
  FaucetRedeemer: {
    senderPkh: PPubKeyHash.type, // the public key hash of the user redeeming the token
    accessTokenName: str, // the name of the token with which the user is redeeming
  },
});

const simpleFaucetContract = pfn(
  [FaucetDatum.type, FaucetRedeemer.type, PScriptContext.type],
  bool
)((datum, redeemer, ctx) => {
  const cs = palias(bs);
  const accessTokenSymbol: Term<typeof cs> = cs.from(
    pBs("903c419ee7ebb6bf4687c61fb133d233ef9db2f80e4d734db3fbaf0b")
  );
  const faucetTokenSymbol: Term<typeof cs> = cs.from(
    pBs("5e74a87d8109db21fe3d407950c161cd2df7975f0868e10682a3dbfe")
  );

  const txInfo = ctx.tx;

  // Check if the transaction has input that has an access token
  const inputHasAccessToken = txInfo.inputs.some((input) =>
    input.resolved.value.some((value) => value.fst.eq(accessTokenSymbol))
  );

  const outputToReceiver = txInfo.outputs.some((output) =>
    redeemer.senderPkh.eq(output.address.credential.pkh)
  );

  // Check if the transaction has output that has an access token to the user i.e. reciever
  const outputHasAccessTokenToUser = txInfo.outputs.some((output) =>
    output.value.some((value) =>
      value.fst.eq(accessTokenSymbol).and(outputToReceiver)
    )
  );

  const outputHasWithdrawalAmount = txInfo.outputs.some((output) =>
    output.value.some((value) =>
      value.snd.some((amount) => amount.snd.eq(datum.withdrawalAmount))
    )
  );

  // Check if the transaction has output that has the faucet token with correct amount to the user i.e. reciever
  const outputHasCorrectAmountFaucetTokensToUser = txInfo.outputs.some(
    (output) =>
      output.value.some((value) =>
        value.fst
          .eq(faucetTokenSymbol)
          .and(outputHasWithdrawalAmount)
          .and(outputToReceiver)
      )
  );

  return inputHasAccessToken
    .and(outputHasAccessTokenToUser)
    .and(outputHasCorrectAmountFaucetTokensToUser);
});

///////////////////////////////////////////////////////////////////
// ------------------------------------------------------------- //
// ------------------------- utilities ------------------------- //
// ------------------------------------------------------------- //
///////////////////////////////////////////////////////////////////

export const untypedValidator = makeValidator(simpleFaucetContract);

export const compiledContract = compile(untypedValidator);

export const script = new Script("PlutusScriptV2", compiledContract);
