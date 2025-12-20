import { Transfer as TransferEvent } from '../generated/GrepAchievements/GrepAchievements';
import { AchievementMint, GlobalStats } from '../generated/schema';
import { BigInt } from '@graphprotocol/graph-ts';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const GLOBAL_STATS_ID = 'global';

export function handleAchievementMint(event: TransferEvent): void {
  // Only track mints (from zero address)
  if (event.params.from.toHex() == ZERO_ADDRESS) {
    let mintId = event.transaction.hash.toHex() + '-' + event.logIndex.toString();
    let mint = new AchievementMint(mintId);

    mint.user = event.params.to;
    mint.achievementId = event.params.tokenId;
    mint.timestamp = event.block.timestamp;
    mint.transactionHash = event.transaction.hash;
    mint.save();

    // Update global achievement count
    let stats = getOrCreateGlobalStats();
    stats.totalAchievementsMinted = stats.totalAchievementsMinted + 1;
    stats.save();
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
