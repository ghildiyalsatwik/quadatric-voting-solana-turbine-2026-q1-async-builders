use anchor_lang::prelude::*;

pub mod instructions;
pub use instructions::*;

pub mod state;
pub use state::*;

declare_id!("5VPxgqqUV8qR2qpEjgkyb4wuwk5Wj29MV336WQFiZPMR");

#[program]
pub mod quadratic_voting_solana_turbine {
    use super::*;

    pub fn initialize_dao(ctx: Context<InitDao>, name: String) -> Result<()> {
        //msg!("Greetings from: {:?}", ctx.program_id);
        ctx.accounts.init_dao(name, ctx.bumps)
    }

    pub fn initialize_proposal(ctx: Context<InitProposal>, metadata: String) -> Result<()> {

        ctx.accounts.init_proposal(ctx.bumps, metadata)
    }

    pub fn cast_vote(ctx: Context<CastVote>, vote_type: u8) -> Result<()> {

        ctx.accounts.cast_vote(ctx.bumps, vote_type)
    }
}

// #[derive(Accounts)]
// pub struct Initialize {}
