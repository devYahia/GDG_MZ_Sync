#!/usr/bin/env node

/**
 * Create a demo user for testing
 * Run with: node scripts/create-demo-user.js
 */

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing environment variables')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

async function createDemoUser() {
    // Create user with admin API (bypasses email verification)
    const { data: user, error: createError } = await supabase.auth.admin.createUser({
        email: 'demo@interna.com',
        password: 'demo123456',
        email_confirm: true,
        user_metadata: {
            full_name: 'Demo User',
            region: 'North America'
        }
    })

    if (createError) {
        console.error('Error creating user:', createError)
        return
    }

    console.log('✅ User created:', user.user.email)

    // Update profile to complete onboarding
    const { error: profileError } = await supabase
        .from('profiles')
        .update({
            field: 'frontend',
            experience_level: 'student',
            interests: ['System Design', 'API Development', 'Testing'],
            onboarding_completed: true
        })
        .eq('id', user.user.id)

    if (profileError) {
        console.error('Error updating profile:', profileError)
        return
    }

    console.log('✅ Profile completed')
    console.log('\n📧 Email: demo@interna.com')
    console.log('🔑 Password: demo123456')
}

createDemoUser()
