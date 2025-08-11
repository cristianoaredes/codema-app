import { nodeSupabase } from '../../integrations/supabase/node-client';
import { sampleUsers, sampleReports, sampleDocuments, sampleMeetings, sampleResolutions, sampleCouncilMembers } from './sampleData.js';
import { logError } from './errorHandling';

// Helper function to wait for a specified time
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const seedSampleData = async () => {
  try {
    console.log('Starting sample data seeding...');
    
    // Clear existing data in correct order to avoid foreign key constraints
    console.log('Clearing existing data...');
    await nodeSupabase.from('resolucoes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await nodeSupabase.from('reunioes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await nodeSupabase.from('documentos').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await nodeSupabase.from('reports').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await nodeSupabase.from('profiles').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await nodeSupabase.from('conselheiros').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    // Small delay to ensure deletions are processed
    await wait(1000);
    
    // Create auth users first using Supabase Admin API
    console.log('Creating auth users...');
    
    const authUsersToCreate = sampleUsers.map(user => ({
      id: user.id,
      email: user.email || `user-${user.id}@codema.com`,
      password: 'TempPassword123!', // Temporary password for seeding
      email_confirm: true, // Skip email confirmation for seeding
      user_metadata: {
        full_name: user.full_name,
        role: user.role
      }
    }));
    
    // Create auth users using admin API
    const createdAuthUsers = [];
    for (const authUser of authUsersToCreate) {
      try {
        const { data: authData, error: authError } = await nodeSupabase.auth.admin.createUser({
          id: authUser.id,
          email: authUser.email,
          password: authUser.password,
          email_confirm: authUser.email_confirm,
          user_metadata: authUser.user_metadata
        });
        
        if (authError) {
          console.warn(`Warning creating auth user ${authUser.email}:`, authError.message);
          // Continue with other users even if one fails
        } else {
          console.log(`✅ Created auth user: ${authUser.email}`);
          createdAuthUsers.push(authData.user);
        }
      } catch (error) {
        console.warn(`Warning creating auth user ${authUser.email}:`, error);
        // Continue with other users even if one fails
      }
    }
    
    console.log(`Created ${createdAuthUsers.length} auth users`);
    
    // Small delay to ensure auth users are fully created
    await wait(2000);
    
    // Now insert profiles
    console.log('Inserting sample profiles...');
    const { data: usersData, error: usersError } = await nodeSupabase
      .from('profiles')
      .insert(sampleUsers)
      .select();
    
    if (usersError) {
      console.error('Error inserting profiles:', usersError);
      logError(usersError, 'SEED_PROFILES');
      return { success: false, error: usersError };
    }
    
    console.log(`Inserted ${usersData?.length || 0} users`);
    
    // Map user IDs for foreign key references
    const adminUser = usersData?.find(user => user.email === 'admin@codema.com');
    const presidentUser = usersData?.find(user => user.email === 'president@codema.com');
    const secretaryUser = usersData?.find(user => user.email === 'secretary@codema.com');
    const councilMember1 = usersData?.find(user => user.email === 'council1@codema.com');
    const councilMember2 = usersData?.find(user => user.email === 'council2@codema.com');
    
    // Update sample data with proper foreign key references
    const updatedReports = sampleReports.map(report => ({
      ...report,
      user_id: adminUser?.id || ''
    }));
    
    const updatedDocuments = sampleDocuments.map(document => ({
      ...document,
      autor_id: adminUser?.id || ''
    }));
    
    const updatedMeetings = sampleMeetings.map(meeting => ({
      ...meeting,
      secretario_id: secretaryUser?.id || ''
    }));
    
    const updatedResolutions = sampleResolutions.map(resolution => ({
      ...resolution,
      created_by: presidentUser?.id || ''
    }));
    
    const updatedCouncilMembers = sampleCouncilMembers.map((member, index) => ({
      ...member,
      profile_id: index === 0 ? councilMember1?.id : councilMember2?.id || ''
    }));
    
    // Insert sample reports
    console.log('Inserting sample reports...');
    const { data: reportsData, error: reportsError } = await nodeSupabase
      .from('reports')
      .insert(updatedReports)
      .select();
    
    if (reportsError) {
      console.error('Error inserting reports:', reportsError);
      logError(reportsError, 'SEED_REPORTS');
      return { success: false, error: reportsError };
    }
    
    console.log(`Inserted ${reportsData?.length || 0} reports`);
    
    // Insert sample documents
    console.log('Inserting sample documents...');
    const { data: documentsData, error: documentsError } = await nodeSupabase
      .from('documentos')
      .insert(updatedDocuments)
      .select();
    
    if (documentsError) {
      console.error('Error inserting documents:', documentsError);
      logError(documentsError, 'SEED_DOCUMENTS');
      return { success: false, error: documentsError };
    }
    
    console.log(`Inserted ${documentsData?.length || 0} documents`);
    
    // Insert sample meetings
    console.log('Inserting sample meetings...');
    const { data: meetingsData, error: meetingsError } = await nodeSupabase
      .from('reunioes')
      .insert(updatedMeetings)
      .select();
    
    if (meetingsError) {
      console.error('Error inserting meetings:', meetingsError);
      logError(meetingsError, 'SEED_MEETINGS');
      return { success: false, error: meetingsError };
    }
    
    console.log(`Inserted ${meetingsData?.length || 0} meetings`);
    
    // Insert sample resolutions
    console.log('Inserting sample resolutions...');
    const { data: resolutionsData, error: resolutionsError } = await nodeSupabase
      .from('resolucoes')
      .insert(updatedResolutions)
      .select();
    
    if (resolutionsError) {
      console.error('Error inserting resolutions:', resolutionsError);
      logError(resolutionsError, 'SEED_RESOLUTIONS');
      return { success: false, error: resolutionsError };
    }
    
    console.log(`Inserted ${resolutionsData?.length || 0} resolutions`);
    
    // Insert sample council members
    console.log('Inserting sample council members...');
    const { data: councilMembersData, error: councilMembersError } = await nodeSupabase
      .from('conselheiros')
      .insert(updatedCouncilMembers)
      .select();
    
    if (councilMembersError) {
      console.error('Error inserting council members:', councilMembersError);
      logError(councilMembersError, 'SEED_COUNCIL_MEMBERS');
      return { success: false, error: councilMembersError };
    }
    
    console.log(`Inserted ${councilMembersData?.length || 0} council members`);
    
    console.log('Sample data seeding completed successfully!');
    return { success: true, data: { 
      users: usersData?.length || 0,
      reports: reportsData?.length || 0,
      documents: documentsData?.length || 0,
      meetings: meetingsData?.length || 0,
      resolutions: resolutionsData?.length || 0,
      councilMembers: councilMembersData?.length || 0
    }};
  } catch (error) {
    console.error('Unexpected error during seeding:', error);
    logError(error, 'SEED_UNEXPECTED_ERROR');
    return { success: false, error: error instanceof Error ? error : new Error('Unknown error') };
  }
};

// Clear all sample data function
export const clearSampleData = async () => {
  try {
    console.log('Starting sample data clearing...');
    
    // Clear existing data in correct order to avoid foreign key constraints
    console.log('Clearing existing data...');
    await nodeSupabase.from('resolucoes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await nodeSupabase.from('reunioes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await nodeSupabase.from('documentos').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await nodeSupabase.from('reports').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await nodeSupabase.from('profiles').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await nodeSupabase.from('conselheiros').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    // Also delete auth users if they exist
    console.log('Clearing auth users...');
    const authUsersToDelete = sampleUsers.map(user => user.id);
    
    for (const userId of authUsersToDelete) {
      try {
        const { error: deleteError } = await nodeSupabase.auth.admin.deleteUser(userId);
        if (deleteError) {
          console.warn(`Warning deleting auth user ${userId}:`, deleteError.message);
        } else {
          console.log(`✅ Deleted auth user: ${userId}`);
        }
      } catch (error) {
        console.warn(`Warning deleting auth user ${userId}:`, error);
      }
    }
    
    console.log('Sample data clearing completed successfully!');
    return { success: true };
  } catch (error) {
    console.error('Unexpected error during clearing:', error);
    logError(error, 'CLEAR_UNEXPECTED_ERROR');
    return { success: false, error: error instanceof Error ? error : new Error('Unknown error') };
  }
};

// SampleDataSeeder object that matches the expected interface in DataSeeder.tsx
export const SampleDataSeeder = {
  async seedAllData() {
    const result = await seedSampleData();
    if (!result.success) {
      throw new Error(result.error?.message || 'Failed to seed data');
    }
    return result;
  },
  
  async clearAllData() {
    const result = await clearSampleData();
    if (!result.success) {
      throw new Error(result.error?.message || 'Failed to clear data');
    }
    return result;
  }
};
