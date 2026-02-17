import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { QuadraticVotingSolanaTurbine } from "../target/types/quadratic_voting_solana_turbine";
import { Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import { TOKEN_2022_PROGRAM_ID, getOrCreateAssociatedTokenAccount, mintTo, createMint, Mint, Account } from "@solana/spl-token";
import { BN } from "bn.js";

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

  const proposal_count = new BN(1);

  const voteAccount = PublicKey.findProgramAddressSync([Buffer.from("vote"), proposal_creator.publicKey.toBuffer(), proposal_count.toArrayLike(Buffer, "le", 8)], program.programId)[0];

  let mint_authority = Keypair.generate();

  let mint: PublicKey;

  let voter_ata: Account;
  
  it("Airdrop", async () => {

    await Promise.all([dao_creator, proposal_creator, voter, mint_authority].map(async (k) => {

      const sig = await anchor.getProvider().connection.requestAirdrop(k.publicKey, 3000 * anchor.web3.LAMPORTS_PER_SOL);

      await anchor.getProvider().connection.confirmTransaction(sig, "confirmed");
    
    }));

  });

  it("Token mint creation, ATA creation and minting tokens", async () => {

    mint = await createMint(anchor.getProvider().connection, mint_authority, mint_authority.publicKey, null, 9, undefined, undefined, TOKEN_2022_PROGRAM_ID);

    voter_ata = await getOrCreateAssociatedTokenAccount(anchor.getProvider().connection, voter, mint, voter.publicKey, false, undefined, undefined, TOKEN_2022_PROGRAM_ID);

    const mintAmount = 1_000_000_000;

    await mintTo(anchor.getProvider().connection, mint_authority, mint, voter_ata.address, mint_authority, mintAmount, [], undefined, TOKEN_2022_PROGRAM_ID);

  });
  
  it("DAO initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initializeDao(dao_name).accountsStrict({

      creator: dao_creator.publicKey,
      daoAccount: dao,
      systemProgram: SystemProgram.programId

    }).signers([dao_creator]).rpc().then(confirmTx);
    //console.log("Your transaction signature", tx);
  });

  it("Proposol on DAO initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initializeProposal(metadata).accountsStrict({

      creator: proposal_creator.publicKey,
      daoAccount: dao,
      proposal: proposal,
      systemProgram: SystemProgram.programId

    }).signers([proposal_creator]).rpc().then(confirmTx);
    //console.log("Your transaction signature", tx);
  });


  it("Cast vote on proposal", async () => {
    // Add your test here.
    const tx = await program.methods.castVote(0).accountsStrict({
      voter: voter.publicKey,
      daoAccount: dao,
      proposal: proposal,
      voteAccount: voteAccount,
      creatorTokenAccount: voter_ata.address,
      systemProgram: SystemProgram.programId
    }).signers([voter]).rpc().then(confirmTx);
    //console.log("Your transaction signature", tx);
  });

});