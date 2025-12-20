import { Transfer as TransferEvent } from '../generated/GrepToken/GrepToken';
import { Transfer, TokenHolder, GlobalStats } from '../generated/schema';
import { BigInt, Bytes } from '@graphprotocol/graph-ts';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const GLOBAL_STATS_ID = 'global';

export function handleTransfer(event: TransferEvent): void {
  // Create Transfer entity
  let transfer = new Transfer(
    event.transaction.hash.toHex() + '-' + event.logIndex.toString()
  );
  transfer.from = event.params.from;
  transfer.to = event.params.to;
  transfer.amount = event.params.value;
  transfer.timestamp = event.block.timestamp;
  transfer.blockNumber = event.block.number;
  transfer.transactionHash = event.transaction.hash;
  transfer.save();

  // Update sender's balance (if not mint)
  if (event.params.from.toHex() != ZERO_ADDRESS) {
    let fromHolder = TokenHolder.load(event.params.from.toHex());
    if (fromHolder != null) {
      fromHolder.balance = fromHolder.balance.minus(event.params.value);
      fromHolder.transferCount = fromHolder.transferCount + 1;
      fromHolder.lastTransferAt = event.block.timestamp;
      fromHolder.save();
    }
  }

  // Update recipient's balance (if not burn)
  if (event.params.to.toHex() != ZERO_ADDRESS) {
    let toHolder = TokenHolder.load(event.params.to.toHex());
    if (toHolder == null) {
      toHolder = new TokenHolder(event.params.to.toHex());
      toHolder.address = event.params.to;
      toHolder.balance = BigInt.fromI32(0);
      toHolder.transferCount = 0;
      toHolder.firstTransferAt = event.block.timestamp;

      // Update global holder count
      let stats = getOrCreateGlobalStats();
      stats.totalHolders = stats.totalHolders + 1;
      stats.save();
    }
    toHolder.balance = toHolder.balance.plus(event.params.value);
    toHolder.transferCount = toHolder.transferCount + 1;
    toHolder.lastTransferAt = event.block.timestamp;
    toHolder.save();
  }

  // Update global transfer count
  let stats = getOrCreateGlobalStats();
  stats.totalTransfers = stats.totalTransfers + 1;
  stats.save();
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
