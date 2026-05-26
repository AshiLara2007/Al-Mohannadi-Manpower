// lib/db.js
import { supabase } from './supabase';

export const db = {
  talents: {
    // Get all talents
    findAll: async () => {
      const { data, error } = await supabase
        .from('talents')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    
    // Get talent by ID
    findById: async (id) => {
      const { data, error } = await supabase
        .from('talents')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    
    // Create new talent with photo and CV upload
    create: async (talentData, picFile, cvFile) => {
      let picUrl = null;
      let cvUrl = null;
      
      // Upload photo to Supabase Storage
      if (picFile && picFile.size > 0) {
        const picExt = picFile.name.split('.').pop();
        const picFileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${picExt}`;
        
        const { data: picData, error: picError } = await supabase.storage
          .from('candidate-photos')
          .upload(picFileName, picFile, {
            cacheControl: '3600',
            upsert: false
          });
        
        if (!picError && picData) {
          const { data: publicUrlData } = supabase.storage
            .from('candidate-photos')
            .getPublicUrl(picFileName);
          picUrl = publicUrlData.publicUrl;
        }
      }
      
      // Upload CV to Supabase Storage
      if (cvFile && cvFile.size > 0) {
        const cvExt = cvFile.name.split('.').pop();
        const cvFileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${cvExt}`;
        
        const { data: cvData, error: cvError } = await supabase.storage
          .from('candidate-cvs')
          .upload(cvFileName, cvFile, {
            cacheControl: '3600',
            upsert: false
          });
        
        if (!cvError && cvData) {
          const { data: publicUrlData } = supabase.storage
            .from('candidate-cvs')
            .getPublicUrl(cvFileName);
          cvUrl = publicUrlData.publicUrl;
        }
      }
      
      // Insert into talents table
      const { data, error } = await supabase
        .from('talents')
        .insert([{
          name: talentData.name,
          age: talentData.age,
          dob: talentData.dob,
          gender: talentData.gender,
          job: talentData.job,
          country: talentData.country,
          religion: talentData.religion,
          salary: talentData.salary,
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
    update: async (id, talentData, picFile, cvFile) => {
      let picUrl = null;
      let cvUrl = null;
      
      // Upload new photo if provided
      if (picFile && picFile.size > 0) {
        const picExt = picFile.name.split('.').pop();
        const picFileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${picExt}`;
        
        const { data: picData, error: picError } = await supabase.storage
          .from('candidate-photos')
          .upload(picFileName, picFile, {
            cacheControl: '3600',
            upsert: false
          });
        
        if (!picError && picData) {
          const { data: publicUrlData } = supabase.storage
            .from('candidate-photos')
            .getPublicUrl(picFileName);
          picUrl = publicUrlData.publicUrl;
        }
      }
      
      // Upload new CV if provided
      if (cvFile && cvFile.size > 0) {
        const cvExt = cvFile.name.split('.').pop();
        const cvFileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${cvExt}`;
        
        const { data: cvData, error: cvError } = await supabase.storage
          .from('candidate-cvs')
          .upload(cvFileName, cvFile, {
            cacheControl: '3600',
            upsert: false
          });
        
        if (!cvError && cvData) {
          const { data: publicUrlData } = supabase.storage
            .from('candidate-cvs')
            .getPublicUrl(cvFileName);
          cvUrl = publicUrlData.publicUrl;
        }
      }
      
      // Build update object
      const updateObj = {
        name: talentData.name,
        age: talentData.age,
        dob: talentData.dob,
        gender: talentData.gender,
        job: talentData.job,
        country: talentData.country,
        religion: talentData.religion,
        salary: talentData.salary,
        experience: talentData.experience,
        marital_status: talentData.maritalStatus,
        worker_type: talentData.workerType,
        updated_at: new Date().toISOString()
      };
      
      if (picUrl) updateObj.pic_url = picUrl;
      if (cvUrl) updateObj.cv_url = cvUrl;
      
      const { data, error } = await supabase
        .from('talents')
        .update(updateObj)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    
    // Delete talent
    delete: async (id) => {
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
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    
    // Clear all CVs
    clearAllCVs: async () => {
      const { data, error } = await supabase
        .from('talents')
        .update({ cv_url: null })
        .not('cv_url', 'is', null);
      
      if (error) throw error;
      return data?.length || 0;
    },
    
    // Filter talents
    filter: async (filters) => {
      let query = supabase.from('talents').select('*');
      
      if (filters.job && filters.job !== 'All') {
        query = query.eq('job', filters.job);
      }
      if (filters.country && filters.country !== 'All Countries') {
        query = query.eq('country', filters.country);
      }
      if (filters.workerType && filters.workerType !== 'All') {
        query = query.eq('worker_type', filters.workerType);
      }
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,country.ilike.%${filters.search}%,job.ilike.%${filters.search}%`);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  },
  
  leads: {
    // Get all leads
    findAll: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data;
    },
    
    // Create new lead
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
    
    // Clear all leads
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