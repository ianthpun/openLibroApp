import { PrivyClient } from '@privy-io/react-auth';
import { supabase } from './supabase';

// Function to create a JWT for Supabase from Privy user
export const createSupabaseJWT = async (privyUser: any) => {
  try {
    // Get the user's wallet address or email
    const identifier = privyUser.wallet?.address || privyUser.email?.address;
    
    if (!identifier) {
      throw new Error('No valid identifier found for user');
    }
    
    // Create a custom JWT claim for Supabase
    const { data, error } = await supabase.functions.invoke('create-jwt', {
      body: { 
        user_id: privyUser.id,
        identifier
      }
    });
    
    if (error) throw error;
    
    return data.token;
  } catch (error) {
    console.error('Error creating Supabase JWT:', error);
    throw error;
  }
};

// Function to link Privy user with Supabase
export const linkPrivyWithSupabase = async (privyUser: any) => {
  try {
    if (!privyUser) return false;
    
    console.log('Linking Privy user with Supabase:', privyUser.id);
    
    // First check if user exists in Supabase
    try {
      const { data: existingUsers, error: checkError } = await supabase
        .from('users')
        .select('id, privy_id')
        .eq('privy_id', privyUser.id);
      
      if (checkError) {
        console.error('Error checking for existing user:', checkError);
        // Continue anyway to try insertion
      }
      
      // If user exists, return true
      if (existingUsers && existingUsers.length > 0) {
        console.log('User already exists:', existingUsers[0]);
        return true;
      }
      
      // If user doesn't exist, create them
      console.log('User does not exist, creating new user');
      
      const { data, error: insertError } = await supabase
        .from('users')
        .insert({
          privy_id: privyUser.id,
          email: privyUser.email?.address || null,
          wallet_address: privyUser.wallet?.address || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select();
      
      if (insertError) {
        console.error('Error inserting user:', insertError);
        // If we get a duplicate key error, just continue
        if (insertError.code === '23505') {
          console.log('User already exists (duplicate key), skipping insert');
          return true;
        }
        // Don't throw, just return false to indicate failure
        return false;
      }
      
      console.log('Created new user:', data);
      return true;
    } catch (err) {
      console.error('Exception during user check/insert:', err);
      return false;
    }
  } catch (error) {
    console.error('Error linking Privy with Supabase:', error);
    // Don't throw the error, just return false to indicate failure
    return false;
  }
};

// Initialize Privy client
export const privyClient = new PrivyClient({
  // This would be your actual Privy App ID
  appId: import.meta.env.VITE_PRIVY_APP_ID || 'placeholder-app-id',
});