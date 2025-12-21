// HTML Email Templates for GrepCoin
import {
  WelcomeEmailData,
  WeeklyDigestData,
  AchievementEmailData,
  RewardClaimData,
  TournamentEmailData,
  FriendRequestData,
} from './email'

// Base template with GrepCoin branding
function baseTemplate(content: string, preheader?: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GrepCoin</title>
  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;">${preheader}</div>` : ''}
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #0f172a;
      color: #f1f5f9;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #1e293b;
    }
    .header {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      padding: 30px 20px;
      text-align: center;
    }
    .logo {
      font-size: 32px;
      font-weight: bold;
      color: white;
      margin: 0;
    }
    .content {
      padding: 40px 30px;
    }
    .button {
      display: inline-block;
      padding: 14px 28px;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      margin: 20px 0;
    }
    .footer {
      background-color: #0f172a;
      padding: 30px;
      text-align: center;
      color: #94a3b8;
      font-size: 14px;
    }
    .stats-grid {
      display: table;
      width: 100%;
      margin: 20px 0;
    }
    .stat-item {
      display: table-cell;
      padding: 20px;
      text-align: center;
      background-color: #334155;
      border-radius: 8px;
    }
    .stat-value {
      font-size: 28px;
      font-weight: bold;
      color: #10b981;
    }
    .stat-label {
      font-size: 14px;
      color: #94a3b8;
      margin-top: 5px;
    }
    .achievement-card {
      background-color: #334155;
      border-radius: 12px;
      padding: 20px;
      margin: 15px 0;
      border-left: 4px solid #10b981;
    }
    .rarity-legendary { border-left-color: #fbbf24; }
    .rarity-epic { border-left-color: #a855f7; }
    .rarity-rare { border-left-color: #3b82f6; }
    .rarity-uncommon { border-left-color: #10b981; }
    .rarity-common { border-left-color: #64748b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="logo">GrepCoin</h1>
      <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9);">Play. Earn. Win.</p>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>GrepCoin - The Future of Play-to-Earn Gaming</p>
      <p style="margin-top: 15px;">
        <a href="https://grepcoin.io" style="color: #10b981; text-decoration: none;">Website</a> |
        <a href="https://twitter.com/grepcoin" style="color: #10b981; text-decoration: none;">Twitter</a> |
        <a href="https://discord.gg/grepcoin" style="color: #10b981; text-decoration: none;">Discord</a>
      </p>
      <p style="margin-top: 20px; font-size: 12px;">
        <a href="{{UNSUBSCRIBE_URL}}" style="color: #64748b; text-decoration: none;">Unsubscribe from these emails</a>
      </p>
    </div>
  </div>
</body>
</html>
  `.trim()
}

// Welcome Email
export function welcomeEmail(data: WelcomeEmailData): string {
  const content = `
    <h2 style="color: #10b981; margin-top: 0;">Welcome to GrepCoin, ${data.username || 'Player'}!</h2>
    <p style="font-size: 16px; line-height: 1.6; color: #e2e8f0;">
      You've just joined the most exciting play-to-earn gaming platform on the blockchain!
    </p>
    <p style="font-size: 16px; line-height: 1.6; color: #e2e8f0;">
      Your wallet <strong>${data.walletAddress.slice(0, 6)}...${data.walletAddress.slice(-4)}</strong>
      is now registered and ready to start earning GREP tokens.
    </p>

    <div style="background-color: #334155; padding: 20px; border-radius: 8px; margin: 25px 0;">
      <h3 style="margin-top: 0; color: #10b981;">Getting Started:</h3>
      <ul style="line-height: 1.8; color: #e2e8f0;">
        <li>Play arcade games to earn GREP tokens</li>
        <li>Complete daily challenges for bonus rewards</li>
        <li>Unlock achievements to boost your earnings</li>
        <li>Compete in tournaments for massive prizes</li>
        <li>Stake your GREP for even higher multipliers</li>
      </ul>
    </div>

    <div style="text-align: center;">
      <a href="https://grepcoin.io/games" class="button">Start Playing Now</a>
    </div>

    <p style="font-size: 14px; color: #94a3b8; margin-top: 30px;">
      Need help? Join our <a href="https://discord.gg/grepcoin" style="color: #10b981;">Discord community</a>
      or check out our <a href="https://grepcoin.io/docs" style="color: #10b981;">documentation</a>.
    </p>
  `
  return baseTemplate(content, 'Start earning GREP tokens today!')
}

// Weekly Digest Email
export function weeklyDigestEmail(data: WeeklyDigestData): string {
  const content = `
    <h2 style="color: #10b981; margin-top: 0;">Your Weekly Report, ${data.username || 'Player'}!</h2>
    <p style="font-size: 16px; line-height: 1.6; color: #e2e8f0;">
      Here's what you accomplished this week:
    </p>

    <table class="stats-grid" cellpadding="10" cellspacing="10">
      <tr>
        <td class="stat-item">
          <div class="stat-value">${data.stats.grepEarned.toLocaleString()}</div>
          <div class="stat-label">GREP Earned</div>
        </td>
        <td width="10"></td>
        <td class="stat-item">
          <div class="stat-value">${data.stats.gamesPlayed}</div>
          <div class="stat-label">Games Played</div>
        </td>
      </tr>
      <tr height="10"></tr>
      <tr>
        <td class="stat-item">
          <div class="stat-value">${data.stats.bestStreak}</div>
          <div class="stat-label">Best Streak</div>
        </td>
        <td width="10"></td>
        <td class="stat-item">
          <div class="stat-value">#${data.stats.rank}</div>
          <div class="stat-label">Leaderboard Rank</div>
        </td>
      </tr>
    </table>

    ${data.achievements.length > 0 ? `
      <h3 style="color: #10b981; margin-top: 40px;">New Achievements Unlocked:</h3>
      ${data.achievements.map(achievement => `
        <div class="achievement-card">
          <div style="display: table; width: 100%;">
            <div style="display: table-cell; width: 50px; font-size: 32px;">${achievement.icon}</div>
            <div style="display: table-cell; vertical-align: middle; padding-left: 15px;">
              <strong style="font-size: 18px; color: #f1f5f9;">${achievement.name}</strong>
              <div style="color: #10b981; margin-top: 5px; font-weight: 600;">+${achievement.reward} GREP</div>
            </div>
          </div>
        </div>
      `).join('')}
    ` : ''}

    <div style="background-color: #334155; padding: 25px; border-radius: 8px; margin: 30px 0; text-align: center;">
      <h3 style="margin-top: 0; color: #f1f5f9;">Total Rewards</h3>
      <div style="font-size: 36px; font-weight: bold; color: #10b981; margin: 15px 0;">
        ${data.rewards.totalEarned.toLocaleString()} GREP
      </div>
      ${data.rewards.availableToClaim > 0 ? `
        <p style="color: #e2e8f0; margin: 10px 0;">
          <strong>${data.rewards.availableToClaim.toLocaleString()} GREP</strong> available to claim
        </p>
        <a href="https://grepcoin.io/rewards" class="button">Claim Rewards</a>
      ` : ''}
    </div>

    <p style="font-size: 16px; text-align: center; color: #e2e8f0;">
      Keep up the great work! See you in the games.
    </p>
  `
  return baseTemplate(content, `You earned ${data.stats.grepEarned} GREP this week!`)
}

// Achievement Unlocked Email
export function achievementEmail(data: AchievementEmailData): string {
  const content = `
    <div style="text-align: center;">
      <div style="font-size: 64px; margin: 20px 0;">${data.achievement.icon}</div>
      <h2 style="color: #10b981; margin: 20px 0;">Achievement Unlocked!</h2>
    </div>

    <div class="achievement-card rarity-${data.achievement.rarity.toLowerCase()}">
      <h3 style="margin-top: 0; color: #f1f5f9; font-size: 24px;">${data.achievement.name}</h3>
      <p style="color: #e2e8f0; font-size: 16px; line-height: 1.6; margin: 15px 0;">
        ${data.achievement.description}
      </p>
      <div style="margin-top: 20px;">
        <span style="display: inline-block; padding: 8px 16px; background-color: rgba(16, 185, 129, 0.2);
                     border-radius: 20px; color: #10b981; font-weight: 600; text-transform: uppercase; font-size: 12px;">
          ${data.achievement.rarity}
        </span>
      </div>
    </div>

    <div style="background-color: #334155; padding: 25px; border-radius: 8px; margin: 30px 0; text-align: center;">
      <h3 style="margin-top: 0; color: #f1f5f9;">Reward Earned</h3>
      <div style="font-size: 42px; font-weight: bold; color: #10b981; margin: 15px 0;">
        +${data.achievement.reward.toLocaleString()} GREP
      </div>
    </div>

    <div style="text-align: center;">
      <a href="https://grepcoin.io/achievements" class="button">View All Achievements</a>
    </div>

    <p style="font-size: 14px; text-align: center; color: #94a3b8; margin-top: 30px;">
      Congratulations, ${data.username || 'Player'}! Keep playing to unlock more achievements.
    </p>
  `
  return baseTemplate(content, `You unlocked: ${data.achievement.name}!`)
}

// Reward Claim Email
export function rewardClaimEmail(data: RewardClaimData): string {
  const content = `
    <div style="text-align: center;">
      <div style="font-size: 64px; margin: 20px 0;">💰</div>
      <h2 style="color: #10b981; margin: 20px 0;">Rewards Ready to Claim!</h2>
    </div>

    <p style="font-size: 16px; line-height: 1.6; color: #e2e8f0; text-align: center;">
      Hey ${data.username || 'Player'}, you have GREP tokens waiting for you!
    </p>

    <div style="background-color: #334155; padding: 30px; border-radius: 12px; margin: 30px 0; text-align: center;">
      <div style="color: #94a3b8; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px;">
        Available Balance
      </div>
      <div style="font-size: 48px; font-weight: bold; color: #10b981; margin: 15px 0;">
        ${data.amount.toLocaleString()} GREP
      </div>
      <p style="color: #e2e8f0; margin: 20px 0;">
        These rewards are ready to be claimed and added to your wallet.
      </p>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.claimUrl}" class="button" style="font-size: 18px; padding: 16px 32px;">
        Claim Your GREP Now
      </a>
    </div>

    <div style="background-color: rgba(16, 185, 129, 0.1); padding: 20px; border-radius: 8px;
                border-left: 4px solid #10b981; margin: 30px 0;">
      <p style="margin: 0; color: #e2e8f0; font-size: 14px;">
        <strong style="color: #10b981;">Pro Tip:</strong> Stake your GREP tokens to earn up to 5x multiplier
        on future game rewards!
      </p>
    </div>
  `
  return baseTemplate(content, `${data.amount} GREP ready to claim!`)
}

// Tournament Starting Email
export function tournamentEmail(data: TournamentEmailData): string {
  const startTime = new Date(data.tournament.startTime).toLocaleString()
  const endTime = new Date(data.tournament.endTime).toLocaleString()

  const content = `
    <div style="text-align: center;">
      <div style="font-size: 64px; margin: 20px 0;">🏆</div>
      <h2 style="color: #10b981; margin: 20px 0;">${data.tournament.name}</h2>
    </div>

    <p style="font-size: 18px; line-height: 1.6; color: #e2e8f0; text-align: center; font-weight: 500;">
      Get ready, ${data.username || 'Player'}! A tournament is about to begin!
    </p>

    <div style="background-color: #334155; padding: 30px; border-radius: 12px; margin: 30px 0;">
      <table style="width: 100%; color: #e2e8f0;" cellpadding="10">
        <tr>
          <td style="color: #94a3b8; font-size: 14px;">Game:</td>
          <td style="text-align: right; font-weight: 600; text-transform: uppercase;">${data.tournament.gameSlug}</td>
        </tr>
        <tr>
          <td style="color: #94a3b8; font-size: 14px;">Prize Pool:</td>
          <td style="text-align: right; font-weight: 600; color: #10b981; font-size: 18px;">
            ${data.tournament.prizePool.toLocaleString()} GREP
          </td>
        </tr>
        <tr>
          <td style="color: #94a3b8; font-size: 14px;">Entry Fee:</td>
          <td style="text-align: right; font-weight: 600;">
            ${data.tournament.entryFee > 0 ? `${data.tournament.entryFee.toLocaleString()} GREP` : 'FREE'}
          </td>
        </tr>
        <tr>
          <td style="color: #94a3b8; font-size: 14px;">Starts:</td>
          <td style="text-align: right; font-weight: 600;">${startTime}</td>
        </tr>
        <tr>
          <td style="color: #94a3b8; font-size: 14px;">Ends:</td>
          <td style="text-align: right; font-weight: 600;">${endTime}</td>
        </tr>
      </table>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="https://grepcoin.io/tournaments/${data.tournament.name}" class="button" style="font-size: 18px; padding: 16px 32px;">
        Join Tournament
      </a>
    </div>

    <div style="background-color: rgba(251, 191, 36, 0.1); padding: 20px; border-radius: 8px;
                border-left: 4px solid #fbbf24; margin: 30px 0;">
      <p style="margin: 0; color: #e2e8f0; font-size: 14px;">
        <strong style="color: #fbbf24;">Top Prize:</strong> The winner takes home a massive share of
        the ${data.tournament.prizePool.toLocaleString()} GREP prize pool!
      </p>
    </div>

    <p style="text-align: center; color: #94a3b8; font-size: 14px; margin-top: 30px;">
      Good luck and may the best player win!
    </p>
  `
  return baseTemplate(content, `Tournament starting: ${data.tournament.name}`)
}

// Friend Request Email
export function friendRequestEmail(data: FriendRequestData): string {
  const content = `
    <div style="text-align: center;">
      <div style="font-size: 64px; margin: 20px 0;">👋</div>
      <h2 style="color: #10b981; margin: 20px 0;">New Friend Request!</h2>
    </div>

    <p style="font-size: 16px; line-height: 1.6; color: #e2e8f0; text-align: center;">
      Hey ${data.username || 'Player'}!
    </p>

    <div style="background-color: #334155; padding: 30px; border-radius: 12px; margin: 30px 0; text-align: center;">
      <p style="color: #e2e8f0; font-size: 18px; margin: 0;">
        <strong style="color: #10b981; font-size: 24px;">${data.friendUsername}</strong>
      </p>
      <p style="color: #94a3b8; font-size: 14px; margin: 10px 0;">
        ${data.friendWallet.slice(0, 6)}...${data.friendWallet.slice(-4)}
      </p>
      <p style="color: #e2e8f0; font-size: 16px; margin-top: 20px;">
        wants to connect with you on GrepCoin!
      </p>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="https://grepcoin.io/friends" class="button" style="font-size: 18px; padding: 16px 32px;">
        View Friend Request
      </a>
    </div>

    <div style="background-color: rgba(16, 185, 129, 0.1); padding: 20px; border-radius: 8px;
                border-left: 4px solid #10b981; margin: 30px 0;">
      <p style="margin: 0; color: #e2e8f0; font-size: 14px;">
        <strong style="color: #10b981;">Connect & Compete:</strong> Add friends to compete on leaderboards,
        challenge each other, and earn bonus rewards!
      </p>
    </div>
  `
  return baseTemplate(content, `${data.friendUsername} wants to be your friend`)
}

// Email verification template
export function verificationEmail(username: string, token: string, email: string): string {
  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://grepcoin.io'}/api/email/verify?token=${token}&email=${encodeURIComponent(email)}`

  const content = `
    <h2 style="color: #10b981; margin-top: 0;">Verify Your Email</h2>
    <p style="font-size: 16px; line-height: 1.6; color: #e2e8f0;">
      Hey ${username || 'Player'}, please verify your email address to enable notifications for your GrepCoin account.
    </p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${verifyUrl}" class="button" style="font-size: 18px; padding: 16px 32px;">
        Verify Email Address
      </a>
    </div>

    <p style="font-size: 14px; color: #94a3b8; text-align: center; margin-top: 30px;">
      Or copy and paste this link into your browser:<br>
      <span style="color: #10b981; word-break: break-all;">${verifyUrl}</span>
    </p>

    <div style="background-color: rgba(251, 191, 36, 0.1); padding: 20px; border-radius: 8px;
                border-left: 4px solid #fbbf24; margin: 30px 0;">
      <p style="margin: 0; color: #e2e8f0; font-size: 14px;">
        This verification link will expire in 24 hours. If you didn't request this, you can safely ignore this email.
      </p>
    </div>
  `
  return baseTemplate(content, 'Verify your email address')
}
