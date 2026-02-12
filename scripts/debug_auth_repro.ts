
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const logFile = path.resolve(process.cwd(), 'debug_auth_direct.log');
const logStream = fs.createWriteStream(logFile, { flags: 'w' });

function log(message: string) {
    console.log(message);
    logStream.write(message + '\n');
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    log('Missing Supabase credentials in .env.local');
    process.exit(1);
}

log(`Connecting to Supabase: ${supabaseUrl}`);
const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuth() {
    log('--- Testing Auth Signup with Redirect (Dry Run) ---');
    const testEmail = `test_debug_redirect_${Date.now()}@example.com`;
    const testPassword = 'Password123!';
    const redirectUrl = 'http://localhost:5173/auth/callback';

    try {
        log(`Attempting signup for ${testEmail} with redirect ${redirectUrl}...`);
        const { data, error } = await supabase.auth.signUp({
            email: testEmail,
            password: testPassword,
            options: {
                emailRedirectTo: redirectUrl
            }
        });

        if (error) {
            log('Signup Failed: ' + error.message);
            log('Error Details: ' + JSON.stringify(error, null, 2));
            log('Status: ' + (error as any).status);
        } else {
            log('Signup API Call Successful!');
            log('User ID: ' + data.user?.id);
            log('Session: ' + (data.session ? 'Created (Auto-confirm enabled?)' : 'Null (Confirmation email sent?)'));
        }

    } catch (err: any) {
        log('Signup Exception: ' + err.message);
    }
}

testAuth();
