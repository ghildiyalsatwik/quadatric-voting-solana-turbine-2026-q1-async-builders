use anchor_lang::prelude::*;
use anchor_spl::token::TokenAccount;

use crate::state::{Dao, Proposal, Vote};

#[derive(Accounts)]
pub struct CastVote<'info> {
    #[account(mut)]
    pub voter: Signer<'info>,
    #[account(
        seeds = [b"dao", dao_account.authority.key().as_ref(), dao_account.bump.to_le_bytes().as_ref()],
        bump = dao_account.bump
    )]
    pub dao_account: Account<'info, Dao>,
    #[account(
        mut,
        seeds = [b"proposal", proposal.authority.key().as_ref(), dao_account.proposal_count.to_le_bytes().as_ref()],
        bump = proposal.bump)]
    pub proposal: Account<'info, Proposal>,
    #[account(
        init,
        payer = voter,
        space = Vote::DISCRIMINATOR.len() + Vote::INIT_SPACE,
        seeds = [b"vote", voter.key().as_ref(), proposal.key().as_ref()],
        bump
    )]
    pub vote_account: Account<'info, Vote>,
    #[account(
        token::authority = voter
    )]
    pub creator_token_account: Account<'info, TokenAccount>,
    pub system_program: Program<'info, System>
}

impl<'info> CastVote<'info> {

    pub fn cast_vote(&mut self, bumps: CastVoteBumps, vote_type: u8) -> Result<()> {

        let voting_credits = (self.creator_token_account.amount as f64).sqrt() as u64;

        self.vote_account.set_inner(Vote { authority: (self.voter.key()), vote_type, vote_credits: (voting_credits), bump: (bumps.vote_account) });

        Ok(())
    }
}