use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    borsh::try_from_slice_unchecked,
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    program_pack::IsInitialized,
    pubkey::Pubkey,
    system_instruction,
    sysvar::{rent::Rent, Sysvar},
    program::{invoke, invoke_signed},
    clock::Clock,
};
use std::collections::HashMap;

// Program ID will be determined during deployment
entrypoint!(process_instruction);

// Instruction types
#[derive(BorshSerialize, BorshDeserialize, Debug, PartialEq)]
pub enum SMDAOInstruction {
    // Initialize a creator profile
    InitializeCreator {
        name: String,
        platform_links: Vec<String>,
    },
    
    // Create a new proposal
    CreateProposal {
        title: String,
        description: String,
        options: Vec<String>,
        proposal_type: ProposalType,
        end_time: i64,
    },
    
    // Vote on a proposal
    Vote {
        proposal_id: u64,
        option_index: u8,
        vote_weight: u64,
    },
    
    // Stake tokens
    Stake {
        amount: u64,
    },
    
    // Unstake tokens
    Unstake {
        amount: u64,
    },
    
    // Claim rewards
    ClaimRewards,
}

// Types of proposals
#[derive(BorshSerialize, BorshDeserialize, Debug, PartialEq, Clone)]
pub enum ProposalType {
    Idea,      // Low stake requirement
    Proposal,  // Higher stake requirement
}

// User account data structure
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct User {
    pub initialized: bool,
    pub wallet: Pubkey,
    pub staked_amount: u64,
    pub voting_history: Vec<VoteRecord>,
    pub rewards_earned: u64,
    pub last_claim_time: i64,
}

// Vote record structure
#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]
pub struct VoteRecord {
    pub proposal_id: u64,
    pub option_index: u8,
    pub vote_weight: u64,
    pub timestamp: i64,
}

// Creator profile structure
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct Creator {
    pub initialized: bool,
    pub owner: Pubkey,
    pub name: String,
    pub platform_links: Vec<String>,
    pub proposals: Vec<u64>,
    pub token_pool: u64,
}

// Proposal structure
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct Proposal {
    pub initialized: bool,
    pub id: u64,
    pub creator: Pubkey,
    pub title: String,
    pub description: String,
    pub options: Vec<String>,
    pub votes: Vec<u64>,
    pub proposal_type: ProposalType,
    pub create_time: i64,
    pub end_time: i64,
    pub total_votes: u64,
    pub is_active: bool,
}

// Program state to track proposal IDs
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct ProgramState {
    pub proposal_counter: u64,
}

impl IsInitialized for User {
    fn is_initialized(&self) -> bool {
        self.initialized
    }
}

impl IsInitialized for Creator {
    fn is_initialized(&self) -> bool {
        self.initialized
    }
}

impl IsInitialized for Proposal {
    fn is_initialized(&self) -> bool {
        self.initialized
    }
}

// Main instruction handler
pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    // Deserialize instruction data using BorshDeserialize::try_from_slice
    let instruction = borsh::BorshDeserialize::deserialize(&mut &instruction_data[..])
        .map_err(|_| ProgramError::InvalidInstructionData)?;
    
    match instruction {
        SMDAOInstruction::InitializeCreator { name, platform_links } => {
            process_initialize_creator(program_id, accounts, name, platform_links)
        },
        SMDAOInstruction::CreateProposal { title, description, options, proposal_type, end_time } => {
            process_create_proposal(program_id, accounts, title, description, options, proposal_type, end_time)
        },
        SMDAOInstruction::Vote { proposal_id, option_index, vote_weight } => {
            process_vote(program_id, accounts, proposal_id, option_index, vote_weight)
        },
        SMDAOInstruction::Stake { amount } => {
            process_stake(program_id, accounts, amount)
        },
        SMDAOInstruction::Unstake { amount } => {
            process_unstake(program_id, accounts, amount)
        },
        SMDAOInstruction::ClaimRewards => {
            process_claim_rewards(program_id, accounts)
        },
    }
}

