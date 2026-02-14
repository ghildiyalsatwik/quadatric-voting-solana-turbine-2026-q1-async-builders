use anchor_lang::prelude::*;

declare_id!("7ivULttFBsFjhXc4pPVjq8F1DbWNQSESc5HipRm2dE2M");

#[program]
pub mod quadratic_voting_solana_turbine {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
