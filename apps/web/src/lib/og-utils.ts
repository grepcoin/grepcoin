/**
 * Utility functions for Open Graph image generation
 */

/**
 * Format a number with commas for better readability
 * @param num - The number to format
 * @returns Formatted number string (e.g., "1,234,567")
 */
export function formatNumber(num: number): string {
  if (isNaN(num)) return '0';

  // Handle large numbers with abbreviations
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(1) + 'B';
  }
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1) + 'M';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1) + 'K';
  }

  return num.toLocaleString();
}

/**
 * Get color code for achievement rarity
 * @param rarity - The rarity level (common, rare, epic, legendary)
 * @returns Hex color code
 */
export function getRarityColor(rarity: string): string {
  const rarityColors: Record<string, string> = {
    common: '#9ca3af',    // Gray
    rare: '#3b82f6',      // Blue
    epic: '#a855f7',      // Purple
    legendary: '#eab308', // Gold
  };

  return rarityColors[rarity.toLowerCase()] || rarityColors.common;
}

/**
 * Get color code for staking tier
 * @param tier - The tier name (Bronze, Silver, Gold, Platinum, Diamond)
 * @returns Hex color code
 */
export function getTierColor(tier: string): string {
  const tierColors: Record<string, string> = {
    bronze: '#cd7f32',    // Bronze
    silver: '#c0c0c0',    // Silver
    gold: '#ffd700',      // Gold
    platinum: '#e5e4e2',  // Platinum
    diamond: '#b9f2ff',   // Diamond
  };

  return tierColors[tier.toLowerCase()] || tierColors.bronze;
}

/**
 * Get gradient background based on type
 * @param type - The background type (default, profile, game, achievement)
 * @returns CSS gradient string
 */
export function getBackgroundGradient(type: string): string {
  const gradients: Record<string, string> = {
    default: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    profile: 'linear-gradient(135deg, #1a1a2e 0%, #0f172a 100%)',
    game: 'linear-gradient(135deg, #16213e 0%, #1e3a5f 100%)',
    achievement: 'linear-gradient(135deg, #1a1a2e 0%, #2d1b4e 100%)',
    leaderboard: 'linear-gradient(135deg, #1a1a2e 0%, #1f2937 100%)',
  };

  return gradients[type.toLowerCase()] || gradients.default;
}

/**
 * Truncate text to a maximum length with ellipsis
 * @param text - The text to truncate
 * @param maxLength - Maximum character length
 * @returns Truncated text
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Format date for display
 * @param date - Date string or Date object
 * @returns Formatted date string
 */
export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }

  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Get win rate color based on percentage
 * @param winRate - Win rate percentage (0-100)
 * @returns Hex color code
 */
export function getWinRateColor(winRate: number): string {
  if (winRate >= 70) return '#10b981'; // Green
  if (winRate >= 50) return '#fbbf24'; // Yellow
  if (winRate >= 30) return '#f97316'; // Orange
  return '#ef4444'; // Red
}

/**
 * Calculate position suffix (1st, 2nd, 3rd, etc.)
 * @param position - The position number
 * @returns Position with suffix (e.g., "1st", "2nd")
 */
export function getPositionSuffix(position: number): string {
  const j = position % 10;
  const k = position % 100;

  if (j === 1 && k !== 11) {
    return position + 'st';
  }
  if (j === 2 && k !== 12) {
    return position + 'nd';
  }
  if (j === 3 && k !== 13) {
    return position + 'rd';
  }
  return position + 'th';
}