// Initialize creator profile
fn process_initialize_creator(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    name: String,
    platform_links: Vec<String>,
) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();
    
    // Get accounts
    let creator_account = next_account_info(accounts_iter)?;
    let creator_owner = next_account_info(accounts_iter)?;
    let system_program = next_account_info(accounts_iter)?;
    
    // Ensure the creator account is owned by the program
    if creator_account.owner != program_id {
        return Err(ProgramError::IncorrectProgramId);
    }
    
    // Ensure creator owner signed the transaction
    if !creator_owner.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }
    
    // Create creator account data
    let creator = Creator {
        initialized: true,
        owner: *creator_owner.key,
        name,
        platform_links,
        proposals: Vec::new(),
        token_pool: 0,
    };
    
    // Serialize and save creator data
    borsh::to_writer(&mut &mut creator_account.data.borrow_mut()[..], &creator)
        .map_err(|_| ProgramError::AccountDataTooSmall)?;
    
    msg!("Creator profile initialized");
    Ok(())
}

// Create a new proposal
fn process_create_proposal(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    title: String,
    description: String,
    options: Vec<String>,
    proposal_type: ProposalType,
    end_time: i64,
) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();
    
    // Get accounts
    let proposal_account = next_account_info(accounts_iter)?;
    let creator_account = next_account_info(accounts_iter)?;
    let creator_owner = next_account_info(accounts_iter)?;
    let program_state_account = next_account_info(accounts_iter)?;
    let system_program = next_account_info(accounts_iter)?;
    
    // Ensure the proposal account is owned by the program
    if proposal_account.owner != program_id {
        return Err(ProgramError::IncorrectProgramId);
    }
    
    // Ensure creator owner signed the transaction
    if !creator_owner.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }
    
    // Load creator data
    let mut creator_data = creator_account.data.borrow();
    let mut creator: Creator = BorshDeserialize::deserialize(&mut &creator_data[..])
        .map_err(|_| ProgramError::InvalidAccountData)?;
    drop(creator_data);
    
    // Ensure creator is initialized
    if !creator.initialized {
        return Err(ProgramError::UninitializedAccount);
    }
    
    // Ensure creator owner matches
    if creator.owner != *creator_owner.key {
        return Err(ProgramError::InvalidAccountData);
    }
    
    // Get program state to get next proposal ID
    let mut program_state = if program_state_account.data_is_empty() {
        ProgramState { proposal_counter: 0 }
    } else {
        let mut program_state_data = program_state_account.data.borrow();
        BorshDeserialize::deserialize(&mut &program_state_data[..])
            .map_err(|_| ProgramError::InvalidAccountData)?
    };
    
    let proposal_id = program_state.proposal_counter;
    program_state.proposal_counter += 1;
    
    // Create votes vector initialized with zeros
    let votes = vec![0u64; options.len()];
    
    // Create proposal
    let proposal = Proposal {
        initialized: true,
        id: proposal_id,
        creator: *creator_account.key,
        title,
        description,
        options,
        votes,
        proposal_type,
        create_time: Clock::get()?.unix_timestamp,
        end_time,
        total_votes: 0,
        is_active: true,
    };
    
    // Update creator's proposals list
    creator.proposals.push(proposal_id);
    
    // Save data using borsh::to_writer
    borsh::to_writer(&mut &mut proposal_account.data.borrow_mut()[..], &proposal)
        .map_err(|_| ProgramError::AccountDataTooSmall)?;
    
    borsh::to_writer(&mut &mut creator_account.data.borrow_mut()[..], &creator)
        .map_err(|_| ProgramError::AccountDataTooSmall)?;
    
    borsh::to_writer(&mut &mut program_state_account.data.borrow_mut()[..], &program_state)
        .map_err(|_| ProgramError::AccountDataTooSmall)?;
    
    msg!("Proposal created with ID: {}", proposal_id);
    Ok(())
}

