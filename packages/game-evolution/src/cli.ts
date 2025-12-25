#!/usr/bin/env node

import * as fs from 'fs'
import * as path from 'path'
import { EvolutionPlanner } from './evolution-planner'

async function main() {
  const args = process.argv.slice(2)
  const analyzeOnly = args.includes('--analyze-only')
  const outputDir = args.find(a => a.startsWith('--output='))?.split('=')[1] || './evolution-plans'

  console.log('🚀 GrepCoin Game Evolution System\n')

  const planner = new EvolutionPlanner()

  try {
    const plan = await planner.createEvolutionPlan()

    if (analyzeOnly) {
      console.log('\n📊 Analysis Complete:\n')
      console.log(JSON.stringify(plan.metrics, null, 2))
      return
    }

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
