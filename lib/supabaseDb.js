import { supabase } from './supabase';

// Upload file to Supabase Storage
async function uploadFile(bucketName, file, folder = '') {
  if (!file || file.size === 0) return null;
  
  const fileExt = file.name.split('.').pop();
  const fileName = `${folder}${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });
  
  if (error) {
    console.error('Upload error:', error);
    return null;
  }
  
  const { data: publicUrlData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(fileName);
  
  return publicUrlData.publicUrl;
}

// Delete file from Supabase Storage
async function deleteFile(bucketName, fileUrl) {
  if (!fileUrl) return true;
  
  const fileName = fileUrl.split('/').pop();
  const { error } = await supabase.storage
    .from(bucketName)
    .remove([fileName]);
  
  if (error) {
    console.error('Delete error:', error);
    return false;
  }
  return true;
}

// Get all talents with realtime subscription
let talentsSubscription = null;
let talentsListeners = [];

export function subscribeToTalents(callback) {
  talentsListeners.push(callback);
  
  if (!talentsSubscription) {
    talentsSubscription = supabase
      .channel('talents-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'talents',
        },
        (payload) => {
          console.log('Realtime update:', payload);
          talentsListeners.forEach(listener => listener(payload));
        }
      )
      .subscribe();
  }
  
  return () => {
    talentsListeners = talentsListeners.filter(l => l !== callback);
    if (talentsListeners.length === 0 && talentsSubscription) {
      talentsSubscription.unsubscribe();
      talentsSubscription = null;
    }
  };
}

export const db = {
  talents: {
    // Get all talents
    getAll: async () => {
      const { data, error } = await supabase
        .from('talents')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    
    // Get single talent by ID
    getById: async (id) => {
      const { data, error } = await supabase
        .from('talents')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    
    // Create new talent with photo and CV
    create: async (talentData, photoFile, cvFile) => {
      // Upload photo to Supabase Storage
      let picUrl = null;
      if (photoFile && photoFile.size > 0) {
        picUrl = await uploadFile('candidate-photos', photoFile, 'photos/');
      }
      
      // Upload CV to Supabase Storage
      let cvUrl = null;
      if (cvFile && cvFile.size > 0) {
        cvUrl = await uploadFile('candidate-cvs', cvFile, 'cvs/');
      }
      
      // Calculate age from DOB
      let age = null;
      if (talentData.dob) {
        const birthDate = new Date(talentData.dob);
        const today = new Date();
        age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
      }
      
      // Insert into talents table
      const { data, error } = await supabase
        .from('talents')
        .insert([{
          name: talentData.name,
          age: age,
          dob: talentData.dob,
          gender: talentData.gender,
          job: talentData.job,
          country: talentData.country,
          religion: talentData.religion,
          salary: parseInt(talentData.salary) || 0,
          experience: talentData.experience,
          marital_status: talentData.maritalStatus,
          worker_type: talentData.workerType,
          pic_url: picUrl,
          cv_url: cvUrl,
          status: 'Available'
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    
    // Update existing talent
    update: async (id, talentData, photoFile, cvFile) => {
      const existing = await db.talents.getById(id);
      
      // Upload new photo if provided
      let picUrl = existing.pic_url;
      if (photoFile && photoFile.size > 0) {
        if (existing.pic_url) {
          await deleteFile('candidate-photos', existing.pic_url);
        }
        picUrl = await uploadFile('candidate-photos', photoFile, 'photos/');
      }
      
      // Upload new CV if provided
      let cvUrl = existing.cv_url;
      if (cvFile && cvFile.size > 0) {
        if (existing.cv_url) {
          await deleteFile('candidate-cvs', existing.cv_url);
        }
        cvUrl = await uploadFile('candidate-cvs', cvFile, 'cvs/');
      }
      
      // Calculate age from DOB
      let age = existing.age;
      if (talentData.dob) {
        const birthDate = new Date(talentData.dob);
        const today = new Date();
        age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
      }
      
      const { data, error } = await supabase
        .from('talents')
        .update({
          name: talentData.name || existing.name,
          age: age,
          dob: talentData.dob || existing.dob,
          gender: talentData.gender || existing.gender,
          job: talentData.job || existing.job,
          country: talentData.country || existing.country,
          religion: talentData.religion || existing.religion,
          salary: parseInt(talentData.salary) || existing.salary,
          experience: talentData.experience || existing.experience,
          marital_status: talentData.maritalStatus || existing.marital_status,
          worker_type: talentData.workerType || existing.worker_type,
          pic_url: picUrl,
          cv_url: cvUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    
    // Delete talent
    delete: async (id) => {
      const existing = await db.talents.getById(id);
      
      if (existing.pic_url) {
        await deleteFile('candidate-photos', existing.pic_url);
      }
      
      if (existing.cv_url) {
        await deleteFile('candidate-cvs', existing.cv_url);
      }
      
      const { error } = await supabase
        .from('talents')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    },
    
    // Update status (Hire)
    updateStatus: async (id, status) => {
      const { data, error } = await supabase
        .from('talents')
        .update({ 
          status: status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
  },
  
  users: {
    // Get all users
    getAll: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    
    // Create new user
    create: async (userData) => {
      const { data, error } = await supabase
        .from('users')
        .insert([{
          username: userData.username,
          password: userData.password,
          role: userData.role
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    
    // Delete user
    delete: async (id) => {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    }
  },
  
  leads: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data;
    },
    
    create: async (source, action) => {
      const { data, error } = await supabase
        .from('leads')
        .insert([{
          source: source,
          action: action,
          time: new Date().toLocaleTimeString()
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    
    clear: async () => {
      const { error } = await supabase
        .from('leads')
        .delete()
        .neq('id', 0);
      
      if (error) throw error;
      return true;
    }
  }
};