// Vote on a proposal
fn process_vote(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    proposal_id: u64,
    option_index: u8,
    vote_weight: u64,
) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();
    
    // Get accounts
    let user_account = next_account_info(accounts_iter)?;
    let proposal_account = next_account_info(accounts_iter)?;
    let user_owner = next_account_info(accounts_iter)?;
    
    // Ensure user owner signed the transaction
    if !user_owner.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }
    
    // Load user and proposal data
    let mut user_data = user_account.data.borrow();
    let mut user: User = BorshDeserialize::deserialize(&mut &user_data[..])
        .map_err(|_| ProgramError::InvalidAccountData)?;
    drop(user_data);
    
    let mut proposal_data = proposal_account.data.borrow();
    let mut proposal: Proposal = BorshDeserialize::deserialize(&mut &proposal_data[..])
        .map_err(|_| ProgramError::InvalidAccountData)?;
    drop(proposal_data);
    
    // Ensure accounts are initialized
    if !user.initialized || !proposal.initialized {
        return Err(ProgramError::UninitializedAccount);
    }
    
    // Ensure user owner matches
    if user.wallet != *user_owner.key {
        return Err(ProgramError::InvalidAccountData);
    }
    
    // Ensure proposal is active
    if !proposal.is_active {
        return Err(ProgramError::InvalidAccountData);
    }
    
    // Ensure voting period hasn't ended
    let current_time = Clock::get()?.unix_timestamp;
    if current_time > proposal.end_time {
        return Err(ProgramError::InvalidAccountData);
    }
    
    // Ensure option index is valid
    if option_index as usize >= proposal.options.len() {
        return Err(ProgramError::InvalidInstructionData);
    }
    
    // Ensure user has enough staked tokens based on proposal type
    match proposal.proposal_type {
        ProposalType::Idea => {
            if user.staked_amount < 10 { // Example minimum stake for ideas
                return Err(ProgramError::InsufficientFunds);
            }
        },
        ProposalType::Proposal => {
            if user.staked_amount < 100 { // Example minimum stake for proposals
                return Err(ProgramError::InsufficientFunds);
            }
        }
    }
    
    // Ensure vote weight is not more than staked amount
    if vote_weight > user.staked_amount {
        return Err(ProgramError::InsufficientFunds);
    }
    
    // Record the vote
    proposal.votes[option_index as usize] += vote_weight;
    proposal.total_votes += vote_weight;
    
    // Update user voting history
    user.voting_history.push(VoteRecord {
        proposal_id,
        option_index,
        vote_weight,
        timestamp: current_time,
    });
    
    // Save updated data using borsh::to_writer
    borsh::to_writer(&mut &mut proposal_account.data.borrow_mut()[..], &proposal)
        .map_err(|_| ProgramError::AccountDataTooSmall)?;
    
    borsh::to_writer(&mut &mut user_account.data.borrow_mut()[..], &user)
        .map_err(|_| ProgramError::AccountDataTooSmall)?;
    
    msg!("Vote recorded for proposal {}, option {}", proposal_id, option_index);
    Ok(())
}

// Stake tokens
fn process_stake(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    amount: u64,
) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();
    
    // Get accounts
    let user_account = next_account_info(accounts_iter)?;
    let user_token_account = next_account_info(accounts_iter)?;
    let stake_account = next_account_info(accounts_iter)?;
    let user_owner = next_account_info(accounts_iter)?;
    let token_program = next_account_info(accounts_iter)?;
    
    // Ensure user owner signed the transaction
    if !user_owner.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }
    
    // Load user data
    let mut user = if user_account.data_is_empty() {
        User {
            initialized: true,
            wallet: *user_owner.key,
            staked_amount: 0,
            voting_history: Vec::new(),
            rewards_earned: 0,
            last_claim_time: Clock::get()?.unix_timestamp,
        }
    } else {
        let mut user_data = user_account.data.borrow();
        BorshDeserialize::deserialize(&mut &user_data[..])
            .map_err(|_| ProgramError::InvalidAccountData)?
    };
    
    // Implement token transfer logic (simplified for brevity)
    // In a real implementation, you would use SPL token instructions to transfer tokens
    
    // Update user staked amount
    user.staked_amount += amount;
    
    // Save updated user data using borsh::to_writer
    borsh::to_writer(&mut &mut user_account.data.borrow_mut()[..], &user)
        .map_err(|_| ProgramError::AccountDataTooSmall)?;
    
    msg!("Staked {} tokens", amount);
    Ok(())
}

