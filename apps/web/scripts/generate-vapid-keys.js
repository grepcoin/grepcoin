#!/usr/bin/env node

/**
 * Generate VAPID keys for Web Push notifications
 * Run: node scripts/generate-vapid-keys.js
 */

const webpush = require('web-push')

console.log('Generating VAPID keys for Web Push notifications...\n')

const vapidKeys = webpush.generateVAPIDKeys()

console.log('Public Key (add to .env as NEXT_PUBLIC_VAPID_PUBLIC_KEY):')
console.log(vapidKeys.publicKey)
console.log('\nPrivate Key (add to .env as VAPID_PRIVATE_KEY):')
console.log(vapidKeys.privateKey)
console.log('\nAdd these to your .env.local file:')
console.log('━'.repeat(80))
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY="${vapidKeys.publicKey}"`)
console.log(`VAPID_PRIVATE_KEY="${vapidKeys.privateKey}"`)
console.log(`VAPID_EMAIL="hello@greplabs.io"`)
console.log('━'.repeat(80))
console.log('\nIMPORTANT: Keep the private key secret! Do not commit to version control.')
