import { script } from "./contracts/always-succeeds";
// import { script } from "./contracts/simple-faucet";
// import { script } from "./contracts/faucet-with-token";

console.log("validator compiled succesfully! 🎉\n");
console.log(
    JSON.stringify(
        script.toJson(),
        undefined,
        2
    )
);