// Unstake tokens
fn process_unstake(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    amount: u64,
) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();
    
    // Get accounts
    let user_account = next_account_info(accounts_iter)?;
    let user_token_account = next_account_info(accounts_iter)?;
    let stake_account = next_account_info(accounts_iter)?;
    let user_owner = next_account_info(accounts_iter)?;
    let token_program = next_account_info(accounts_iter)?;
    
    // Ensure user owner signed the transaction
    if !user_owner.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }
    
    // Load user data
    let mut user_data = user_account.data.borrow();
    let mut user: User = BorshDeserialize::deserialize(&mut &user_data[..])
        .map_err(|_| ProgramError::InvalidAccountData)?;
    drop(user_data);
    
    // Ensure user is initialized
    if !user.initialized {
        return Err(ProgramError::UninitializedAccount);
    }
    
    // Ensure user owner matches
    if user.wallet != *user_owner.key {
        return Err(ProgramError::InvalidAccountData);
    }
    
    // Ensure user has enough staked tokens
    if user.staked_amount < amount {
        return Err(ProgramError::InsufficientFunds);
    }
    
    // Implement token transfer logic (simplified for brevity)
    // In a real implementation, you would use SPL token instructions to transfer tokens
    
    // Update user staked amount
    user.staked_amount -= amount;
    
    // Save updated user data using borsh::to_writer
    borsh::to_writer(&mut &mut user_account.data.borrow_mut()[..], &user)
        .map_err(|_| ProgramError::AccountDataTooSmall)?;
    
    msg!("Unstaked {} tokens", amount);
    Ok(())
}

// Claim rewards
fn process_claim_rewards(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();
    
    // Get accounts
    let user_account = next_account_info(accounts_iter)?;
    let user_token_account = next_account_info(accounts_iter)?;
    let rewards_account = next_account_info(accounts_iter)?;
    let user_owner = next_account_info(accounts_iter)?;
    let token_program = next_account_info(accounts_iter)?;
    
    // Ensure user owner signed the transaction
    if !user_owner.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }
    
    // Load user data
    let mut user_data = user_account.data.borrow();
    let mut user: User = BorshDeserialize::deserialize(&mut &user_data[..])
        .map_err(|_| ProgramError::InvalidAccountData)?;
    drop(user_data);
    
    // Ensure user is initialized
    if !user.initialized {
        return Err(ProgramError::UninitializedAccount);
    }
    
    // Ensure user owner matches
    if user.wallet != *user_owner.key {
        return Err(ProgramError::InvalidAccountData);
    }
    
    // Calculate rewards based on time and staked amount
    let current_time = Clock::get()?.unix_timestamp;
    let time_staked = current_time - user.last_claim_time;
    
    // Simple reward calculation: 1 token per day per 100 staked
    let daily_rate = user.staked_amount / 100;
    let seconds_in_day = 86400;
    let rewards = daily_rate * (time_staked as u64) / seconds_in_day;
    
    // Transfer rewards (simplified for brevity)
    // In a real implementation, you would use SPL token instructions
    
    // Update user data
    user.rewards_earned += rewards;
    user.last_claim_time = current_time;
    
    // Save updated user data using borsh::to_writer
    borsh::to_writer(&mut &mut user_account.data.borrow_mut()[..], &user)
        .map_err(|_| ProgramError::AccountDataTooSmall)?;
    
    msg!("Claimed {} rewards", rewards);
    Ok(())
}