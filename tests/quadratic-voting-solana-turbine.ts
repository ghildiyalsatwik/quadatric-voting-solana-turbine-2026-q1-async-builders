import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { QuadraticVotingSolanaTurbine } from "../target/types/quadratic_voting_solana_turbine";
import { Keypair, PublicKey, SystemProgram } from "@solana/web3.js";

const confirmTx = async (signature: string): Promise<string> => {

  const latestBlockhash = await anchor.getProvider().connection.getLatestBlockhash();

  await anchor.getProvider().connection.confirmTransaction(
    
    {

      signature,
      ...latestBlockhash
    },

    "confirmed"
  );

  return signature;

};

describe("quadratic-voting-solana-turbine", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.quadraticVotingSolanaTurbine as Program<QuadraticVotingSolanaTurbine>;

  let dao_creator = Keypair.generate();

  let dao_name = "My DAO";

  let dao = PublicKey.findProgramAddressSync([Buffer.from("dao"), dao_creator.publicKey.toBytes(), Buffer.from(dao_name)], program.programId)[0];

  let metadata = "This is metadata about my DAO.";

  let proposal_creator = Keypair.generate();

  let proposal = PublicKey.findProgramAddressSync([Buffer.from("proposal"), dao.toBuffer(), Buffer.from(dao_name)], program.programId)[0];

  let voter = Keypair.generate();
  
  it("Airdrop", async () => {

    await Promise.all([dao_creator, proposal_creator, voter].map(async (k) => {

      const sig = await anchor.getProvider().connection.requestAirdrop(k.publicKey, 3000 * anchor.web3.LAMPORTS_PER_SOL);

      await anchor.getProvider().connection.confirmTransaction(sig, "confirmed");
    
    }));

  });
  
  it("DAO initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize_dao(dao_name).accountsStrict({

      creator: dao_creator.publicKey,
      daoAccount: dao,
      systemProgram: SystemProgram.programId

    }).rpc().then(confirmTx);
    //console.log("Your transaction signature", tx);
  });

  it("Proposol on DAO initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize_proposal(metadata).accountsStrict({

      creator: proposal_creator.publicKey,
      daoAccount: dao,
      proposal: proposal,
      systemProgram: SystemProgram.programId

    }).rpc().then(confirmTx);
    //console.log("Your transaction signature", tx);
  });


  it("Cast vote on proposal", async () => {
    // Add your test here.
    const tx = await program.methods.initialize_proposal(metadata).accountsStrict({

      creator: proposal_creator.publicKey,
      daoAccount: dao,
      proposal: proposal,
      systemProgram: SystemProgram.programId

    }).rpc().then(confirmTx);
    //console.log("Your transaction signature", tx);
  });

});
