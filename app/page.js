'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import emailjs from '@emailjs/browser';

export default function Home() {
  // State variables
  const [talents, setTalents] = useState([]);
  const [users, setUsers] = useState([]);
  const [leads, setLeads] = useState([]);
  const [selectedActiveCategory, setSelectedActiveCategory] = useState('All');
  const [selectedCountryFilter, setSelectedCountryFilter] = useState('All Countries');
  const [currentTheme, setCurrentTheme] = useState('light');
  const [currentLanguage, setCurrentLanguage] = useState('EN');
  const [currentAdminUser, setCurrentAdminUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [adminSearchQuery, setAdminSearchQuery] = useState('');
  const [toasts, setToasts] = useState([]);
  const [editTalent, setEditTalent] = useState(null);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [adminActive, setAdminActive] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [languageSelected, setLanguageSelected] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReturnedOnly, setShowReturnedOnly] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  // CV Popup state
  const [cvPopupOpen, setCvPopupOpen] = useState(false);
  const [cvPopupUrl, setCvPopupUrl] = useState('');
  const [cvPopupName, setCvPopupName] = useState('');
  
  // File states
  const [selectedPhotoFile, setSelectedPhotoFile] = useState(null);
  const [selectedCvFile, setSelectedCvFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [cvFileName, setCvFileName] = useState('');
  
  // Add User Modal states
  const [addUserModalOpen, setAddUserModalOpen] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('Normal User');

  // Form refs
  let nameRef, dobRef, genderRef, jobRef, countryRef, religionRef, salaryRef, experienceRef, maritalStatusRef, workerTypeRef, picRef, cvRef;

  // Users database for login
  const usersDatabase = [
    { username: "lara", password: "1978", role: "Super User" },
    { username: "admin", password: "1978", role: "Normal User" }
  ];

  // WhatsApp number
  const WHATSAPP_NUMBER = "94767797017";

  // Scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Add styled notification
  const addStyledNotification = (type, title, message) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // ========== CONTACT FORM EMAIL FUNCTION ==========
  const sendEmail = async (e) => {
    e.preventDefault();
    setIsSending(true);
    
    const form = e.target;
    const firstName = form.first_name.value;
    const lastName = form.last_name.value;
    const userEmail = form.user_email.value;
    const userPhone = form.user_phone.value;
    const userMessage = form.user_message.value;
    const fullName = `${firstName} ${lastName}`;
    
    // Get current date
    const currentDate = new Date().toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    // Template parameters for EmailJS
    const templateParams = {
      user_name: fullName,
      user_email: userEmail,
      user_phone: userPhone,
      user_message: userMessage,
      current_date: currentDate,
      to_email: userEmail
    };
    
    // EmailJS configuration from environment variables
    const SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || 'almohannadimanpower_1978';
    const TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || 'template_fyp38vh';
    const PUBLIC_KEY = 'vd292Fz6W89XFSM10';
    
    try {
      const result = await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
      console.log('Email sent successfully:', result.text);
      setIsSending(false);
      addStyledNotification('success', 'Message Sent!', `Thank you ${firstName}! We've sent a confirmation to ${userEmail}. Our team will contact you within 24 hours.`);
      form.reset();
      
      // Track lead in Supabase
      await trackLead('Contact Form', `Inquiry from ${fullName} - ${userEmail}`);
    } catch (error) {
      console.error('Email send error:', error);
      setIsSending(false);
      addStyledNotification('error', 'Failed to Send', 'Something went wrong. Please try again later or contact us directly.');
    }
  };

  // ========== WHATSAPP MESSAGE FUNCTION ==========
  const generateWhatsAppMessage = (candidate) => {
    let age = '';
    if (candidate.dob) {
      const birthDate = new Date(candidate.dob);
      const today = new Date();
      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--;
      }
      age = calculatedAge + ' years';
    } else if (candidate.age) {
      age = candidate.age + ' years';
    } else {
      age = 'N/A';
    }

    const message = `*ZOD MANPOWER RECRUITMENT - DOHA, QATAR*\n\n*📋 CANDIDATE DETAILS:*\n─────────────────\n*Name:* ${candidate.name || 'N/A'}\n*Age:* ${age}\n*Gender:* ${candidate.gender || 'N/A'}\n*Marital Status:* ${candidate.marital_status || 'N/A'}\n*Religion:* ${candidate.religion || 'N/A'}\n\n*💼 JOB INFORMATION:*\n─────────────────\n*Position:* ${candidate.job || 'N/A'}\n*Country:* ${candidate.country || 'N/A'}\n*Experience:* ${candidate.experience || 'N/A'}\n*Salary:* ${candidate.salary || 0} QAR\n*Worker Type:* ${candidate.worker_type || 'N/A'}\n\n*📄 DOCUMENTS:*\n─────────────────\n*CV Link:* ${candidate.cv_url || 'Not Available'}\n\n*🌐 WEBSITE:*\nhttps://zodmanpower.info\n─────────────────\n*📞 Contact us:*\n*WhatsApp:* +974 5535 5206\n*Email:* info@zodmanpower.info\n\n*✅ Reply "HIRE ${candidate.name?.toUpperCase() || 'CANDIDATE'}" to proceed*`;

    return encodeURIComponent(message);
  };

  const sendWhatsAppMessage = (candidate) => {
    const message = generateWhatsAppMessage(candidate);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  // ========== HIRE FUNCTION ==========
  const hireCandidateWhatsApp = (id, name) => {
    if (!confirm(`Are you sure you want to inquire about ${name}? You will be redirected to WhatsApp.`)) return;
    
    const candidate = talents.find(c => c.id === id);
    
    if (!candidate) {
      addStyledNotification('error', 'Error', 'Candidate not found');
      return;
    }
    
    sendWhatsAppMessage(candidate);
    addStyledNotification('success', 'WhatsApp', `Opening WhatsApp to inquire about ${name}`);
  };

  // ========== ADMIN STATUS UPDATE FUNCTION ==========
  const updateCandidateStatus = async (id, newStatus) => {
    try {
      const { error } = await supabase
        .from('talents')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) throw error;
      
      await loadTalents();
      addStyledNotification('success', 'Status Updated', `Candidate status changed to ${newStatus}`);
      
    } catch (error) {
      console.error('Update status error:', error);
      addStyledNotification('error', 'Update Failed', error.message);
    }
  };

  // ========== DOWNLOAD CV FUNCTION ==========
  const downloadCVFile = async (cvUrl, candidateName) => {
    if (!cvUrl) {
      addStyledNotification('info', 'No CV', 'No CV available for this candidate');
      return;
    }
    
    try {
      addStyledNotification('info', 'Downloading', `Downloading ${candidateName}'s CV...`);
      
      const response = await fetch(cvUrl);
      const blob = await response.blob();
      
      let fileExtension = 'pdf';
      if (cvUrl.includes('.png')) fileExtension = 'png';
      else if (cvUrl.includes('.jpg') || cvUrl.includes('.jpeg')) fileExtension = 'jpg';
      else if (cvUrl.includes('.pdf')) fileExtension = 'pdf';
      
      const cleanName = candidateName.replace(/[^a-zA-Z0-9]/g, '_');
      const fileName = `${cleanName}_CV.${fileExtension}`;
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      addStyledNotification('success', 'Download Complete', `${fileName} has been downloaded`);
    } catch (error) {
      console.error('Download error:', error);
      addStyledNotification('error', 'Download Failed', 'Failed to download CV. Please try again.');
    }
  };

  // ========== SUPABASE FUNCTIONS ==========
  
  const uploadFile = async (bucketName, file, folder = '') => {
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
  };

  const loadTalents = async () => {
    try {
      const { data, error } = await supabase
        .from('talents')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setTalents(data || []);
    } catch (error) {
      console.error('Load talents error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Load users error:', error);
    }
  };

  const loadLeads = async () => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      setLeads(data || []);
    } catch (error) {
      console.error('Load leads error:', error);
    }
  };

  const trackLead = async (source, action) => {
    try {
      await supabase
        .from('leads')
        .insert([{ source, action, time: new Date().toLocaleTimeString() }]);
      loadLeads();
    } catch (error) {
      console.error('Track lead error:', error);
    }
  };

  const clearLeads = async () => {
    if (confirm('Clear all logs?')) {
      await supabase.from('leads').delete().neq('id', 0);
      loadLeads();
      addStyledNotification('info', 'Cleared', 'All logs cleared successfully');
    }
  };

  const addCandidate = async (candidateData, photoFile, cvFile) => {
    try {
      let picUrl = null;
      if (photoFile && photoFile.size > 0) {
        picUrl = await uploadFile('candidate-photos', photoFile, 'photos/');
      }
      
      let cvUrl = null;
      if (cvFile && cvFile.size > 0) {
        cvUrl = await uploadFile('candidate-cvs', cvFile, 'cvs/');
      }
      
      let age = null;
      if (candidateData.dob) {
        const birthDate = new Date(candidateData.dob);
        const today = new Date();
        age = today.getFullYear() - birthDate.getFullYear();
      }
      
      const { data, error } = await supabase
        .from('talents')
        .insert([{
          name: candidateData.name,
          age: age,
          dob: candidateData.dob,
          gender: candidateData.gender,
          job: candidateData.job,
          country: candidateData.country,
          religion: candidateData.religion,
          salary: parseInt(candidateData.salary) || 0,
          experience: candidateData.experience,
          marital_status: candidateData.maritalStatus,
          worker_type: candidateData.workerType,
          pic_url: picUrl,
          cv_url: cvUrl,
          status: 'Available'
        }]);
      
      if (error) throw error;
      
      await trackLead('Admin Panel', `Added candidate: ${candidateData.name}`);
      await loadTalents();
      
      // Force admin table update after adding candidate
      setTimeout(() => {
        setAdminSearchQuery(prev => prev + ' ');
        setTimeout(() => setAdminSearchQuery(prev => prev.slice(0, -1)), 50);
      }, 100);
      
      addStyledNotification('success', 'Candidate Added', `${candidateData.name} has been successfully added to the database`);
      
      return true;
    } catch (error) {
      console.error('Add candidate error:', error);
      addStyledNotification('error', 'Add Failed', error.message);
      return false;
    }
  };

  const updateCandidate = async (id, candidateData, photoFile, cvFile) => {
    try {
      const existing = talents.find(t => t.id === id);
      
      let picUrl = existing?.pic_url;
      if (photoFile && photoFile.size > 0) {
        if (existing?.pic_url) {
          const oldPhotoPath = existing.pic_url.split('/').pop();
          await supabase.storage
            .from('candidate-photos')
            .remove([`photos/${oldPhotoPath}`]);
        }
        picUrl = await uploadFile('candidate-photos', photoFile, 'photos/');
      }
      
      let cvUrl = existing?.cv_url;
      if (cvFile && cvFile.size > 0) {
        if (existing?.cv_url) {
          const oldCvPath = existing.cv_url.split('/').pop();
          await supabase.storage
            .from('candidate-cvs')
            .remove([`cvs/${oldCvPath}`]);
        }
        cvUrl = await uploadFile('candidate-cvs', cvFile, 'cvs/');
      }
      
      let age = existing?.age;
      if (candidateData.dob) {
        const birthDate = new Date(candidateData.dob);
        const today = new Date();
        age = today.getFullYear() - birthDate.getFullYear();
      }
      
      const { error } = await supabase
        .from('talents')
        .update({
          name: candidateData.name,
          age: age,
          dob: candidateData.dob,
          gender: candidateData.gender,
          job: candidateData.job,
          country: candidateData.country,
          religion: candidateData.religion,
          salary: parseInt(candidateData.salary) || 0,
          experience: candidateData.experience,
          marital_status: candidateData.maritalStatus,
          worker_type: candidateData.workerType,
          pic_url: picUrl,
          cv_url: cvUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) throw error;
      
      await trackLead('Admin Panel', `Updated candidate: ${candidateData.name}`);
      await loadTalents();
      
      addStyledNotification('info', 'Candidate Updated', `${candidateData.name} has been updated successfully`);
      
      return true;
    } catch (error) {
      console.error('Update candidate error:', error);
      addStyledNotification('error', 'Update Failed', error.message);
      return false;
    }
  };

  const deleteCandidate = async (id) => {
    if (!confirm('Are you sure you want to delete this candidate?')) return;
    
    try {
      const candidate = talents.find(c => c.id === id);
      const candidateName = candidate?.name || 'Candidate';
      
      if (candidate) {
        if (candidate.pic_url) {
          const photoPath = candidate.pic_url.split('/').pop();
          await supabase.storage
            .from('candidate-photos')
            .remove([`photos/${photoPath}`]);
        }
        
        if (candidate.cv_url) {
          const cvPath = candidate.cv_url.split('/').pop();
          await supabase.storage
            .from('candidate-cvs')
            .remove([`cvs/${cvPath}`]);
        }
      }
      
      const { error } = await supabase
        .from('talents')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      await trackLead('Admin Panel', `Deleted candidate`);
      await loadTalents();
      
      addStyledNotification('warning', 'Candidate Removed', `${candidateName} has been removed from the database`);
      
    } catch (error) {
      console.error('Delete candidate error:', error);
      addStyledNotification('error', 'Delete Failed', error.message);
    }
  };

  const addNewUser = async () => {
    if (!newUsername || !newPassword) {
      addStyledNotification('error', 'Error', 'Please fill all fields!');
      return;
    }
    
    if (users.some(u => u.username === newUsername)) {
      addStyledNotification('error', 'Error', 'Username already exists!');
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([{
          username: newUsername,
          password: newPassword,
          role: newRole
        }])
        .select();
      
      if (error) throw error;
      
      setNewUsername('');
      setNewPassword('');
      setNewRole('Normal User');
      setAddUserModalOpen(false);
      await loadUsers();
      await trackLead('Admin Panel', `Added new user: ${newUsername} (${newRole})`);
      addStyledNotification('success', 'User Added', `User "${newUsername}" added successfully!`);
    } catch (error) {
      console.error('Add user error:', error);
      addStyledNotification('error', 'Add Failed', error.message);
    }
  };

  const deleteUser = async (id, username) => {
    if (username === 'lara') {
      addStyledNotification('error', 'Error', 'Cannot delete main Super User account!');
      return;
    }
    
    if (!confirm(`Are you sure you want to delete user "${username}"?`)) return;
    
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      await loadUsers();
      await trackLead('Admin Panel', `Deleted user: ${username}`);
      addStyledNotification('warning', 'User Deleted', `User "${username}" deleted successfully!`);
    } catch (error) {
      console.error('Delete user error:', error);
      addStyledNotification('error', 'Delete Failed', error.message);
    }
  };

  const validateLogin = () => {
    const username = document.getElementById('login-username')?.value;
    const password = document.getElementById('login-password')?.value;
    
    const hardcodedUser = usersDatabase.find(u => u.username === username && u.password === password);
    
    if (hardcodedUser) {
      setCurrentAdminUser({ username: hardcodedUser.username, role: hardcodedUser.role });
      setAdminActive(true);
      closeLoginModal();
      addStyledNotification('success', 'Al-Mohannadi Manpower', `Welcome back, ${username}!`);
      loadTalents();
      loadUsers();
      loadLeads();
      return;
    }
    
    const supabaseUser = users.find(u => u.username === username && u.password === password);
    
    if (supabaseUser) {
      setCurrentAdminUser({ username: supabaseUser.username, role: supabaseUser.role });
      setAdminActive(true);
      closeLoginModal();
      addStyledNotification('success', 'Al-Mohannadi Manpower', `Welcome back, ${username}!`);
      loadTalents();
      loadUsers();
      loadLeads();
      return;
    }
    
    const errorEl = document.getElementById('login-error');
    if (errorEl) {
      errorEl.classList.add('show');
      setTimeout(() => {
        errorEl.classList.remove('show');
      }, 3000);
    }
  };

  // ========== UI FUNCTIONS ==========
  
  const openLoginModal = () => {
    setLoginModalOpen(true);
    const modal = document.getElementById('login-modal');
    if (modal) modal.classList.add('active');
  };

  const closeLoginModal = () => {
    setLoginModalOpen(false);
    const modal = document.getElementById('login-modal');
    if (modal) modal.classList.remove('active');
  };

  const openCandidateModal = () => {
    setEditTalent(null);
    setSelectedPhotoFile(null);
    setPhotoPreview(null);
    setSelectedCvFile(null);
    setCvFileName('');
    const modal = document.getElementById('candidate-modal');
    if (modal) modal.classList.add('active');
    if (nameRef) nameRef.value = '';
    if (dobRef) dobRef.value = '';
    if (genderRef) genderRef.value = 'Male';
    if (jobRef) jobRef.value = 'Driver';
    if (countryRef) countryRef.value = 'Indonesia';
    if (religionRef) religionRef.value = 'Muslim';
    if (salaryRef) salaryRef.value = '0';
    if (experienceRef) experienceRef.value = '0-1 Year';
    if (maritalStatusRef) maritalStatusRef.value = 'Single';
    if (workerTypeRef) workerTypeRef.value = 'Recruitment Workers';
  };

  const closeCandidateModal = () => {
    const modal = document.getElementById('candidate-modal');
    if (modal) modal.classList.remove('active');
    setEditTalent(null);
    setIsSubmitting(false);
    
    // Clear all form fields and files
    setSelectedPhotoFile(null);
    setPhotoPreview(null);
    setSelectedCvFile(null);
    setCvFileName('');
    
    // Clear form input fields if refs exist
    if (nameRef) nameRef.value = '';
    if (dobRef) dobRef.value = '';
    if (genderRef) genderRef.value = 'Male';
    if (jobRef) jobRef.value = 'Driver';
    if (countryRef) countryRef.value = 'Indonesia';
    if (religionRef) religionRef.value = 'Muslim';
    if (salaryRef) salaryRef.value = '0';
    if (experienceRef) experienceRef.value = '0-1 Year';
    if (maritalStatusRef) maritalStatusRef.value = 'Single';
    if (workerTypeRef) workerTypeRef.value = 'Recruitment Workers';
    
    // Clear file input values
    if (picRef) picRef.value = '';
    if (cvRef) cvRef.value = '';
  };

  const handleAddCandidateSubmit = async (e) => {
    e.preventDefault();
    
    if (!nameRef || !dobRef || !genderRef || !jobRef || !countryRef || 
        !religionRef || !salaryRef || !experienceRef || !maritalStatusRef || !workerTypeRef) {
      addStyledNotification('error', 'Error', 'Form not properly initialized. Please refresh the page.');
      setIsSubmitting(false);
      return;
    }
    
    setIsSubmitting(true);
    
    const candidateData = {
      name: nameRef.value,
      dob: dobRef.value,
      gender: genderRef.value,
      job: jobRef.value,
      country: countryRef.value,
      religion: religionRef.value,
      salary: salaryRef.value,
      experience: experienceRef.value,
      maritalStatus: maritalStatusRef.value,
      workerType: workerTypeRef.value
    };
    
    let success;
    if (editTalent) {
      success = await updateCandidate(editTalent.id, candidateData, selectedPhotoFile, selectedCvFile);
    } else {
      success = await addCandidate(candidateData, selectedPhotoFile, selectedCvFile);
    }
    
    setIsSubmitting(false);
    
    if (success) {
      closeCandidateModal();
      applyFiltersImmediately();
    }
  };

  const handlePhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleCVChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedCvFile(file);
      setCvFileName(file.name);
    }
  };

  const clearPhoto = () => {
    setSelectedPhotoFile(null);
    setPhotoPreview(null);
    if (picRef) picRef.value = '';
  };

  const clearCV = () => {
    setSelectedCvFile(null);
    setCvFileName('');
    if (cvRef) cvRef.value = '';
  };

  const editCandidate = (candidate) => {
    setEditTalent(candidate);
    setPhotoPreview(candidate.pic_url);
    setCvFileName(candidate.cv_url ? candidate.cv_url.split('/').pop() : '');
    if (nameRef) nameRef.value = candidate.name || '';
    if (dobRef) dobRef.value = candidate.dob || '';
    if (genderRef) genderRef.value = candidate.gender || 'Male';
    if (jobRef) jobRef.value = candidate.job || 'Driver';
    if (countryRef) countryRef.value = candidate.country || 'Indonesia';
    if (religionRef) religionRef.value = candidate.religion || 'Muslim';
    if (salaryRef) salaryRef.value = candidate.salary || '0';
    if (experienceRef) experienceRef.value = candidate.experience || '0-1 Year';
    if (maritalStatusRef) maritalStatusRef.value = candidate.marital_status || 'Single';
    if (workerTypeRef) workerTypeRef.value = candidate.worker_type || 'Recruitment Workers';
    const modal = document.getElementById('candidate-modal');
    if (modal) modal.classList.add('active');
  };

  // ========== CV POPUP FUNCTIONS ==========
  
  const openCVPopup = (cvUrl, candidateName) => {
    if (!cvUrl) {
      addStyledNotification('info', 'No CV', 'No CV available for this candidate');
      return;
    }
    setCvPopupUrl(cvUrl);
    setCvPopupName(candidateName);
    setCvPopupOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeCVPopup = () => {
    setCvPopupOpen(false);
    setCvPopupUrl('');
    setCvPopupName('');
    document.body.style.overflow = 'auto';
  };

  // ========== PROFILE MODAL FUNCTIONS ==========
  
  const openProfileModal = async (id) => {
    try {
      const { data: candidate, error } = await supabase
        .from('talents')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      if (!candidate) return;
      
      const nameField = document.getElementById('profile-candidate-name');
      const dobField = document.getElementById('profile-candidate-dob');
      const genderField = document.getElementById('profile-candidate-gender');
      const maritalField = document.getElementById('profile-candidate-marital');
      const roleField = document.getElementById('profile-candidate-role');
      const countryField = document.getElementById('profile-candidate-country');
      const religionField = document.getElementById('profile-candidate-religion');
      const salaryField = document.getElementById('profile-candidate-salary');
      const experienceField = document.getElementById('profile-candidate-experience');
      const workerTypeField = document.getElementById('profile-candidate-workertype');
      const statusSpan = document.getElementById('profile-candidate-status');
      const photoContainer = document.getElementById('profile-photo-container');
      const cvLink = document.getElementById('profile-cv-link');
      
      if (nameField) nameField.value = candidate.name || '';
      if (dobField) dobField.value = candidate.dob || '';
      if (genderField) genderField.value = candidate.gender || '';
      if (maritalField) maritalField.value = candidate.marital_status || '';
      if (roleField) roleField.value = candidate.job || '';
      if (countryField) countryField.value = candidate.country || '';
      if (religionField) religionField.value = candidate.religion || '';
      if (salaryField) salaryField.value = `${candidate.salary || 0} QAR`;
      if (experienceField) experienceField.value = candidate.experience || '';
      if (workerTypeField) workerTypeField.value = candidate.worker_type || '';
      
      if (statusSpan) {
        statusSpan.innerText = candidate.status || 'Available';
        statusSpan.className = `status-badge ${(candidate.status || 'available').toLowerCase()}`;
      }
      
      if (photoContainer) {
        if (candidate.pic_url) {
          photoContainer.innerHTML = `<img src="${candidate.pic_url}" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover;" />`;
        } else {
          photoContainer.innerHTML = `<div style="width: 80px; height: 80px; background: var(--bg-tertiary); border-radius: 50%; display: flex; align-items: center; justify-content: center;"><i class="fa-regular fa-user fa-2x"></i></div>`;
        }
      }
      
      if (cvLink) {
        if (candidate.cv_url) {
          cvLink.href = candidate.cv_url;
          cvLink.style.display = 'inline-flex';
        } else {
          cvLink.style.display = 'none';
        }
      }
      
      const modal = document.getElementById('profile-modal');
      if (modal) {
        modal.setAttribute('data-candidate-id', candidate.id);
        modal.setAttribute('data-candidate-name', candidate.name);
        modal.setAttribute('data-candidate-status', candidate.status);
        modal.setAttribute('data-candidate-cv', candidate.cv_url || '');
        
        modal.classList.add('active');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      addStyledNotification('error', 'Error', 'Failed to load candidate profile');
    }
  };

  const closeProfileModal = () => {
    const modal = document.getElementById('profile-modal');
    if (modal) modal.classList.remove('active');
  };

  // ========== THEME FUNCTIONS ==========
  
  const toggleTheme = () => {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setCurrentTheme(newTheme);
    localStorage.setItem('websiteTheme', newTheme);
    
    if (newTheme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  };

  // ========== FILTER FUNCTIONS ==========
  
  const applyFiltersImmediately = (returnedValue = showReturnedOnly, categoryValue = selectedActiveCategory, countryValue = selectedCountryFilter) => {
    const searchBar = document.getElementById('realtime-search-bar');
    const queryValue = searchBar ? searchBar.value.toLowerCase() : "";
    
    const filtered = talents.filter(c => {
      const checkSearch = (c.name?.toLowerCase().includes(queryValue) || 
                           c.country?.toLowerCase().includes(queryValue) || 
                           c.job?.toLowerCase().includes(queryValue));
      
      const checkReturned = returnedValue ? (c.worker_type === 'Returned Housemaids') : true;
      
      const checkCategory = (categoryValue === 'All' || c.job === categoryValue);
      
      const checkCountry = (countryValue === 'All Countries' || c.country === countryValue);
      
      return checkSearch && checkReturned && checkCategory && checkCountry;
    });
    
    injectCandidatesIntoDOM(filtered);
  };

  const toggleReturnedFilter = () => {
    const newValue = !showReturnedOnly;
    setShowReturnedOnly(newValue);
    applyFiltersImmediately(newValue, selectedActiveCategory, selectedCountryFilter);
  };

  const filterDatabaseCategory = (categoryName) => {
    const btns = document.querySelectorAll('.filter-trigger-btn');
    btns.forEach(btn => btn.classList.remove('active'));
    let btnId = `btn-cat-${categoryName.replace(/ /g, '')}`;
    if (categoryName === 'House Maid') btnId = 'btn-cat-HouseMaid';
    if (categoryName === 'Domestic Worker') btnId = 'btn-cat-DomesticWorker';
    if (categoryName === 'Baby sitting') btnId = 'btn-cat-Babysitting';
    const activeBtn = document.getElementById(btnId);
    if (activeBtn) activeBtn.classList.add('active');
    
    setSelectedActiveCategory(categoryName);
    applyFiltersImmediately(showReturnedOnly, categoryName, selectedCountryFilter);
  };

  const filterByCountry = (countryName) => {
    const btns = document.querySelectorAll('.country-filter-btn');
    btns.forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById(`btn-country-${countryName.replace(/ /g, '_')}`);
    if (activeBtn) activeBtn.classList.add('active');
    
    setSelectedCountryFilter(countryName);
    applyFiltersImmediately(showReturnedOnly, selectedActiveCategory, countryName);
  };

  const handleSearchInput = () => {
    applyFiltersImmediately();
  };

  const processDatabaseSearch = () => {
    applyFiltersImmediately();
  };

  const getIconForRole = (role) => {
    const icons = { Driver: 'fa-car-side', Nurse: 'fa-heart-pulse', Cook: 'fa-utensils', Teacher: 'fa-graduation-cap', 'House Maid': 'fa-house-chimney', 'Domestic Worker': 'fa-broom', 'Baby sitting': 'fa-baby-carriage' };
    return icons[role] || 'fa-user';
  };

  const injectCandidatesIntoDOM = (arrayData) => {
    const wrapper = document.getElementById('directory-cards-injector');
    const counterText = document.getElementById('live-counter-text');
    if (!wrapper) return;
    wrapper.innerHTML = "";
    if (counterText) {
      counterText.innerHTML = `<span></span> ${arrayData.length} ${currentLanguage === 'EN' ? 'records discovered' : 'سجل تم اكتشافها'}`;
    }
    if (arrayData.length === 0) {
      wrapper.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px 0;"><i class="fa-solid fa-circle-info" style="display:block; font-size:30px; margin-bottom:10px; color:#53B1E0; opacity:0.6;"></i> No matching active profiles found.</div>`;
      return;
    }
    arrayData.forEach(c => {
      const badgeStatus = c.status?.toLowerCase() || 'available';
      const statusText = currentLanguage === 'EN' ? (c.status || 'Available') : (c.status === 'Available' ? 'متاح' : 'تم التعيين');
      let roleText = c.job;
      if (currentLanguage === 'AR') {
        const roleMap = { 'House Maid': 'خادمة', 'Driver': 'سائق', 'Nurse': 'ممرضة', 'Cook': 'طباخ', 'Teacher': 'معلم', 'Domestic Worker': 'عامل منزلي', 'Baby sitting': 'رعاية أطفال' };
        roleText = roleMap[c.job] || c.job;
      }
      wrapper.innerHTML += `
        <div class="candidate-card" onclick="window.openProfileModal('${c.id}')">
          <span class="status-badge ${badgeStatus}">${statusText}</span>
          <div class="avatar-placeholder">
            ${c.pic_url ? `<img src="${c.pic_url}" style="width:55px;height:55px;border-radius:50%;object-fit:cover;" />` : '<i class="fa-regular fa-user"></i>'}
          </div>
          <div class="candidate-name">${c.name || ''}</div>
          <div class="candidate-role"><i class="fa-solid ${getIconForRole(c.job)}"></i> ${roleText}</div>
          <div class="card-divider"></div>
          <div class="candidate-details"><span class="candidate-country"><i class="fa-solid fa-location-dot"></i> ${c.country || ''}</span><span class="candidate-salary">${c.salary || 0} QAR</span></div>
          <div class="card-divider"></div>
          <div class="candidate-actions" onclick="event.stopPropagation()">
            <button class="action-btn view-cv-btn" onclick="event.stopPropagation(); window.openCVPopup('${c.cv_url || ''}', '${c.name || 'Candidate'}')"><i class="fa-solid fa-eye"></i> View CV</button>
            <button class="action-btn download-cv-btn" onclick="event.stopPropagation(); window.downloadCVFile('${c.cv_url || ''}', '${c.name || 'Candidate'}')"><i class="fa-solid fa-download"></i> Download CV</button>
            <button class="action-btn hire-btn" onclick="event.stopPropagation(); window.hireCandidateWhatsApp('${c.id}', '${c.name}')"><i class="fa-brands fa-whatsapp"></i> Inquire Now</button>
          </div>
        </div>
      `;
    });
  };

  const quickFilterFromHome = (categoryName) => {
    navigateToView('candidates');
    filterDatabaseCategory(categoryName);
  };

  const navigateToView = (viewId) => {
    const savedLanguage = localStorage.getItem('websiteLanguage');
    if (!savedLanguage) return;
    
    const views = ['home-view', 'candidates-view', 'about-view', 'contact-view'];
    views.forEach(view => {
      const el = document.getElementById(view);
      if (el) el.classList.remove('active-view');
    });
    
    const navs = ['nav-home', 'nav-candidates', 'nav-about', 'nav-contact'];
    navs.forEach(nav => {
      const el = document.getElementById(nav);
      if (el) el.classList.remove('active');
    });
    
    const viewMap = {
      home: { view: 'home-view', nav: 'nav-home' },
      candidates: { view: 'candidates-view', nav: 'nav-candidates' },
      about: { view: 'about-view', nav: 'nav-about' },
      contact: { view: 'contact-view', nav: 'nav-contact' }
    };
    
    const target = viewMap[viewId];
    if (target) {
      const viewEl = document.getElementById(target.view);
      const navEl = document.getElementById(target.nav);
      if (viewEl) viewEl.classList.add('active-view');
      if (navEl) navEl.classList.add('active');
      if (viewId === 'candidates') applyFiltersImmediately();
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const selectWebsiteLanguage = (langCode) => {
    setCurrentLanguage(langCode);
    localStorage.setItem('websiteLanguage', langCode);
    if (langCode === 'AR') {
      document.body.classList.add('arabic-mode');
    } else {
      document.body.classList.remove('arabic-mode');
    }
    setLanguageSelected(true);
  };

  const resetLanguagePreference = () => {
    localStorage.removeItem('websiteLanguage');
    window.location.reload();
  };

  const toggleLanguageFromNavbar = () => {
    selectWebsiteLanguage(currentLanguage === 'EN' ? 'AR' : 'EN');
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const closeAdminPortal = () => {
    setAdminActive(false);
    setCurrentAdminUser(null);
  };

  // Update admin table with status dropdown
  useEffect(() => {
    const tbody = document.getElementById('admin-table-body');
    if (!tbody) return;
    
    const filtered = talents.filter(t => 
      t.name?.toLowerCase().includes(adminSearchQuery.toLowerCase()) ||
      t.job?.toLowerCase().includes(adminSearchQuery.toLowerCase()) ||
      t.country?.toLowerCase().includes(adminSearchQuery.toLowerCase())
    );
    
    tbody.innerHTML = '';
    filtered.forEach((candidate) => {
      const row = tbody.insertRow();
      row.insertCell(0).innerHTML = candidate.name || '';
      row.insertCell(1).innerHTML = candidate.job || '';
      row.insertCell(2).innerHTML = candidate.country || '';
      row.insertCell(3).innerHTML = `${candidate.salary || 0} QAR`;
      
      const statusCell = row.insertCell(4);
      statusCell.innerHTML = `
        <select class="status-dropdown" data-id="${candidate.id}" style="padding: 6px 12px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-primary); color: var(--text-dark); cursor: pointer;">
          <option value="Available" ${candidate.status === 'Available' ? 'selected' : ''}>Available</option>
          <option value="Hired" ${candidate.status === 'Hired' ? 'selected' : ''}>Hired</option>
        </select>
      `;
      
      row.insertCell(5).innerHTML = `
        <button class="admin-edit-btn" onclick="window.editCandidateHandler('${candidate.id}')"><i class="fa-solid fa-pen"></i> Edit</button>
        <button class="admin-delete-btn" onclick="window.deleteCandidateHandler('${candidate.id}')"><i class="fa-solid fa-trash"></i> Delete</button>
      `;
    });
    
    document.querySelectorAll('.status-dropdown').forEach(dropdown => {
      dropdown.addEventListener('change', (e) => {
        const candidateId = e.target.getAttribute('data-id');
        const newStatus = e.target.value;
        updateCandidateStatus(candidateId, newStatus);
      });
    });
    
  }, [talents, adminSearchQuery]);

  // Update users table
  useEffect(() => {
    const tbody = document.getElementById('users-table-body');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    users.forEach((user) => {
      const row = tbody.insertRow();
      row.insertCell(0).innerHTML = user.username;
      row.insertCell(1).innerHTML = '••••••';
      row.insertCell(2).innerHTML = user.role;
      row.insertCell(3).innerHTML = `<button class="delete-user-btn" onclick="window.deleteUserHandler('${user.id}', '${user.username}')"><i class="fa-solid fa-trash"></i> Delete</button>`;
    });
  }, [users]);

  // Global functions for inline onclick
  const editCandidateHandler = (id) => {
    const candidate = talents.find(c => c.id === id);
    if (candidate) editCandidate(candidate);
  };
  
  const deleteCandidateHandler = deleteCandidate;
  const deleteUserHandler = deleteUser;

  // Expose functions to window
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.editCandidateHandler = editCandidateHandler;
      window.deleteCandidateHandler = deleteCandidateHandler;
      window.deleteUserHandler = deleteUserHandler;
      window.navigateToView = navigateToView;
      window.filterDatabaseCategory = filterDatabaseCategory;
      window.filterByCountry = filterByCountry;
      window.quickFilterFromHome = quickFilterFromHome;
      window.openLoginModal = openLoginModal;
      window.closeLoginModal = closeLoginModal;
      window.validateLogin = validateLogin;
      window.closeAdminPortal = closeAdminPortal;
      window.openCandidateModal = openCandidateModal;
      window.closeCandidateModal = closeCandidateModal;
      window.openProfileModal = openProfileModal;
      window.closeProfileModal = closeProfileModal;
      window.openCVPopup = openCVPopup;
      window.closeCVPopup = closeCVPopup;
      window.downloadCVFile = downloadCVFile;
      window.hireCandidateWhatsApp = hireCandidateWhatsApp;
      window.updateCandidateStatus = updateCandidateStatus;
      window.selectWebsiteLanguage = selectWebsiteLanguage;
      window.toggleLanguageFromNavbar = toggleLanguageFromNavbar;
      window.resetLanguagePreference = resetLanguagePreference;
      window.toggleTheme = toggleTheme;
      window.processDatabaseSearch = processDatabaseSearch;
      window.toggleReturnedFilter = toggleReturnedFilter;
    }
  }, [talents]);

  // Load data on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('websiteTheme');
    if (savedTheme) {
      setCurrentTheme(savedTheme);
      if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
      }
    }
    
    const savedLang = localStorage.getItem('websiteLanguage');
    if (savedLang) {
      setLanguageSelected(true);
      setCurrentLanguage(savedLang);
      if (savedLang === 'AR') {
        document.body.classList.add('arabic-mode');
      }
    }
    
    loadTalents();
    loadUsers();
    loadLeads();
  }, []);

  // Apply filters when talents are loaded
  useEffect(() => {
    if (talents.length > 0) {
      applyFiltersImmediately();
    }
  }, [talents]);

  // Translations
  const translations = {
    EN: {
      home: "Home", candidates: "Candidates", about: "About Us", contact: "Contact Us",
      location_badge: "Doha • Qatar • Est. 2020", hero_subtitle: "Manpower",
      hero_desc: "We provide skilled and reliable workers for households and businesses across Qatar.",
      hero_btn1: "View Candidates", hero_btn2: "Contact Agency",
      stat1: "Candidates Placed", stat2: "Happy Clients", stat3: "Years Experience",
      services_sub: "Our Services", services_title: "Professional manpower solutions tailored to your needs",
      service_maid: "House Maids", service_driver: "Drivers", service_nurse: "Nurses", service_cook: "Cooks", service_teacher: "Teachers",
      why_sub: "Why Choose Us?", why_title: "Providing reliable recruitment and staffing solutions",
      why_title1: "Licensed & Trusted Agency", why_desc1: "Fully licensed manpower agency operating in Doha, Qatar with years of experience.",
      why_title2: "Verified Workers", why_desc2: "All our candidates are thoroughly vetted, trained, and background-checked.",
      why_title3: "24/7 Support", why_desc3: "We provide continuous support to both employers and workers.",
      why_title4: "Fast Processing", why_desc4: "Quick and efficient recruitment and visa transfer processing.",
      cta_title: "Your Trusted Manpower Partner in Doha, Qatar", cta_btn: "Contact Us",
      candidates_sub: "Live Search Matrix", candidates_title: "Explore Our Candidates Database",
      filter_all: "All Roles", filter_driver: "Drivers", filter_nurse: "Nurses", filter_cook: "Cooks", filter_teacher: "Teachers", filter_maid: "House Maids", filter_domestic: "Domestic Workers", filter_baby: "Baby Sitting",
      country_all: "All Countries", country_indonesia: "Indonesia", country_india: "India", country_philippines: "Philippines", country_bangladesh: "Bangladesh", country_srilanka: "Sri Lanka", country_ethiopia: "Ethiopia",
      search_placeholder: "Search names, country, specific terms...",
      view_cv: "View CV", download_cv: "Download CV", hire_now: "Inquire Now", close: "Close",
      add_user_title: "Add New User", add_user_username: "Username", add_user_password: "Password", add_user_role: "Role", add_user_normal: "Normal User", add_user_super: "Super User", add_user_cancel: "Cancel", add_user_submit: "Add User",
      admin_login_title: "Admin Access", admin_username: "Username", admin_password: "Password", admin_login: "Login", admin_invalid: "Invalid username or password",
      total_candidates: "Total Candidates", available_candidates: "Available", hired_candidates: "Hired",
      new_candidate: "New Candidate", edit_candidate: "Edit", full_name: "Full Name", date_of_birth: "Date of Birth", gender: "Gender", marital_status: "Marital Status",
      job_designation: "Job Designation", country: "Country", religion: "Religion", salary_qar: "Salary (QAR)", experience: "Experience", worker_type: "Worker Type",
      photo: "Photo", cv_label: "CV (PDF/Image)", choose_photo: "Choose Photo", choose_cv: "Choose CV", save: "Save", cancel: "Cancel", saving: "Saving...",
      admin_dashboard: "Admin Dashboard", staff_portal: "Staff Portal", logout: "Logout", manage_candidates: "Manage Candidates", add_candidate: "Add New Candidate",
      manage_users: "Manage Users", add_new_user: "Add New User", status: "Status", actions: "Actions",
      footer_text: "Professional manpower solutions in Doha, Qatar.", copyright: "© 2026 AL-MOHANNADI Manpower. All Rights Reserved.",
      quick_links: "Quick Links", contact_us: "Contact Us", address: "Doha, Qatar", phone: "+974 XXXX XXXX", email: "info@almohannadi.qa",
      intro_title: "Select Your Language", intro_subtitle: "Please select a preferred language", lang_en: "Continue in English", lang_ar: "Continue in Arabic",
      theme_label: "Website Theme", theme_light: "Light Mode", theme_dark: "Dark Mode", reset_lang: "Change Language",
      no_results: "No matching active profiles found.",
      ready: "Ready", view_all: "View All →",
      back_to_home: "Back to Home",
      about_tagline: "",
      pillars_sub: "Core Alignment",
      pillars_title: "The Principles Behind Our Agency",
      pillars_desc: "We continuously optimize operational guidelines to build unmatched transparency.",
      vision_title: "Our Vision",
      vision_desc: "To be the most reputable and ethical recruitment framework in the Middle East, recognized for strict regulatory alignment and worker welfare.",
      mission_title: "Our Mission",
      mission_desc: "To alleviate deployment delays for families by maintaining a live, actively vetted database of high-caliber workers prepared for seamless transitions.",
      ethical_title: "Ethical Sourcing",
      ethical_desc: "We collaborate directly with transparent, licensed global placement partners, ensuring completely transparent employment contracts for all parties.",
      history_title: "Years of Proven Operational Success",
      history_desc: "Since our inception, we have consistently refined our processing engine to ensure visas, custom clearances, and candidate orientation protocols align with Qatar Labor standards.",
      history_badge: "Established"
    },
    AR: {
      home: "الرئيسية", candidates: "المرشحين", about: "من نحن", contact: "اتصل بنا",
      location_badge: "الدوحة • قطر • تأسست 2020", hero_subtitle: "القوى العاملة",
      hero_desc: "نقدم عمالاً مهرة وموثوقين للمنازل والشركات في جميع أنحاء قطر.",
      hero_btn1: "عرض المرشحين", hero_btn2: "اتصل بالوكالة",
      stat1: "مرشح تم تعيينهم", stat2: "عميل سعيد", stat3: "سنوات من الخبرة",
      services_sub: "خدماتنا", services_title: "حلول القوى العاملة المهنية",
      service_maid: "خادمات", service_driver: "سائقين", service_nurse: "ممرضات", service_cook: "طهاة", service_teacher: "معلمين",
      why_sub: "لماذا تختارنا؟", why_title: "نقدم حلول توظيف موثوقة",
      why_title1: "وكالة مرخصة وموثوقة", why_desc1: "وكالة قوى عاملة مرخصة بالكامل تعمل في الدوحة.",
      why_title2: "عمال موثوقون", why_desc2: "جميع مرشحينا يتم فحصهم وتدريبهم.",
      why_title3: "دعم على مدار الساعة", why_desc3: "نقدم دعماً مستمراً.",
      why_title4: "معالجة سريعة", why_desc4: "معالجة سريعة وفعالة للتوظيف.",
      cta_title: "شريكك الموثوق في القوى العاملة", cta_btn: "اتصل بنا",
      candidates_sub: "مصفوفة البحث المباشر", candidates_title: "استكشف قاعدة بيانات المرشحين",
      filter_all: "جميع الأدوار", filter_driver: "سائقين", filter_nurse: "ممرضات", filter_cook: "طهاة", filter_teacher: "معلمين", filter_maid: "خادمات", filter_domestic: "عمال منزليون", filter_baby: "رعاية الأطفال",
      country_all: "جميع البلدان", country_indonesia: "إندونيسيا", country_india: "الهند", country_philippines: "الفلبين", country_bangladesh: "بنغلاديش", country_srilanka: "سريلانكا", country_ethiopia: "إثيوبيا",
      search_placeholder: "ابحث عن الأسماء، البلد...",
      view_cv: "عرض السيرة", download_cv: "تحميل السيرة", hire_now: "استفسر الآن", close: "إغلاق",
      add_user_title: "إضافة مستخدم جديد", add_user_username: "اسم المستخدم", add_user_password: "كلمة المرور", add_user_role: "الدور", add_user_normal: "مستخدم عادي", add_user_super: "مستخدم ممتاز", add_user_cancel: "إلغاء", add_user_submit: "إضافة مستخدم",
      admin_login_title: "دخول المشرف", admin_username: "اسم المستخدم", admin_password: "كلمة المرور", admin_login: "تسجيل الدخول", admin_invalid: "اسم المستخدم أو كلمة المرور غير صالحة",
      total_candidates: "إجمالي المرشحين", available_candidates: "متاح", hired_candidates: "تم التعيين",
      new_candidate: "مرشح جديد", edit_candidate: "تعديل", full_name: "الاسم الكامل", date_of_birth: "تاريخ الميلاد", gender: "الجنس", marital_status: "الحالة الاجتماعية",
      job_designation: "المسمى الوظيفي", country: "البلد", religion: "الدين", salary_qar: "الراتب", experience: "الخبرة", worker_type: "نوع العامل",
      photo: "الصورة", cv_label: "السيرة الذاتية", choose_photo: "اختر صورة", choose_cv: "اختر السيرة", save: "حفظ", cancel: "إلغاء", saving: "جاري الحفظ...",
      admin_dashboard: "لوحة التحكم", staff_portal: "بوابة الموظفين", logout: "تسجيل الخروج", manage_candidates: "إدارة المرشحين", add_candidate: "إضافة مرشح",
      manage_users: "إدارة المستخدمين", add_new_user: "إضافة مستخدم جديد", status: "الحالة", actions: "إجراءات",
      footer_text: "حلول القوى العاملة المهنية في الدوحة.",
      copyright: "© 2026 المهندي للقوى العاملة.",
      quick_links: "روابط سريعة", contact_us: "اتصل بنا", address: "الدوحة، قطر", phone: "+974 XXXX XXXX", email: "info@almohannadi.qa",
      intro_title: "اختر لغتك", intro_subtitle: "يرجى تحديد اللغة المفضلة", lang_en: "المتابعة باللغة الإنجليزية", lang_ar: "المتابعة باللغة العربية",
      theme_label: "مظهر الموقع", theme_light: "الوضع الفاتح", theme_dark: "الوضع الداكن", reset_lang: "تغيير اللغة",
      no_results: "لم يتم العثور على مرشحين",
      ready: "جاهز", view_all: "عرض الكل ←",
      back_to_home: "العودة إلى الرئيسية",
      about_tagline: "من نحن",
      pillars_sub: "المحاذاة الأساسية",
      pillars_title: "المبادئ وراء وكالتنا",
      pillars_desc: "نقوم باستمرار بتحسين المبادئ التوجيهية التشغيلية لبناء شفافية لا مثيل لها.",
      vision_title: "رؤيتنا",
      vision_desc: "أن نكون إطار التوظيف الأكثر سمعة وأخلاقية في الشرق الأوسط، المعترف به للامتثال التنظيمي الصارم ورعاية العمال.",
      mission_title: "مهمتنا",
      mission_desc: "لتخفيف تأخيرات التوظيف للعائلات من خلال الحفاظ على قاعدة بيانات حية ومدققة بنشاط من العمال ذوي الكفاءة العالية المستعدين للانتقال السلس.",
      ethical_title: "التوريد الأخلاقي",
      ethical_desc: "نتعاون مباشرة مع شركاء توظيف عالميين مرخصين وشفافين، مما يضمن عقود عمل شفافة تماماً لجميع الأطراف.",
      history_title: "سنوات من النجاح التشغيلي المثبت",
      history_desc: "منذ البداية، قمنا بتحسين محرك المعالجة لدينا باستمرار لضمان أن التأشيرات والتصاريح وبروتوكولات توجيه المرشحين تتوافق مع معايير العمل القطرية.",
      history_badge: "تأسست"
    }
  };

  const t = translations[currentLanguage];

  // Language Selection Screen
  if (!languageSelected) {
    const isDarkMode = currentTheme === 'dark';
    
    return (
      <div style={{
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh',
        background: isDarkMode ? '#0f172a' : '#ffffff',
        zIndex: 99999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.3s ease'
      }}>
        <style>{`
          @keyframes spinLoader { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          @keyframes pulseDot { 0%,100% { transform: translate(-50%,-50%) scale(0.8); opacity: 0.6; } 50% { transform: translate(-50%,-50%) scale(1.3); opacity: 1; } }
        `}</style>
        <div style={{
          textAlign: 'center', padding: '40px', maxWidth: '450px', width: '90%',
          background: isDarkMode ? 'rgba(30,41,59,0.9)' : 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(20px)', borderRadius: '32px',
          boxShadow: isDarkMode ? '0 25px 50px rgba(0,0,0,0.3)' : '0 25px 50px rgba(0,0,0,0.1)',
          position: 'relative'
        }}>
          <button onClick={toggleTheme} style={{
            position: 'absolute', top: '20px', right: '20px', width: '40px', height: '40px',
            borderRadius: '50%', background: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
            border: 'none', cursor: 'pointer', fontSize: '18px', color: isDarkMode ? '#fbbf24' : '#53B1E0'
          }}>
            <i className={`fa-solid ${currentTheme === 'light' ? 'fa-moon' : 'fa-sun'}`}></i>
          </button>
          
          <img src="https://github.com/AshiLara2007/Comming-Soon-Mohannadi-Website-/blob/main/app/Al-Mohannadi-Manpower-removebg-preview.png?raw=true" alt="Logo" style={{ width: '80px', height: '80px', borderRadius: '50%', marginBottom: '20px', border: `2px solid #53B1E0`, margin: '0 auto 20px auto' }} />
          
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: isDarkMode ? 'white' : '#1e293b', marginBottom: '10px' }}>Al-Mohannadi Manpower</h1>
          <p style={{ fontSize: '13px', color: isDarkMode ? 'rgba(255,255,255,0.6)' : '#64748b', marginBottom: '30px' }}>
            Select your preferred language
          </p>
          
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => selectWebsiteLanguage('EN')} style={{ padding: '12px 28px', fontSize: '14px', fontWeight: 600, background: '#002F66', color: 'white', border: 'none', borderRadius: '50px', cursor: 'pointer' }}>English</button>
            <button onClick={() => selectWebsiteLanguage('AR')} style={{ padding: '12px 28px', fontSize: '14px', fontWeight: 600, background: '#002F66', color: 'white', border: 'none', borderRadius: '50px', cursor: 'pointer' }}>العربية</button>
          </div>
        </div>
      </div>
    );
  }

  // Loading Screen
  if (isLoading) {
    const isDarkMode = currentTheme === 'dark';
    
    return (
      <div style={{
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh',
        background: isDarkMode ? '#0f172a' : '#ffffff',
        zIndex: 99999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.3s ease'
      }}>
        <style>{`
          @keyframes spinLoader { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          @keyframes pulseDot { 0%,100% { transform: translate(-50%,-50%) scale(0.8); opacity: 0.6; } 50% { transform: translate(-50%,-50%) scale(1.3); opacity: 1; } }
          @keyframes loadingProgress { 0% { width: 0%; margin-left: 0%; } 50% { width: 70%; margin-left: 15%; } 100% { width: 0%; margin-left: 100%; } }
        `}</style>
        <div style={{
          textAlign: 'center', padding: '40px', maxWidth: '450px', width: '90%',
          background: isDarkMode ? 'rgba(30,41,59,0.9)' : 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(20px)', borderRadius: '32px',
          boxShadow: isDarkMode ? '0 25px 50px rgba(0,0,0,0.3)' : '0 25px 50px rgba(0,0,0,0.1)',
          position: 'relative'
        }}>
          <button onClick={toggleTheme} style={{
            position: 'absolute', top: '20px', right: '20px', width: '40px', height: '40px',
            borderRadius: '50%', background: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
            border: 'none', cursor: 'pointer', fontSize: '18px', color: isDarkMode ? '#fbbf24' : '#53B1E0'
          }}>
            <i className={`fa-solid ${currentTheme === 'light' ? 'fa-moon' : 'fa-sun'}`}></i>
          </button>
          
          <div style={{ position: 'relative', width: '80px', height: '80px', margin: '0 auto 30px auto' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: `3px solid ${isDarkMode ? 'rgba(83,177,224,0.15)' : 'rgba(83,177,224,0.1)'}`, borderRadius: '50%' }}></div>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: `3px solid transparent`, borderTop: `3px solid #53B1E0`, borderRight: `3px solid rgba(83,177,224,0.4)`, borderRadius: '50%', animation: 'spinLoader 1s linear infinite' }}></div>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '10px', height: '10px', background: '#53B1E0', borderRadius: '50%', animation: 'pulseDot 1s ease-in-out infinite' }}></div>
          </div>
          
          <img src="https://github.com/AshiLara2007/Comming-Soon-Mohannadi-Website-/blob/main/app/Al-Mohannadi-Manpower-removebg-preview.png?raw=true" alt="Logo" style={{ width: '70px', height: '70px', borderRadius: '50%', marginBottom: '20px', border: `2px solid #53B1E0` }} />
          
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: isDarkMode ? 'white' : '#1e293b', marginBottom: '10px' }}>Al-Mohannadi Manpower</h1>
          <p style={{ fontSize: '13px', color: isDarkMode ? 'rgba(255,255,255,0.6)' : '#64748b', marginBottom: '30px' }}>
            Loading amazing talents...
          </p>
          
          <div style={{ width: '80%', margin: '0 auto' }}>
            <div style={{ height: '3px', background: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: '70%', height: '100%', background: '#53B1E0', animation: 'loadingProgress 1.5s ease-in-out infinite' }}></div>
            </div>
            <p style={{ fontSize: '11px', color: isDarkMode ? 'rgba(255,255,255,0.5)' : '#64748b', marginTop: '12px' }}><i className="fa-solid fa-spinner fa-spin"></i> Loading candidates...</p>
          </div>
        </div>
      </div>
    );
  }

  // Main return
  return (
    <div className={currentLanguage === 'AR' ? 'rtl' : 'ltr'}>
      {/* STYLES */}
      <style>{`
        .rtl { direction: rtl; text-align: right; }
        
        :root {
          --bg-primary: #ffffff;
          --bg-secondary: #f8fafc;
          --bg-tertiary: #f1f5f9;
          --text-dark: #1e293b;
          --text-secondary: #64748b;
          --border-color: #e2e8f0;
          --border-light: #cbd5e1;
          --input-bg: #ffffff;
          --footer-bg: #f1f5f9;
          --cta-bg: #e8f4fd;
        }
        
        body.dark-theme {
          --bg-primary: #0f172a;
          --bg-secondary: #1e293b;
          --bg-tertiary: #334155;
          --text-dark: #f1f5f9;
          --text-secondary: #94a3b8;
          --border-color: #334155;
          --border-light: #475569;
          --input-bg: #1e293b;
          --footer-bg: #0f172a;
          --cta-bg: #1e293b;
        }
        
        body {
          background: var(--bg-primary);
          color: var(--text-dark);
          transition: background 0.3s ease, color 0.3s ease;
          margin: 0;
          font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
        }
        
        .navbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: transparent;
          padding: 15px 60px;
          height: 95px;
          position: fixed;
          width: 100%;
          top: 0;
          left: 0;
          z-index: 1000;
          transition: all 0.4s ease;
        }
        
        .navbar.scrolled {
          background: var(--bg-primary);
          backdrop-filter: blur(10px);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          border-bottom: 1px solid var(--border-color);
          padding: 10px 60px;
          height: 80px;
        }
        
        body.dark-theme .navbar.scrolled {
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(10px);
        }
        
        .nav-links {
          display: flex;
          list-style: none;
          gap: 15px;
          align-items: center;
          margin: 0;
          padding: 0;
        }
        
        .nav-item {
          text-decoration: none;
          color: var(--text-secondary);
          font-size: 15px;
          font-weight: 500;
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s;
          position: relative;
          background: transparent;
        }
        
        .nav-item::after {
          content: '';
          position: absolute;
          bottom: 4px;
          left: 50%;
          width: 0;
          height: 2px;
          background: #53B1E0;
          transition: all 0.3s;
          transform: translateX(-50%);
        }
        
        .nav-item:hover {
          color: var(--text-dark);
          background: transparent;
        }
        
        .nav-item:hover::after {
          width: 50%;
        }
        
        .nav-item.active {
          color: #2c93c4;
          background: rgba(83, 177, 224, 0.12);
          font-weight: 600;
        }
        
        .nav-item.active::after {
          display: none;
        }
        
        .nav-actions {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        
        .btn-lang, .btn-theme {
          background: transparent;
          border: 1px solid var(--border-light);
          color: var(--text-dark);
          padding: 9px 18px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s;
        }
        
        .btn-lang:hover, .btn-theme:hover {
          border-color: #53B1E0;
          transform: translateY(-1px);
        }
        
        .btn-admin {
          background: rgba(83, 177, 224, 0.08);
          border: 1px solid #53B1E0;
          color: #2c93c4;
          padding: 9px 22px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.3s;
        }
        
        .btn-admin:hover {
          background: #53B1E0;
          color: white;
          transform: translateY(-1px);
        }
        
        .logo-btn {
          background: transparent;
          border: none;
          cursor: pointer;
        }
        
        .logo-img {
          height: 70px;
          width: auto;
          transition: all 0.4s;
        }
        
        .navbar.scrolled .logo-img {
          height: 60px;
        }
        
        .menu-toggle {
          display: none;
          flex-direction: column;
          cursor: pointer;
          gap: 5px;
        }
        
        .menu-toggle .bar {
          width: 25px;
          height: 3px;
          background: var(--text-dark);
          border-radius: 2px;
          transition: all 0.3s;
        }
        
        .returned-switch-container {
          display: flex;
          align-items: center;
          gap: 12px;
          background: var(--bg-secondary);
          padding: 8px 16px;
          border-radius: 40px;
          border: 1px solid var(--border-color);
        }
        
        .switch-label {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-secondary);
        }
        
        .switch {
          position: relative;
          display: inline-block;
          width: 50px;
          height: 24px;
        }
        
        .switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        
        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #cbd5e1;
          transition: 0.3s;
          border-radius: 34px;
        }
        
        .slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: 0.3s;
          border-radius: 50%;
        }
        
        input:checked + .slider {
          background-color: #53B1E0;
        }
        
        input:checked + .slider:before {
          transform: translateX(26px);
        }
        
        body.dark-theme .slider {
          background-color: #475569;
        }
        
        .returned-badge {
          background: linear-gradient(135deg, #8b5cf6, #6d28d9);
          color: white;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 600;
        }
        
        @keyframes fadeInPage { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .active-view { animation: fadeInPage 0.4s ease-in-out forwards; display: block; }
        #home-view, #candidates-view, #about-view, #contact-view { display: none; }
        #home-view.active-view, #candidates-view.active-view, #about-view.active-view, #contact-view.active-view { display: block; }
        
        .status-dropdown {
          padding: 6px 12px;
          border-radius: 6px;
          border: 1px solid var(--border-color);
          background: var(--bg-primary);
          color: var(--text-dark);
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
        }
        
        .cv-popup-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.85);
          z-index: 20000;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(8px);
          animation: fadeIn 0.2s ease;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .cv-popup-container {
          width: 90%;
          max-width: 1000px;
          height: 85%;
          max-height: 85vh;
          background: var(--bg-primary);
          border-radius: 20px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          animation: slideUp 0.3s ease;
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
        }
        
        @keyframes slideUp {
          from { transform: translateY(50px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        .cv-popup-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px;
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border-color);
        }
        
        .cv-popup-title {
          font-size: 18px;
          font-weight: 700;
          color: var(--text-dark);
        }
        
        .cv-popup-close {
          background: transparent;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: var(--text-secondary);
          transition: color 0.2s;
          padding: 8px;
          border-radius: 8px;
        }
        
        .cv-popup-close:hover {
          color: #ef4444;
          background: rgba(239,68,68,0.1);
        }
        
        .cv-popup-body {
          flex: 1;
          overflow: auto;
          background: var(--bg-primary);
        }
        
        .cv-iframe {
          width: 100%;
          height: 100%;
          border: none;
          background: white;
        }
        
        .cv-popup-footer {
          display: flex;
          justify-content: flex-end;
          padding: 16px 24px;
          background: var(--bg-secondary);
          border-top: 1px solid var(--border-color);
          gap: 12px;
        }
        
        .cv-download-btn {
          background: #10b981;
          color: white;
          border: none;
          padding: 8px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s;
        }
        
        .cv-download-btn:hover {
          background: #059669;
          transform: translateY(-1px);
        }
        
        .cv-close-btn {
          background: #ef4444;
          color: white;
          border: none;
          padding: 8px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s;
        }
        
        .cv-close-btn:hover {
          background: #dc2626;
          transform: translateY(-1px);
        }
        
        .notification-container {
          position: fixed;
          top: 90px;
          right: 20px;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .notification {
          min-width: 320px;
          max-width: 420px;
          background: var(--bg-primary);
          border-radius: 16px;
          box-shadow: 0 20px 35px -10px rgba(0,0,0,0.2);
          overflow: hidden;
          animation: slideInRight 0.3s ease forwards;
          border-left: 5px solid;
        }
        
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        .notification.success { border-left-color: #10b981; }
        .notification.error { border-left-color: #ef4444; }
        .notification.warning { border-left-color: #f59e0b; }
        .notification.info { border-left-color: #3b82f6; }
        
        .notification-content {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px 18px;
        }
        
        .notification-icon {
          flex-shrink: 0;
          width: 40px;
          height: 40px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }
        
        .notification.success .notification-icon {
          background: rgba(16,185,129,0.15);
          color: #10b981;
        }
        .notification.error .notification-icon {
          background: rgba(239,68,68,0.15);
          color: #ef4444;
        }
        .notification.warning .notification-icon {
          background: rgba(245,158,11,0.15);
          color: #f59e0b;
        }
        .notification.info .notification-icon {
          background: rgba(59,130,246,0.15);
          color: #3b82f6;
        }
        
        .notification-text {
          flex: 1;
        }
        
        .notification-title {
          font-weight: 700;
          font-size: 14px;
          margin-bottom: 4px;
          color: var(--text-dark);
        }
        
        .notification-message {
          font-size: 13px;
          color: var(--text-secondary);
        }
        
        .notification-close {
          flex-shrink: 0;
          background: transparent;
          border: none;
          cursor: pointer;
          color: var(--text-secondary);
          font-size: 14px;
          padding: 5px;
          transition: color 0.2s;
        }
        
        .notification-close:hover {
          color: var(--text-dark);
        }
        
        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 0.6s linear infinite;
          display: inline-block;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .btn-save:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }
        
        .candidate-actions { display: flex; flex-direction: column; gap: 8px; width: 100%; margin-top: 10px; }
        .action-btn { width: 100%; padding: 8px 10px; border-radius: 8px; font-size: 11px; font-weight: 600; cursor: pointer; transition: all 0.3s ease; border: none; display: flex; align-items: center; justify-content: center; gap: 6px; }
        .view-cv-btn { background-color: #53B1E0; color: white; }
        .view-cv-btn:hover { background-color: #3fa3d4; transform: translateY(-1px); }
        .download-cv-btn { background-color: #10b981; color: white; }
        .download-cv-btn:hover { background-color: #059669; transform: translateY(-1px); }
        .hire-btn { background-color: #25D366; color: white; }
        .hire-btn:hover { background-color: #128C7E; transform: translateY(-1px); }
        
        .country-filters .filter-trigger-btn.active { background-color: rgba(83, 177, 224, 0.1); border-color: #53B1E0; color: #2c93c4; }
        body.dark-theme .country-filters .filter-trigger-btn.active { background-color: rgba(83, 177, 224, 0.2); color: #53B1E0; }
        
        .candidate-card { cursor: pointer; transition: all 0.3s; background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 16px; padding: 24px; width: 185px; position: relative; }
        .candidate-card:hover { transform: translateY(-4px); box-shadow: 0 12px 30px rgba(0,0,0,0.1); }
        
        .btn-primary { background: #53B1E0; color: white; padding: 14px 28px; border-radius: 8px; font-weight: 600; border: none; cursor: pointer; transition: all 0.3s; }
        .btn-primary:hover { background: #3fa3d4; transform: translateY(-2px); }
        .btn-secondary { background: transparent; border: 1px solid var(--border-light); color: var(--text-dark); padding: 14px 28px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.3s; }
        .btn-secondary:hover { border-color: #53B1E0; transform: translateY(-2px); }
        
        .service-card { background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 16px; padding: 35px 25px; width: 210px; text-align: center; cursor: pointer; transition: all 0.3s; }
        .service-card:hover { transform: translateY(-6px); box-shadow: 0 12px 30px rgba(0,0,0,0.08); }
        
        .status-badge { position: absolute; top: 15px; right: 15px; font-size: 10px; font-weight: bold; padding: 4px 10px; border-radius: 30px; }
        .status-badge.available { background: #d1fae5; color: #065f46; }
        .status-badge.hired { background: #dbeafe; color: #1e40af; }
        body.dark-theme .status-badge.available { background: rgba(16,185,129,0.2); color: #34d399; }
        body.dark-theme .status-badge.hired { background: rgba(59,130,246,0.2); color: #60a5fa; }
        
        .why-card { background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 16px; padding: 35px 28px; width: 260px; transition: all 0.3s; }
        .why-card:hover { transform: translateY(-6px); box-shadow: 0 12px 30px rgba(0,0,0,0.08); }
        
        .filter-trigger-btn { padding: 11px 20px; border-radius: 8px; border: 1px solid var(--border-color); background: var(--bg-primary); color: var(--text-secondary); font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.3s; }
        .filter-trigger-btn.active { background: rgba(83,177,224,0.1); border-color: #53B1E0; color: #2c93c4; }
        .filter-trigger-btn:hover { border-color: #53B1E0; transform: translateY(-1px); }
        
        .form-input { width: 100%; padding: 13px 18px; border-radius: 10px; border: 1px solid var(--border-light); background: var(--input-bg); color: var(--text-dark); outline: none; transition: all 0.3s; }
        .form-input:focus { border-color: #53B1E0; box-shadow: 0 0 0 4px rgba(83,177,224,0.12); }
        
        .avatar-placeholder { width: 55px; height: 55px; background: var(--bg-tertiary); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--text-secondary); font-size: 22px; margin-bottom: 25px; margin-top: 5px; overflow: hidden; }
        
        .hero-container { position: relative; width: 100%; height: 100vh; display: flex; align-items: center; padding: 0 80px; background: linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.6) 100%), url('https://github.com/AshiLara2007/ZODManpower/blob/main/backgroundlimage1.png?raw=true'); background-size: cover; background-position: center; }
        body.dark-theme .hero-container { background: linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(30,41,59,0.8) 100%), url('https://github.com/AshiLara2007/ZODManpower/blob/main/backgroundlimage1.png?raw=true'); background-size: cover; background-position: center; }
        .hero-content { max-width: 650px; margin-top: 60px; }
        .hero-title { font-size: 64px; font-weight: 800; line-height: 1.1; color: var(--text-dark); letter-spacing: -1px; }
        .hero-title .highlight { color: #53B1E0; display: block; }
        .hero-subtitle { font-size: 24px; font-weight: 400; color: var(--text-secondary); letter-spacing: 6px; text-transform: uppercase; margin-top: 5px; margin-bottom: 25px; position: relative; }
        .hero-subtitle::after { content: ''; display: block; width: 80px; height: 2px; background: #53B1E0; margin-top: 15px; }
        .hero-description { color: var(--text-secondary); font-size: 16px; line-height: 1.6; margin-bottom: 35px; }
        .hero-buttons { display: flex; gap: 16px; }
        
        .location-badge { display: inline-block; background: rgba(83,177,224,0.12); backdrop-filter: blur(8px); padding: 8px 18px; border-radius: 30px; font-size: 12px; font-weight: 600; color: #2c93c4; margin-bottom: 24px; }
        
        .stats-section { background: var(--bg-secondary); padding: 50px 40px; }
        .stats-grid { display: flex; justify-content: space-around; align-items: center; width: 100%; max-width: 1100px; margin: 0 auto; flex-wrap: wrap; gap: 30px; }
        .stat-item { display: flex; flex-direction: column; align-items: center; text-align: center; flex: 1; }
        .stat-icon { font-size: 26px; color: #53B1E0; margin-bottom: 12px; }
        .stat-number { font-size: 38px; font-weight: 700; color: var(--text-dark); line-height: 1; margin-bottom: 6px; }
        .stat-label { font-size: 14px; font-weight: 500; color: var(--text-secondary); }
        
        .services-section { background: var(--bg-primary); padding: 80px 60px; text-align: center; }
        .services-sub { font-size: 13px; font-weight: 700; color: #53B1E0; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 12px; }
        .services-title { font-size: 34px; font-weight: 700; color: var(--text-dark); margin-bottom: 45px; }
        .services-grid { display: flex; justify-content: center; gap: 20px; max-width: 1250px; margin: 0 auto; flex-wrap: wrap; }
        .service-icon-wrapper { width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 22px; margin: 0 auto 20px; transition: all 0.3s ease; }
        .card-maid .service-icon-wrapper { background: rgba(239,68,68,0.08); color: #ef4444; }
        .card-driver .service-icon-wrapper { background: rgba(83,177,224,0.08); color: #53B1E0; }
        .card-nurse .service-icon-wrapper { background: rgba(16,185,129,0.08); color: #10b981; }
        .card-cook .service-icon-wrapper { background: rgba(245,158,11,0.08); color: #f59e0b; }
        .card-teacher .service-icon-wrapper { background: rgba(139,92,246,0.08); color: #8b5cf6; }
        .service-name { font-size: 16px; font-weight: 700; color: var(--text-dark); }
        
        .why-choose-section { background: var(--bg-primary); padding: 80px 60px; text-align: center; }
        .why-sub { font-size: 13px; font-weight: 700; color: #53B1E0; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 12px; }
        .why-title { font-size: 34px; font-weight: 700; color: var(--text-dark); margin-bottom: 45px; }
        .why-grid { display: flex; justify-content: center; gap: 24px; max-width: 1250px; margin: 0 auto; flex-wrap: wrap; }
        .why-icon-box { width: 50px; height: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; margin: 0 auto 22px; }
        .card-trusted .why-icon-box { background: rgba(245,158,11,0.08); color: #f59e0b; }
        .card-verified .why-icon-box { background: rgba(16,185,129,0.08); color: #10b981; }
        .card-support .why-icon-box { background: rgba(83,177,224,0.08); color: #53B1E0; }
        .card-fast .why-icon-box { background: rgba(139,92,246,0.08); color: #8b5cf6; }
        .why-card-title { font-size: 17px; font-weight: 700; color: var(--text-dark); margin-bottom: 12px; }
        .why-card-desc { font-size: 14px; color: var(--text-secondary); line-height: 1.5; }
        
        .cta-section { background: var(--cta-bg); padding: 80px 40px; text-align: center; }
        .cta-container { max-width: 850px; margin: 0 auto; }
        .cta-title { font-size: 32px; font-weight: 800; color: var(--text-dark); margin-bottom: 16px; }
        .cta-desc { color: var(--text-secondary); margin-bottom: 30px; }
        .btn-cta { background: #53B1E0; color: white; border: none; padding: 15px 35px; font-size: 15px; font-weight: 600; border-radius: 8px; cursor: pointer; display: inline-flex; align-items: center; gap: 10px; transition: all 0.3s; }
        .btn-cta:hover { transform: translateY(-2px); background: #3fa3d4; }
        
        .directory-container { padding: 140px 60px 60px 60px; max-width: 1300px; margin: 0 auto; min-height: 75vh; }
        .directory-header { margin-bottom: 45px; }
        .controls-wrapper { display: flex; align-items: center; justify-content: space-between; gap: 20px; margin-bottom: 35px; flex-wrap: wrap; }
        .search-input-box { position: relative; flex: 1; max-width: 400px; min-width: 280px; }
        .search-input-box i { position: absolute; left: 18px; top: 50%; transform: translateY(-50%); color: var(--text-secondary); font-size: 16px; }
        .directory-search { width: 100%; padding: 14px 20px 14px 50px; border-radius: 10px; border: 1px solid var(--border-light); font-size: 14px; color: var(--text-dark); outline: none; background: var(--input-bg); }
        .filter-buttons-list { display: flex; gap: 10px; flex-wrap: wrap; }
        .filter-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 15px; margin-bottom: 20px; }
        .directory-results-counter { font-size: 13px; font-weight: 600; color: var(--text-secondary); margin-bottom: 25px; display: flex; align-items: center; gap: 8px; }
        .candidates-grid { display: flex; justify-content: center; gap: 22px; max-width: 1250px; margin: 0 auto 40px auto; flex-wrap: wrap; }
        .candidate-name { font-size: 16px; font-weight: 700; color: var(--text-dark); margin-bottom: 8px; text-align: center; }
        .candidate-role { font-size: 13px; color: #53B1E0; font-weight: 600; text-align: center; margin-bottom: 12px; display: flex; align-items: center; justify-content: center; gap: 6px; }
        .card-divider { height: 1px; background: var(--border-color); margin: 12px 0; }
        .candidate-details { display: flex; justify-content: space-between; font-size: 12px; color: var(--text-secondary); }
        
        .footer-section { background: var(--footer-bg); padding: 80px 60px 30px 60px; margin-top: 60px; }
        .footer-grid { display: flex; justify-content: space-between; max-width: 1250px; margin: 0 auto; gap: 40px; flex-wrap: wrap; }
        .footer-col-info { flex: 1.5; min-width: 250px; }
        .footer-logo { display: flex; align-items: center; margin-bottom: 20px; }
        .footer-logo-btn { background: transparent; border: none; cursor: pointer; }
        .footer-logo-img { height: 55px; width: auto; }
        .footer-info-text { font-size: 14px; color: var(--text-secondary); line-height: 1.6; max-width: 300px; }
        .footer-col-links { flex: 1; min-width: 180px; }
        .footer-col-title { font-size: 16px; font-weight: 700; color: var(--text-dark); margin-bottom: 22px; }
        .footer-links-list { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 12px; }
        .footer-link-item a { text-decoration: none; color: var(--text-secondary); font-size: 14px; font-weight: 500; cursor: pointer; transition: color 0.3s; }
        .footer-link-item a:hover { color: #53B1E0; }
        .footer-contact-list { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 14px; }
        .footer-contact-item { display: flex; align-items: center; gap: 12px; font-size: 14px; color: var(--text-secondary); }
        .footer-contact-item i { color: #53B1E0; font-size: 15px; width: 15px; text-align: center; }
        .footer-divider { max-width: 1250px; height: 1px; background: var(--border-color); margin: 60px auto 25px auto; }
        .footer-bottom { display: flex; justify-content: space-between; align-items: center; max-width: 1250px; margin: 0 auto; font-size: 13px; color: var(--text-secondary); font-weight: 500; flex-wrap: wrap; gap: 15px; }
        .reset-lang-btn { background: none; border: 1px solid var(--border-color); color: var(--text-secondary); padding: 6px 15px; border-radius: 20px; cursor: pointer; font-size: 12px; display: flex; align-items: center; gap: 6px; transition: all 0.3s; }
        .reset-lang-btn:hover { border-color: #53B1E0; color: #53B1E0; }
        
        .admin-portal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: var(--bg-primary); z-index: 10002; overflow-y: auto; }
        .admin-portal-header { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 20px 40px; display: flex; justify-content: space-between; align-items: center; }
        .admin-portal-title { color: white; font-size: 20px; font-weight: 700; }
        .admin-portal-close { background: rgba(255,255,255,0.1); border: none; color: white; padding: 8px 20px; border-radius: 8px; cursor: pointer; transition: all 0.3s; }
        .admin-portal-close:hover { background: rgba(255,255,255,0.2); }
        .admin-portal-content { padding: 40px; max-width: 1400px; margin: 0 auto; }
        .admin-welcome { background: var(--bg-secondary); border-radius: 16px; padding: 25px 30px; margin-bottom: 30px; border: 1px solid var(--border-color); }
        .admin-badge { display: inline-block; background: #53B1E0; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; margin-top: 10px; }
        .admin-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 40px; }
        .admin-stat-card { background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 16px; padding: 25px; text-align: center; }
        .admin-stat-card i { font-size: 40px; color: #53B1E0; margin-bottom: 15px; }
        .admin-stat-card h3 { font-size: 32px; font-weight: 700; color: var(--text-dark); margin: 0; }
        .users-section { background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 16px; margin-bottom: 30px; overflow: hidden; }
        .users-header { padding: 20px 25px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; background: var(--bg-secondary); }
        .add-user-btn { background: #8b5cf6; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600; transition: all 0.3s; }
        .admin-candidates-table { background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 16px; overflow-x: auto; }
        .admin-table-header { padding: 20px 25px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; background: var(--bg-secondary); }
        .admin-add-btn { background: #10b981; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600; transition: all 0.3s; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 14px 16px; text-align: left; border-bottom: 1px solid var(--border-color); color: var(--text-dark); }
        th { background: var(--bg-secondary); font-weight: 600; }
        .admin-edit-btn, .admin-delete-btn, .delete-user-btn { padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600; margin: 0 3px; border: none; transition: all 0.3s; }
        .admin-edit-btn { background: #53B1E0; color: white; }
        .admin-delete-btn, .delete-user-btn { background: #ef4444; color: white; }
        
        .login-modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 10001; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(5px); }
        .login-container { background: var(--bg-primary); border-radius: 24px; padding: 40px; max-width: 420px; width: 90%; position: relative; }
        .login-close { position: absolute; top: 20px; right: 20px; background: none; border: none; font-size: 28px; cursor: pointer; color: var(--text-secondary); }
        .login-icon { text-align: center; font-size: 48px; color: #53B1E0; margin-bottom: 10px; }
        .login-title { text-align: center; font-size: 24px; font-weight: 700; color: var(--text-dark); margin-bottom: 5px; }
        .login-subtitle { text-align: center; color: var(--text-secondary); margin-bottom: 25px; }
        .login-input-group { margin-bottom: 20px; }
        .login-input-group label { display: block; margin-bottom: 8px; font-weight: 500; color: var(--text-dark); }
        .login-input-group input { width: 100%; padding: 12px 15px; border-radius: 10px; border: 1px solid var(--border-color); background: var(--input-bg); color: var(--text-dark); }
        .login-btn { width: 100%; padding: 14px; background: #53B1E0; color: white; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; transition: all 0.3s; }
        .login-btn:hover { background: #3fa3d4; transform: translateY(-1px); }
        .login-error { background: rgba(239,68,68,0.1); color: #ef4444; padding: 12px; border-radius: 10px; font-size: 13px; text-align: center; margin-top: 15px; display: none; }
        .login-error.show { display: block; }
        
        .candidate-modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 10003; display: none; align-items: center; justify-content: center; backdrop-filter: blur(5px); overflow-y: auto; }
        .candidate-modal.active { display: flex; }
        .candidate-form-container { background: var(--bg-primary); border-radius: 24px; max-width: 800px; width: 90%; max-height: 90vh; overflow-y: auto; margin: 20px; }
        .candidate-form-header { padding: 25px 30px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; background: var(--bg-secondary); border-radius: 24px 24px 0 0; }
        .candidate-form-header h2 { font-size: 20px; font-weight: 700; color: var(--text-dark); margin: 0; }
        .candidate-form-close { background: none; border: none; font-size: 28px; cursor: pointer; color: var(--text-secondary); }
        .candidate-form-body { padding: 30px; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
        .form-group { display: flex; flex-direction: column; gap: 8px; }
        .form-group label { font-weight: 600; color: var(--text-dark); font-size: 13px; }
        .form-group select, .form-group input, .form-group textarea { width: 100%; padding: 12px 15px; border-radius: 10px; border: 1px solid var(--border-color); background: var(--input-bg); color: var(--text-dark); }
        .form-actions { display: flex; gap: 15px; margin-top: 30px; }
        .btn-save { background: #10b981; color: white; border: none; padding: 14px 28px; border-radius: 12px; font-size: 15px; font-weight: 600; cursor: pointer; flex: 1; transition: all 0.3s; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .btn-save:hover:not(:disabled) { background: #059669; transform: translateY(-1px); }
        .btn-cancel { background: #ef4444; color: white; border: none; padding: 14px 28px; border-radius: 12px; font-size: 15px; font-weight: 600; cursor: pointer; flex: 1; transition: all 0.3s; }
        .btn-cancel:hover { background: #dc2626; transform: translateY(-1px); }
        
        .contact-wrapper { padding: 140px 60px 80px 60px; max-width: 1300px; margin: 0 auto; }
        .contact-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 50px; margin-top: 40px; }
        .contact-left-card { background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 24px; padding: 40px; }
        .contact-form-title { font-size: 24px; font-weight: 700; color: var(--text-dark); margin-bottom: 10px; }
        .contact-form-desc { color: var(--text-secondary); margin-bottom: 30px; }
        .form-row-two { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
        .form-label { font-weight: 600; color: var(--text-dark); margin-bottom: 6px; display: block; }
        .btn-submit-form { width: 100%; padding: 14px; background: #53B1E0; color: white; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; margin-top: 20px; transition: all 0.3s; }
        .btn-submit-form:hover { background: #3fa3d4; transform: translateY(-1px); }
        .contact-right-details { display: flex; flex-direction: column; gap: 25px; }
        .map-embed-holder iframe { width: 100%; height: 280px; border-radius: 20px; border: 1px solid var(--border-color); }
        .info-strip-card { display: flex; align-items: center; gap: 18px; background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 18px; padding: 20px 25px; transition: all 0.3s; }
        .info-strip-card:hover { transform: translateX(5px); border-color: #53B1E0; }
        .info-strip-icon { width: 50px; height: 50px; background: rgba(83,177,224,0.1); border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 22px; color: #53B1E0; }
        .info-strip-title { font-size: 14px; font-weight: 600; color: var(--text-secondary); margin-bottom: 4px; }
        .info-strip-value { font-size: 15px; font-weight: 600; color: var(--text-dark); }
        
        .about-wrapper { padding: 140px 60px 80px 60px; max-width: 1300px; margin: 0 auto; }
        .about-split-hero { display: flex; align-items: center; gap: 60px; margin-bottom: 90px; flex-wrap: wrap; }
        .about-hero-graphic { flex: 1; position: relative; display: flex; justify-content: center; align-items: center; }
        .graphic-box-container { width: 100%; max-width: 480px; height: 420px; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); border-radius: 24px; position: relative; box-shadow: 0 20px 40px rgba(15,23,42,0.15); overflow: hidden; display: flex; align-items: center; justify-content: center; }
        .graphic-icon-center { font-size: 90px; color: #53B1E0; animation: floatingGlow 4s ease-in-out infinite; }
        @keyframes floatingGlow { 0%,100% { transform: translateY(0px); opacity: 1; } 50% { transform: translateY(-10px); opacity: 0.8; } }
        .floating-accent-card { position: absolute; bottom: -20px; right: 10px; background: var(--bg-primary); border-radius: 16px; padding: 20px 25px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); border: 1px solid var(--border-color); display: flex; align-items: center; gap: 15px; }
        .about-hero-text { flex: 1.2; }
        .about-tagline { font-size: 13px; font-weight: 700; color: #53B1E0; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 20px; display: flex; align-items: center; gap: 8px; }
        .about-main-title { font-size: 42px; font-weight: 800; color: var(--text-dark); line-height: 1.2; margin-bottom: 25px; }
        .about-paragraph { font-size: 16px; color: var(--text-secondary); line-height: 1.7; margin-bottom: 20px; }
        .pillars-grid { display: flex; gap: 25px; flex-wrap: wrap; justify-content: center; }
        .pillar-card { background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 20px; padding: 40px 30px; width: 360px; transition: all 0.4s; }
        .pillar-card:hover { transform: translateY(-6px); box-shadow: 0 12px 30px rgba(0,0,0,0.08); }
        .pillar-icon-box { width: 55px; height: 55px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 22px; margin-bottom: 25px; }
        .pillar-blue { background: rgba(83,177,224,0.1); color: #53B1E0; }
        .pillar-gold { background: rgba(83,177,224,0.1); color: #2c93c4; }
        .pillar-purple { background: rgba(139,92,246,0.08); color: #8b5cf6; }
        .pillar-title { font-size: 19px; font-weight: 700; color: var(--text-dark); margin-bottom: 14px; }
        .pillar-desc { font-size: 14.5px; color: var(--text-secondary); line-height: 1.6; }
        .about-history-banner { background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%); border-radius: 24px; padding: 50px 60px; display: flex; align-items: center; justify-content: space-between; gap: 40px; border: 1px solid var(--border-color); flex-wrap: wrap; margin-top: 60px; }
        .history-badge-year { background: var(--text-dark); color: #ffffff; padding: 15px 35px; border-radius: 14px; text-align: center; }
        
        @media (max-width: 768px) { 
          .nav-links, .nav-actions { display: none; } 
          .menu-toggle { display: flex; } 
          .navbar { padding: 15px 20px; } 
          .navbar.scrolled { padding: 10px 20px; }
          .hero-container { padding: 0 30px; } 
          .hero-title { font-size: 48px; } 
          .service-card, .candidate-card, .why-card { width: 100%; } 
          .stats-grid { flex-direction: column; gap: 40px; }
          .services-section, .why-choose-section { padding: 60px 20px; }
          .directory-container, .contact-wrapper, .about-wrapper { padding: 120px 20px 60px 20px; }
          .contact-grid { grid-template-columns: 1fr; }
          .form-row, .form-row-two { grid-template-columns: 1fr; }
          .footer-section { padding: 60px 20px 30px 20px; }
          .notification { min-width: 280px; max-width: 90%; }
          .cv-popup-container { width: 95%; height: 90%; }
        }
      `}</style>

      {/* CV POPUP MODAL */}
      {cvPopupOpen && (
        <div className="cv-popup-overlay" onClick={closeCVPopup}>
          <div className="cv-popup-container" onClick={(e) => e.stopPropagation()}>
            <div className="cv-popup-header">
              <div className="cv-popup-title">
                <i className="fa-solid fa-file-pdf"></i> {cvPopupName} - Curriculum Vitae
              </div>
              <button className="cv-popup-close" onClick={closeCVPopup}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="cv-popup-body">
              <iframe 
                src={`${cvPopupUrl}#toolbar=0&navpanes=0`}
                className="cv-iframe"
                title={`${cvPopupName} - CV`}
              />
            </div>
            <div className="cv-popup-footer">
              <button className="cv-download-btn" onClick={() => downloadCVFile(cvPopupUrl, cvPopupName)}>
                <i className="fa-solid fa-download"></i> Download CV
              </button>
              <button className="cv-close-btn" onClick={closeCVPopup}>
                <i className="fa-solid fa-times"></i> Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NOTIFICATIONS */}
      <div className="notification-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`notification ${toast.type}`}>
            <div className="notification-content">
              <div className="notification-icon">
                {toast.type === 'success' && <i className="fa-solid fa-circle-check"></i>}
                {toast.type === 'error' && <i className="fa-solid fa-circle-exclamation"></i>}
                {toast.type === 'warning' && <i className="fa-solid fa-triangle-exclamation"></i>}
                {toast.type === 'info' && <i className="fa-solid fa-circle-info"></i>}
              </div>
              <div className="notification-text">
                <div className="notification-title">{toast.title}</div>
                <div className="notification-message">{toast.message}</div>
              </div>
              <button 
                className="notification-close" 
                onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* LOGIN MODAL */}
      <div className="login-modal" id="login-modal" style={{ display: loginModalOpen ? 'flex' : 'none' }}>
        <div className="login-container">
          <button className="login-close" onClick={closeLoginModal}>&times;</button>
          <div className="login-icon"><i className="fa-solid fa-shield-halved"></i></div>
          <h2 className="login-title">{t.admin_login_title}</h2>
          <div className="login-input-group"><label>{t.admin_username}</label><input type="text" id="login-username" placeholder="Enter username" /></div>
          <div className="login-input-group"><label>{t.admin_password}</label><input type="password" id="login-password" placeholder="Enter password" /></div>
          <button className="login-btn" onClick={validateLogin}>{t.admin_login} <i className="fa-solid fa-arrow-right"></i></button>
          <div className="login-error" id="login-error">{t.admin_invalid}</div>
        </div>
      </div>

      {/* ADD USER MODAL */}
      {addUserModalOpen && (
        <div className="candidate-modal active" id="add-user-modal">
          <div className="candidate-form-container" style={{ maxWidth: '500px' }}>
            <div className="candidate-form-header"><h2><i className="fa-solid fa-user-plus"></i> {t.add_user_title}</h2><button className="candidate-form-close" onClick={() => setAddUserModalOpen(false)}>&times;</button></div>
            <div className="candidate-form-body">
              <div className="form-group"><label><i className="fa-solid fa-user"></i> {t.add_user_username}</label><input type="text" className="form-input" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} placeholder="Enter username" required /></div>
              <div className="form-group"><label><i className="fa-solid fa-lock"></i> {t.add_user_password}</label><input type="password" className="form-input" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter password" required /></div>
              <div className="form-group"><label><i className="fa-solid fa-tag"></i> {t.add_user_role}</label><select className="form-input" value={newRole} onChange={(e) => setNewRole(e.target.value)}><option value="Normal User">{t.add_user_normal}</option><option value="Super User">{t.add_user_super}</option></select></div>
              <div className="form-actions"><button className="btn-cancel" onClick={() => setAddUserModalOpen(false)}>{t.add_user_cancel}</button><button className="btn-save" onClick={addNewUser}><i className="fa-solid fa-user-plus"></i> {t.add_user_submit}</button></div>
            </div>
          </div>
        </div>
      )}

      {/* ADD CANDIDATE MODAL */}
      <div className="candidate-modal" id="candidate-modal">
        <div className="candidate-form-container">
          <div className="candidate-form-header"><h2><i className="fa-solid fa-user-plus"></i> {editTalent ? t.edit_candidate : t.new_candidate}</h2><button className="candidate-form-close" onClick={closeCandidateModal}>&times;</button></div>
          <div className="candidate-form-body">
            <form onSubmit={handleAddCandidateSubmit}>
              <div className="form-row"><div className="form-group"><label><i className="fa-solid fa-user"></i> {t.full_name}</label><input type="text" id="candidate-name" ref={el => nameRef = el} required /></div><div className="form-group"><label><i className="fa-solid fa-calendar"></i> {t.date_of_birth}</label><input type="date" id="candidate-dob" ref={el => dobRef = el} required /></div></div>
              <div className="form-row"><div className="form-group"><label><i className="fa-solid fa-venus-mars"></i> {t.gender}</label><select id="candidate-gender" ref={el => genderRef = el}><option>Male</option><option>Female</option></select></div><div className="form-group"><label><i className="fa-solid fa-ring"></i> {t.marital_status}</label><select id="candidate-marital" ref={el => maritalStatusRef = el}><option>Single</option><option>Married</option><option>Divorced</option><option>Widowed</option></select></div></div>
              <div className="form-row"><div className="form-group"><label><i className="fa-solid fa-briefcase"></i> {t.job_designation}</label><select id="candidate-role" ref={el => jobRef = el}><option>Driver</option><option>Baby sitting</option><option>Nurse</option><option>Cook</option><option>Domestic Worker</option><option>Teacher</option><option>House Maid</option></select></div><div className="form-group"><label><i className="fa-solid fa-globe"></i> {t.country}</label><select id="candidate-country" ref={el => countryRef = el}><option>Indonesia</option><option>Sri Lanka</option><option>Philippines</option><option>Bangladesh</option><option>India</option><option>Ethiopia</option></select></div></div>
              <div className="form-row"><div className="form-group"><label><i className="fa-solid fa-pray"></i> {t.religion}</label><select id="candidate-religion" ref={el => religionRef = el}><option>Muslim</option><option>Christian</option><option>Hindu</option><option>Buddhist</option></select></div><div className="form-group"><label><i className="fa-solid fa-money-bill"></i> {t.salary_qar}</label><input type="number" id="candidate-salary" ref={el => salaryRef = el} required /></div></div>
              <div className="form-row"><div className="form-group"><label><i className="fa-solid fa-chart-line"></i> {t.experience}</label><select id="candidate-experience" ref={el => experienceRef = el}><option>0-1 Year</option><option>1-2 Years</option><option>2-3 Years</option><option>3-4 Years</option><option>4-5 Years</option><option>5-7 Years</option><option>7-10 Years</option><option>10+ Years</option></select></div><div className="form-group"><label><i className="fa-solid fa-users"></i> {t.worker_type}</label><select id="candidate-type" ref={el => workerTypeRef = el}><option>Recruitment Workers</option><option>Returned Housemaids</option></select></div></div>
              <div className="form-group"><label><i className="fa-solid fa-image"></i> {t.photo}</label><div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}><input type="file" accept="image/*" onChange={handlePhotoChange} ref={el => picRef = el} /><button type="button" onClick={clearPhoto} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>Clear</button></div>{photoPreview && <img src={photoPreview} style={{ width: '50px', height: '50px', borderRadius: '50%', marginTop: '10px', objectFit: 'cover' }} alt="Preview" />}</div>
              <div className="form-group"><label><i className="fa-solid fa-file-pdf"></i> {t.cv_label}</label><div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}><input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleCVChange} ref={el => cvRef = el} /><button type="button" onClick={clearCV} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>Clear</button>{cvFileName && <span style={{ fontSize: '12px' }}>{cvFileName}</span>}</div></div>
              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={closeCandidateModal} disabled={isSubmitting}>{t.cancel}</button>
                <button type="submit" className="btn-save" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <span className="spinner"></span> {t.saving}
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-save"></i> {t.save}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* PROFILE MODAL */}
      <div className="candidate-modal" id="profile-modal">
        <div className="candidate-form-container" style={{ maxWidth: '750px' }}>
          <div className="candidate-form-header">
            <h2><i className="fa-solid fa-id-card"></i> Candidate Profile</h2>
            <button className="candidate-form-close" onClick={closeProfileModal}>&times;</button>
          </div>
          <div className="candidate-form-body">
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '25px', paddingBottom: '20px', borderBottom: '1px solid var(--border-color)' }}>
              <div id="profile-photo-container" style={{ flexShrink: 0 }}>
                <div style={{ width: '80px', height: '80px', background: 'var(--bg-tertiary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="fa-regular fa-user fa-2x"></i>
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span id="profile-candidate-status" className="status-badge" style={{ position: 'relative', top: 0, right: 0, display: 'inline-block' }}>Available</span>
                  <a id="profile-cv-link" href="#" target="_blank" style={{ background: '#53B1E0', color: 'white', padding: '6px 12px', borderRadius: '6px', textDecoration: 'none', fontSize: '12px', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <i className="fa-solid fa-file-pdf"></i> View Full CV
                  </a>
                </div>
              </div>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#53B1E0', marginBottom: '15px', borderLeft: '3px solid #53B1E0', paddingLeft: '10px' }}>
                <i className="fa-solid fa-user-circle"></i> Personal Information
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group"><label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>Full Name</label><input type="text" id="profile-candidate-name" className="form-input" readOnly style={{ background: 'var(--bg-tertiary)' }} /></div>
                <div className="form-group"><label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>Date of Birth</label><input type="text" id="profile-candidate-dob" className="form-input" readOnly style={{ background: 'var(--bg-tertiary)' }} /></div>
                <div className="form-group"><label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>Gender</label><input type="text" id="profile-candidate-gender" className="form-input" readOnly style={{ background: 'var(--bg-tertiary)' }} /></div>
                <div className="form-group"><label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>Marital Status</label><input type="text" id="profile-candidate-marital" className="form-input" readOnly style={{ background: 'var(--bg-tertiary)' }} /></div>
              </div>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#53B1E0', marginBottom: '15px', borderLeft: '3px solid #53B1E0', paddingLeft: '10px' }}>
                <i className="fa-solid fa-briefcase"></i> Professional Information
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group"><label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>Job Designation</label><input type="text" id="profile-candidate-role" className="form-input" readOnly style={{ background: 'var(--bg-tertiary)' }} /></div>
                <div className="form-group"><label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>Country</label><input type="text" id="profile-candidate-country" className="form-input" readOnly style={{ background: 'var(--bg-tertiary)' }} /></div>
                <div className="form-group"><label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>Religion</label><input type="text" id="profile-candidate-religion" className="form-input" readOnly style={{ background: 'var(--bg-tertiary)' }} /></div>
                <div className="form-group"><label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>Salary (QAR)</label><input type="text" id="profile-candidate-salary" className="form-input" readOnly style={{ background: 'var(--bg-tertiary)' }} /></div>
                <div className="form-group"><label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>Experience</label><input type="text" id="profile-candidate-experience" className="form-input" readOnly style={{ background: 'var(--bg-tertiary)' }} /></div>
                <div className="form-group"><label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>Worker Type</label><input type="text" id="profile-candidate-workertype" className="form-input" readOnly style={{ background: 'var(--bg-tertiary)' }} /></div>
              </div>
            </div>
            
            <div className="form-actions" style={{ marginTop: '25px', gap: '15px', flexDirection: 'row' }}>
              <button type="button" className="action-btn view-cv-btn" onClick={() => { const modalEl = document.getElementById('profile-modal'); const cvUrl = modalEl?.getAttribute('data-candidate-cv'); const name = modalEl?.getAttribute('data-candidate-name'); if (cvUrl && cvUrl !== '') { openCVPopup(cvUrl, name); } else { addStyledNotification('info', 'No CV', 'No CV available for this candidate'); } }} style={{ flex: 1 }}><i className="fa-solid fa-eye"></i> View CV</button>
              <button type="button" className="action-btn download-cv-btn" onClick={() => { const modalEl = document.getElementById('profile-modal'); const cvUrl = modalEl?.getAttribute('data-candidate-cv'); const name = modalEl?.getAttribute('data-candidate-name'); if (cvUrl && cvUrl !== '') { downloadCVFile(cvUrl, name); } else { addStyledNotification('info', 'No CV', 'No CV available for this candidate'); } }} style={{ flex: 1 }}><i className="fa-solid fa-download"></i> Download CV</button>
              <button type="button" className="action-btn hire-btn" onClick={async () => { const modalEl = document.getElementById('profile-modal'); const id = modalEl?.getAttribute('data-candidate-id'); const name = modalEl?.getAttribute('data-candidate-name'); if (confirm(`Are you sure you want to inquire about ${name}? You will be redirected to WhatsApp.`)) { hireCandidateWhatsApp(id, name); closeProfileModal(); } }} style={{ flex: 1 }}><i className="fa-brands fa-whatsapp"></i> Inquire Now</button>
            </div>
            <div className="form-actions" style={{ marginTop: '15px' }}>
              <button type="button" className="btn-cancel" onClick={closeProfileModal} style={{ width: '100%' }}>Close</button>
            </div>
          </div>
        </div>
      </div>

      {/* ADMIN PORTAL */}
      {adminActive && (
        <div className="admin-portal active">
          <div className="admin-portal-header">
            <div className="admin-portal-title"><i className="fa-solid fa-gauge-high"></i> {t.admin_dashboard}</div>
            <button className="admin-portal-close" onClick={closeAdminPortal}>Close <i className="fa-solid fa-xmark"></i></button>
          </div>
          <div className="admin-portal-content">
            <div className="admin-welcome">
              <h2>Welcome, {currentAdminUser?.username}!</h2>
              <p>You have access to manage candidates, view statistics, and control website content.</p>
              <div className="admin-badge">{currentAdminUser?.role}</div>
            </div>
            <div className="admin-stats">
              <div className="admin-stat-card"><i className="fa-solid fa-users"></i><h3>{talents.length}</h3><p>{t.total_candidates}</p></div>
              <div className="admin-stat-card"><i className="fa-solid fa-user-check"></i><h3>{talents.filter(c => c.status === 'Available').length}</h3><p>{t.available_candidates}</p></div>
              <div className="admin-stat-card"><i className="fa-solid fa-user-clock"></i><h3>{talents.filter(c => c.status === 'Hired').length}</h3><p>{t.hired_candidates}</p></div>
            </div>
            {currentAdminUser?.role === 'Super User' && (
              <div id="users-section" className="users-section">
                <div className="users-header">
                  <h3><i className="fa-solid fa-users-gear"></i> {t.manage_users}</h3>
                  <button className="add-user-btn" onClick={() => setAddUserModalOpen(true)}><i className="fa-solid fa-user-plus"></i> {t.add_new_user}</button>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table className="users-table">
                    <thead>
                      <tr><th>Username</th><th>Password</th><th>Role</th><th>Actions</th></tr>
                    </thead>
                    <tbody id="users-table-body"></tbody>
                  </table>
                </div>
              </div>
            )}
            <div className="admin-candidates-table">
              <div className="admin-table-header">
                <h3><i className="fa-solid fa-database"></i> {t.manage_candidates}</h3>
                <button className="admin-add-btn" onClick={openCandidateModal}><i className="fa-solid fa-plus"></i> {t.add_candidate}</button>
              </div>
              <div>
                <input type="text" placeholder={t.search_placeholder} className="form-input" style={{ margin: '15px 20px', width: 'calc(100% - 40px)' }} value={adminSearchQuery} onChange={(e) => setAdminSearchQuery(e.target.value)} />
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table id="admin-candidates-table">
                  <thead>
                    <tr><th>Name</th><th>Role</th><th>Country</th><th>Salary</th><th>{t.status}</th><th>{t.actions}</th></tr>
                  </thead>
                  <tbody id="admin-table-body"></tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NAVBAR */}
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`} id="main-navbar">
        <div className="nav-logo">
          <button className="logo-btn" onClick={() => navigateToView('home')}>
            <img src="https://github.com/AshiLara2007/Comming-Soon-Mohannadi-Website-/blob/main/app/Al-Mohannadi-Manpower-removebg-preview.png?raw=true" alt="Logo" className="logo-img" />
          </button>
        </div>
        <ul className="nav-links">
          <li><a className="nav-item" id="nav-home" onClick={() => navigateToView('home')}>{t.home}</a></li>
          <li><a className="nav-item" id="nav-candidates" onClick={() => navigateToView('candidates')}>{t.candidates}</a></li>
          <li><a className="nav-item" id="nav-about" onClick={() => navigateToView('about')}>{t.about}</a></li>
          <li><a className="nav-item" id="nav-contact" onClick={() => navigateToView('contact')}>{t.contact}</a></li>
        </ul>
        <div className="nav-actions">
          <button className="btn-theme" onClick={toggleTheme}>
            <i className={`fa-solid ${currentTheme === 'light' ? 'fa-moon' : 'fa-sun'}`}></i>
            <span>{currentTheme === 'light' ? t.theme_dark : t.theme_light}</span>
          </button>
          <button className="btn-lang" onClick={toggleLanguageFromNavbar}>
            <i className="fa-solid fa-globe"></i> <span>{currentLanguage}</span>
          </button>
          <button className="btn-admin" onClick={openLoginModal}>Admin</button>
        </div>
        <div className="menu-toggle" onClick={toggleSidebar}>
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </div>
      </nav>

      {/* HOME VIEW */}
      <div id="home-view" className="active-view">
        <section className="hero-container">
          <div className="hero-content">
            <div className="location-badge">{t.location_badge}</div>
            <h1 className="hero-title">AL-<span className="highlight">MOHANNADI</span></h1>
            <div className="hero-subtitle">{t.hero_subtitle}</div>
            <p className="hero-description">{t.hero_desc}</p>
            <div className="hero-buttons">
              <button className="btn-primary" onClick={() => navigateToView('candidates')}>{t.hero_btn1} <i className="fa-solid fa-arrow-right"></i></button>
              <button className="btn-secondary" onClick={() => navigateToView('contact')}>{t.hero_btn2}</button>
            </div>
          </div>
        </section>
        <section className="stats-section">
          <div className="stats-grid">
            <div className="stat-item"><div className="stat-icon"><i className="fa-solid fa-users"></i></div><div className="stat-number">500+</div><div className="stat-label">{t.stat1}</div></div>
            <div className="stat-item"><div className="stat-icon"><i className="fa-solid fa-building"></i></div><div className="stat-number">200+</div><div className="stat-label">{t.stat2}</div></div>
            <div className="stat-item"><div className="stat-icon"><i className="fa-solid fa-award"></i></div><div className="stat-number">5+</div><div className="stat-label">{t.stat3}</div></div>
          </div>
        </section>
        <section className="services-section">
          <div className="services-sub">{t.services_sub}</div>
          <h2 className="services-title">{t.services_title}</h2>
          <div className="services-grid">
            <div className="service-card card-maid" onClick={() => quickFilterFromHome('House Maid')}><div className="service-icon-wrapper"><i className="fa-solid fa-house-chimney"></i></div><div className="service-name">{t.service_maid}</div></div>
            <div className="service-card card-driver" onClick={() => quickFilterFromHome('Driver')}><div className="service-icon-wrapper"><i className="fa-solid fa-car-side"></i></div><div className="service-name">{t.service_driver}</div></div>
            <div className="service-card card-nurse" onClick={() => quickFilterFromHome('Nurse')}><div className="service-icon-wrapper"><i className="fa-solid fa-heart-pulse"></i></div><div className="service-name">{t.service_nurse}</div></div>
            <div className="service-card card-cook" onClick={() => quickFilterFromHome('Cook')}><div className="service-icon-wrapper"><i className="fa-solid fa-utensils"></i></div><div className="service-name">{t.service_cook}</div></div>
            <div className="service-card card-teacher" onClick={() => quickFilterFromHome('Teacher')}><div className="service-icon-wrapper"><i className="fa-solid fa-graduation-cap"></i></div><div className="service-name">{t.service_teacher}</div></div>
          </div>
        </section>
        <section className="why-choose-section">
          <div className="why-sub">{t.why_sub}</div>
          <h2 className="why-title">{t.why_title}</h2>
          <div className="why-grid">
            <div className="why-card card-trusted"><div className="why-icon-box"><i className="fa-solid fa-shield-halved"></i></div><div className="why-card-title">{t.why_title1}</div><div className="why-card-desc">{t.why_desc1}</div></div>
            <div className="why-card card-verified"><div className="why-icon-box"><i className="fa-solid fa-user-check"></i></div><div className="why-card-title">{t.why_title2}</div><div className="why-card-desc">{t.why_desc2}</div></div>
            <div className="why-card card-support"><div className="why-icon-box"><i className="fa-solid fa-headset"></i></div><div className="why-card-title">{t.why_title3}</div><div className="why-card-desc">{t.why_desc3}</div></div>
            <div className="why-card card-fast"><div className="why-icon-box"><i className="fa-solid fa-bolt"></i></div><div className="why-card-title">{t.why_title4}</div><div className="why-card-desc">{t.why_desc4}</div></div>
          </div>
        </section>
        <section className="cta-section">
          <div className="cta-container">
            <h2 className="cta-title">{t.cta_title}</h2>
            <p className="cta-desc">{t.hero_desc}</p>
            <button className="btn-cta" onClick={() => navigateToView('contact')}>{t.cta_btn} <i className="fa-solid fa-arrow-right"></i></button>
          </div>
        </section>
      </div>

      {/* CANDIDATES VIEW */}
      <div id="candidates-view">
        <div className="directory-container">
          <div className="directory-header">
            <span className="services-sub">{t.candidates_sub}</span>
            <h2 className="why-title" style={{ textAlign: 'left', marginBottom: '10px' }}>{t.candidates_title}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>Browse through our verified and available candidates database</p>
          </div>
          
          <div className="controls-wrapper">
            <div className="search-input-box">
              <i className="fa-solid fa-magnifying-glass"></i>
              <input type="text" className="directory-search" id="realtime-search-bar" onInput={handleSearchInput} placeholder={t.search_placeholder} />
            </div>
            <div className="returned-switch-container">
              <span className="switch-label">🔄 Returned Workers</span>
              <label className="switch">
                <input type="checkbox" checked={showReturnedOnly} onChange={toggleReturnedFilter} />
                <span className="slider"></span>
              </label>
              {showReturnedOnly && <span className="returned-badge">ACTIVE</span>}
            </div>
          </div>
          
          <div className="filter-header">
            <div className="filter-buttons-list">
              <button className="filter-trigger-btn active" id="btn-cat-All" onClick={() => filterDatabaseCategory('All')}>{t.filter_all}</button>
              <button className="filter-trigger-btn" id="btn-cat-Driver" onClick={() => filterDatabaseCategory('Driver')}><i className="fa-solid fa-car-side"></i> {t.filter_driver}</button>
              <button className="filter-trigger-btn" id="btn-cat-Nurse" onClick={() => filterDatabaseCategory('Nurse')}><i className="fa-solid fa-heart-pulse"></i> {t.filter_nurse}</button>
              <button className="filter-trigger-btn" id="btn-cat-Cook" onClick={() => filterDatabaseCategory('Cook')}><i className="fa-solid fa-utensils"></i> {t.filter_cook}</button>
              <button className="filter-trigger-btn" id="btn-cat-Teacher" onClick={() => filterDatabaseCategory('Teacher')}><i className="fa-solid fa-graduation-cap"></i> {t.filter_teacher}</button>
              <button className="filter-trigger-btn" id="btn-cat-HouseMaid" onClick={() => filterDatabaseCategory('House Maid')}><i className="fa-solid fa-house-chimney"></i> {t.filter_maid}</button>
              <button className="filter-trigger-btn" id="btn-cat-DomesticWorker" onClick={() => filterDatabaseCategory('Domestic Worker')}><i className="fa-solid fa-broom"></i> {t.filter_domestic}</button>
              <button className="filter-trigger-btn" id="btn-cat-Babysitting" onClick={() => filterDatabaseCategory('Baby sitting')}><i className="fa-solid fa-baby-carriage"></i> {t.filter_baby}</button>
            </div>
          </div>
          
          <div className="country-filters" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '25px', marginTop: '10px' }}>
            <button className="filter-trigger-btn country-filter-btn active" id="btn-country-All_Countries" onClick={() => filterByCountry('All Countries')}><i className="fa-solid fa-globe"></i> {t.country_all}</button>
            <button className="filter-trigger-btn country-filter-btn" id="btn-country-Indonesia" onClick={() => filterByCountry('Indonesia')}><i className="fa-solid fa-flag"></i> {t.country_indonesia}</button>
            <button className="filter-trigger-btn country-filter-btn" id="btn-country-India" onClick={() => filterByCountry('India')}><i className="fa-solid fa-flag"></i> {t.country_india}</button>
            <button className="filter-trigger-btn country-filter-btn" id="btn-country-Philippines" onClick={() => filterByCountry('Philippines')}><i className="fa-solid fa-flag"></i> {t.country_philippines}</button>
            <button className="filter-trigger-btn country-filter-btn" id="btn-country-Bangladesh" onClick={() => filterByCountry('Bangladesh')}><i className="fa-solid fa-flag"></i> {t.country_bangladesh}</button>
            <button className="filter-trigger-btn country-filter-btn" id="btn-country-Sri_Lanka" onClick={() => filterByCountry('Sri Lanka')}><i className="fa-solid fa-flag"></i> {t.country_srilanka}</button>
            <button className="filter-trigger-btn country-filter-btn" id="btn-country-Ethiopia" onClick={() => filterByCountry('Ethiopia')}><i className="fa-solid fa-flag"></i> {t.country_ethiopia}</button>
          </div>
          
          <div className="directory-results-counter" id="live-counter-text"><span></span> 0 records discovered inside engine</div>
          <div className="candidates-grid" id="directory-cards-injector"></div>
        </div>
      </div>

      {/* ABOUT VIEW */}
      <div id="about-view">
        <div className="about-wrapper">
          <div className="about-split-hero">
            <div className="about-hero-graphic">
              <div className="graphic-box-container">
                <i className="fa-solid fa-building-columns graphic-icon-center"></i>
              </div>
              <div className="floating-accent-card">
                <div className="floating-card-icon" style={{ width: '45px', height: '45px', borderRadius: '50%', background: 'rgba(16,185,129,0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}><i className="fa-solid fa-circle-check"></i></div>
                <div><div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-dark)' }}>100% Vetted</div><div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '500' }}>Ministry Approved</div></div>
              </div>
            </div>
            <div className="about-hero-text">
              <div className="about-tagline"><span style={{ width: '25px', height: '2px', background: '#53B1E0', display: 'inline-block' }}></span> {t.about_tagline}</div>
              <h2 className="about-main-title">Bridging Opportunity Across Qatar with Trusted Manpower</h2>
              <p className="about-paragraph">Established in Doha, <strong>Al-Mohannadi Manpower</strong> has grown into a leading recruitment partner committed to transforming how households and organizations secure human resource pipelines.</p>
              <p className="about-paragraph">We don't just supply CVs. We thoroughly screen, background-verify, and ethically source experienced talent across diverse domains including domestic support, nursing, and specialized education. Our mission is to match integrity with exceptional domestic care.</p>
            </div>
          </div>
          
          <div className="about-pillars-section" style={{ marginBottom: '80px' }}>
            <div className="section-center-heading" style={{ textAlign: 'center', marginBottom: '50px' }}>
              <span className="services-sub">{t.pillars_sub}</span>
              <h2 className="why-title" style={{ marginBottom: '15px' }}>{t.pillars_title}</h2>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto', fontSize: '15px' }}>{t.pillars_desc}</p>
            </div>
            <div className="pillars-grid">
              <div className="pillar-card"><div className="pillar-icon-box pillar-blue"><i className="fa-solid fa-eye"></i></div><h3 className="pillar-title">{t.vision_title}</h3><p className="pillar-desc">{t.vision_desc}</p></div>
              <div className="pillar-card"><div className="pillar-icon-box pillar-gold"><i className="fa-solid fa-bullseye"></i></div><h3 className="pillar-title">{t.mission_title}</h3><p className="pillar-desc">{t.mission_desc}</p></div>
              <div className="pillar-card"><div className="pillar-icon-box pillar-purple"><i className="fa-solid fa-handshake-angle"></i></div><h3 className="pillar-title">{t.ethical_title}</h3><p className="pillar-desc">{t.ethical_desc}</p></div>
            </div>
          </div>
          
          <div className="about-history-banner">
            <div className="history-left"><h3 style={{ fontSize: '26px', fontWeight: '700', color: 'var(--text-dark)', marginBottom: '10px' }}>{t.history_title}</h3><p style={{ color: 'var(--text-secondary)', fontSize: '15px', maxWidth: '600px', lineHeight: 1.5 }}>{t.history_desc}</p></div>
            <div className="history-badge-year"><div style={{ fontSize: '32px', fontWeight: '800', color: '#53B1E0', lineHeight: 1 }}>2020</div><div style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '4px' }}>{t.history_badge}</div></div>
          </div>
        </div>
      </div>

      {/* CONTACT VIEW WITH EMAILJS */}
      <div id="contact-view">
        <div className="contact-wrapper">
          <div className="directory-header" style={{ marginBottom: '25px' }}>
            <span className="services-sub">Get In Touch</span>
            <h2 className="why-title" style={{ textAlign: 'left', marginBottom: '10px' }}>Contact Us</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>Have questions about pricing, processing times, or custom requests? Our support desk is online.</p>
          </div>
          <div className="contact-grid">
            <div className="contact-left-card">
              <h3 className="contact-form-title">Send a Message</h3>
              <p className="contact-form-desc">Fill out the fast request form below, and our recruitment team will get back to you within 24 hours.</p>
              
              <form id="contact-form" onSubmit={sendEmail}>
                <div className="form-row-two">
                  <div className="form-group">
                    <label className="form-label">First Name</label>
                    <input type="text" name="first_name" className="form-input" placeholder="John" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name</label>
                    <input type="text" name="last_name" className="form-input" placeholder="Doe" required />
                  </div>
                </div>
                <div className="form-row-two">
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input type="email" name="user_email" className="form-input" placeholder="yourname@domain.com" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input type="tel" name="user_phone" className="form-input" placeholder="+974 XXXX XXXX" required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Message / Inquiry Details</label>
                  <textarea name="user_message" className="form-input" placeholder="Type the specific service constraints or recruitment questions you have..." rows="4" required></textarea>
                </div>
                <button 
                  type="submit" 
                  className="btn-submit-form" 
                  id="contact-submit-btn"
                  disabled={isSending}
                  style={{ opacity: isSending ? 0.7 : 1, cursor: isSending ? 'not-allowed' : 'pointer' }}
                >
                  {isSending ? (
                    <>
                      <span className="spinner"></span> Sending...
                    </>
                  ) : (
                    <>
                      Send Message <i className="fa-solid fa-paper-plane"></i>
                    </>
                  )}
                </button>
              </form>
            </div>
            <div className="contact-right-details">
              <div className="map-embed-holder">
                <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d115437.03901977716!2d51.439818451806655!3d25.286576884698504!2m3!1f0!2f0!3f0!3m2!1i1020!2i768!4f13.1!3m3!1m2!1s0x3e45c534ffdce87f%3A0x44d9319f78cfd4b1!2sDoha%2C%20Qatar!5e0!3m2!1sen!2s!4v1716300000000!5m2!1sen!2s" width="100%" height="280" style={{ border: 0, borderRadius: '20px' }} allowFullScreen loading="lazy"></iframe>
              </div>
              <div className="info-strip-card">
                <div className="info-strip-icon"><i className="fa-solid fa-location-dot"></i></div>
                <div>
                  <div className="info-strip-title">Our Main Office</div>
                  <div className="info-strip-value">Doha, Qatar — Al Sadd Area, Commercial Main Street</div>
                </div>
              </div>
              <div className="info-strip-card">
                <div className="info-strip-icon"><i className="fa-solid fa-phone"></i></div>
                <div>
                  <div className="info-strip-title">Phone Matrix Support</div>
                  <div className="info-strip-value">+974 XXXX XXXX (Mobile Support)<br />+974 44XX XXXX (Telephone Office)</div>
                </div>
              </div>
              <div className="info-strip-card">
                <div className="info-strip-icon"><i className="fa-solid fa-envelope"></i></div>
                <div>
                  <div className="info-strip-title">Official Electronic Mail</div>
                  <div className="info-strip-value">info@almohannadi.qa<br />support@almohannadi.qa</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="footer-section">
        <div className="footer-grid">
          <div className="footer-col-info"><div className="footer-logo"><button className="footer-logo-btn" onClick={() => navigateToView('home')}><img src="https://github.com/AshiLara2007/Comming-Soon-Mohannadi-Website-/blob/main/app/Al-Mohannadi-Manpower-removebg-preview.png?raw=true" alt="Logo" className="footer-logo-img" /></button></div><p className="footer-info-text">{t.footer_text}</p></div>
          <div className="footer-col-links"><h3 className="footer-col-title">{t.quick_links}</h3><ul className="footer-links-list"><li className="footer-link-item"><a onClick={() => navigateToView('home')}>{t.home}</a></li><li className="footer-link-item"><a onClick={() => navigateToView('candidates')}>{t.candidates}</a></li><li className="footer-link-item"><a onClick={() => navigateToView('about')}>{t.about}</a></li><li className="footer-link-item"><a onClick={() => navigateToView('contact')}>{t.contact}</a></li></ul></div>
          <div className="footer-col-links"><h3 className="footer-col-title">{t.contact_us}</h3><ul className="footer-contact-list"><li className="footer-contact-item"><i className="fa-solid fa-location-dot"></i> <span>{t.address}</span></li><li className="footer-contact-item"><i className="fa-solid fa-phone"></i> <span>{t.phone}</span></li><li className="footer-contact-item"><i className="fa-solid fa-envelope"></i> <span>{t.email}</span></li><li className="footer-contact-item"><i className="fa-solid fa-globe"></i> <span>www.almohannadi.qa</span></li></ul></div>
        </div>
        <div className="footer-divider"></div>
        <div className="footer-bottom"><span>{t.copyright}</span><span>Doha, Qatar • Est. 2020</span><button className="reset-lang-btn" onClick={resetLanguagePreference}><i className="fa-solid fa-language"></i> <span>{t.reset_lang}</span></button></div>
      </footer>
    </div>
  );
}