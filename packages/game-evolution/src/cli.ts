#!/usr/bin/env node

import * as fs from 'fs'
import * as path from 'path'
import { EvolutionPlanner } from './evolution-planner'
import { GameMetricsAnalyzer } from './analyzers'

async function main() {
  const args = process.argv.slice(2)
  const analyzeOnly = args.includes('--analyze-only')
  const outputDir = args.find(a => a.startsWith('--output='))?.split('=')[1] || './evolution-plans'

  console.log('🚀 GrepCoin Game Evolution System\n')

  // Analysis-only mode - just fetch metrics, no AI generation
  if (analyzeOnly) {
    console.log('📊 Analyzing game metrics...\n')
    const analyzer = new GameMetricsAnalyzer()
    try {
      const metrics = await analyzer.analyzeAllGames()
      await analyzer.disconnect()

      console.log('='.repeat(60))
      console.log('GAME METRICS ANALYSIS')
      console.log('='.repeat(60))
      console.log()

      for (const m of metrics) {
        console.log(`🎮 ${m.gameName} (${m.gameSlug})`)
        console.log(`   Plays: ${m.totalPlays} | Players: ${m.uniquePlayers}`)
        console.log(`   Avg Score: ${m.avgScore} | Avg Duration: ${m.avgDuration}s`)
        console.log(`   Completion: ${m.completionRate}% | Trend: ${m.recentTrends.trend}`)
        console.log(`   Difficulty: Easy ${m.difficultyDistribution.easy}% | Med ${m.difficultyDistribution.medium}% | Hard ${m.difficultyDistribution.hard}% | Expert ${m.difficultyDistribution.expert}%`)
        console.log()
      }

      console.log('='.repeat(60))
      console.log(`Total games analyzed: ${metrics.length}`)
      return
    } catch (error) {
      console.error('❌ Analysis failed:', error)
      process.exit(1)
    }
  }

  const planner = new EvolutionPlanner()

  try {
    const plan = await planner.createEvolutionPlan()

    // Create output directory
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    // Write plan files
    const planPath = path.join(outputDir, `${plan.id}.json`)
    const mdPath = path.join(outputDir, `${plan.id}.md`)

    fs.writeFileSync(planPath, JSON.stringify(plan, null, 2))
    console.log(`\n✅ Plan saved: ${planPath}`)

    const markdown = planner.formatPlanAsMarkdown(plan)
    fs.writeFileSync(mdPath, markdown)
    console.log(`📝 Markdown: ${mdPath}`)

    console.log('\n' + '='.repeat(60))
    console.log('EVOLUTION PLAN SUMMARY')
    console.log('='.repeat(60))
    console.log(`\n${plan.summary}\n`)
    console.log(`Impact: ${plan.estimatedImpact}\n`)
    console.log(`Suggestions: ${plan.suggestions.length} new content items`)
    console.log(`Games affected: ${new Set(plan.suggestions.map(s => s.game)).size}`)
    console.log('\n' + '='.repeat(60))

  } catch (error) {
    console.error('❌ Evolution failed:', error)
    process.exit(1)
  }
}

main()
