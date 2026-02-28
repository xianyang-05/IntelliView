import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

async function seedDemoUser() {
    const email = 'alex.chan@openhire.com'
    const password = 'password123'
    const name = 'Alex Chan'

    console.log(`Setting up demo user: ${email}`)

    // Check if user exists in Supabase Auth
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers()

    if (listError) {
        console.error('Error listing users:', listError)
        return
    }

    const existingUser = users.find(u => u.email === email)

    if (existingUser) {
        console.log('User already exists in Auth. Updating password...')
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
            password: password,
        })
        if (updateError) {
            console.error('Error updating password:', updateError)
        } else {
            console.log('Password updated successfully.')
        }
    } else {
        console.log('Creating user in Auth...')
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name: name }
        })

        if (createError) {
            console.error('Error creating user:', createError)
            return
        }

        console.log('User created successfully with ID:', newUser.user?.id)

        // Ensure user exists in public.users
        if (newUser.user) {
            const { error: upsertError } = await supabaseAdmin
                .from('users')
                .upsert({
                    id: newUser.user.id,
                    email: email,
                    full_name: name,
                    role: 'employee',
                })

            if (upsertError) {
                console.error('Error upserting into public.users:', upsertError)
            } else {
                console.log('public.users record created.')
            }
        }
    }

    console.log(`\nDemo credentials:\n  Email: ${email}\n  Password: ${password}`)
}

seedDemoUser().catch(console.error)
