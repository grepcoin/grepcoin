import {
  Staked as StakedEvent,
  Unstaked as UnstakedEvent,
  RewardsClaimed as RewardsClaimedEvent
} from '../generated/GrepStakingPool/GrepStakingPool';
import { StakePosition, GlobalStats } from '../generated/schema';
import { BigInt } from '@graphprotocol/graph-ts';

const GLOBAL_STATS_ID = 'global';

export function handleStaked(event: StakedEvent): void {
  let stakeId = event.params.user.toHex();
  let stake = StakePosition.load(stakeId);

  if (stake == null) {
    stake = new StakePosition(stakeId);
    stake.user = event.params.user;
    stake.amount = BigInt.fromI32(0);
    stake.tier = 0;
    stake.stakedAt = event.block.timestamp;
    stake.lastClaimAt = event.block.timestamp;
  }

  stake.amount = stake.amount.plus(event.params.amount);
  stake.tier = event.params.tier;
  stake.stakedAt = event.block.timestamp;
  stake.save();

  // Update global staked amount
  let stats = getOrCreateGlobalStats();
  stats.totalStaked = stats.totalStaked.plus(event.params.amount);
  stats.save();
}

export function handleUnstaked(event: UnstakedEvent): void {
  let stakeId = event.params.user.toHex();
  let stake = StakePosition.load(stakeId);

  if (stake != null) {
    stake.amount = stake.amount.minus(event.params.amount);

    // If fully unstaked, set amount to zero
    if (stake.amount.le(BigInt.fromI32(0))) {
      stake.amount = BigInt.fromI32(0);
      stake.tier = 0;
    }

    stake.save();

    // Update global staked amount
    let stats = getOrCreateGlobalStats();
    stats.totalStaked = stats.totalStaked.minus(event.params.amount);
    stats.save();
  }
}

export function handleRewardsClaimed(event: RewardsClaimedEvent): void {
  let stakeId = event.params.user.toHex();
  let stake = StakePosition.load(stakeId);

  if (stake != null) {
    stake.lastClaimAt = event.block.timestamp;
    stake.save();
  }
}

function getOrCreateGlobalStats(): GlobalStats {
  let stats = GlobalStats.load(GLOBAL_STATS_ID);
  if (stats == null) {
    stats = new GlobalStats(GLOBAL_STATS_ID);
    stats.totalHolders = 0;
    stats.totalTransfers = 0;
    stats.totalStaked = BigInt.fromI32(0);
    stats.totalAchievementsMinted = 0;
    stats.save();
  }
  return stats as GlobalStats;
}
