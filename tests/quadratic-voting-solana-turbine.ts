import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { QuadraticVotingSolanaTurbine } from "../target/types/quadratic_voting_solana_turbine";

describe("quadratic-voting-solana-turbine", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.quadraticVotingSolanaTurbine as Program<QuadraticVotingSolanaTurbine>;

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
  });
});
