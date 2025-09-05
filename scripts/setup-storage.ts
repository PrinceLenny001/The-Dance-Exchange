import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function setupStorage() {
  try {
    console.log('Setting up Supabase storage...');
    
    // Create the costume-images bucket
    const { data, error } = await supabase.storage.createBucket('costume-images', {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      fileSizeLimit: 10485760, // 10MB
    });

    if (error) {
      if (error.message.includes('already exists')) {
        console.log('✓ Bucket "costume-images" already exists');
      } else {
        throw error;
      }
    } else {
      console.log('✓ Created bucket "costume-images"');
    }

    // Set up RLS policies for the bucket
    const { error: policyError } = await supabase.rpc('create_storage_policies');
    
    if (policyError) {
      console.log('Note: Could not create storage policies automatically. You may need to set them up manually in the Supabase dashboard.');
    } else {
      console.log('✓ Created storage policies');
    }

    console.log('✅ Storage setup complete!');
  } catch (error) {
    console.error('❌ Error setting up storage:', error);
  }
}

setupStorage();
