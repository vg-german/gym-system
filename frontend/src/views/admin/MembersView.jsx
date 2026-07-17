import React, { useState, useEffect, useCallback, useRef } from 'react';
import api from '../../services/axios';

const MODEL_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/';

const MembersView = () => {
  // --- TABLE STATE ---
  const [members, setMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 5;

  // --- MODAL STATE---
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    age: '',
    gender: 'Male',
    address: ''
  });

  // --- MODAL CONFIRMATION STATE  ---
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // --- SUBSCRIPTION RENEW STATE---
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [selectedMemberForRenew, setSelectedMemberForRenew] = useState(null);
  const [activePlans, setActivePlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [renewLoading, setRenewLoading] = useState(false);

  // --- FACE ID STATE ---
  const [isFaceModalOpen, setIsFaceModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [faceApiReady, setFaceApiReady] = useState(false);
  const [biometricStatus, setBiometricStatus] = useState('Initializing models...');
  const [cameraStream, setCameraStream] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  const videoRef = useRef(null);

  // --- LOAD FACE-API ---
  useEffect(() => {
    let active = true;
    const initBiometrics = async () => {
      try {
        const faceapi = await loadFaceApiScript();
        
        if (
          !faceapi.nets.ssdMobilenetv1.isLoaded ||
          !faceapi.nets.faceLandmark68Net.isLoaded ||
          !faceapi.nets.faceRecognitionNet.isLoaded
        ) {
          await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
          await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
          await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
        }
        
        if (active) {
          setFaceApiReady(true);
          setBiometricStatus('AI Engine Ready. Choose capture method:');
        }
      } catch (err) {
        console.error("Biometric init error:", err);
        if (active) setBiometricStatus('❌ Failed to load AI face detection models.');
      }
    };

    initBiometrics();
    return () => { active = false; };
  }, []);

  const loadFaceApiScript = () => {
    return new Promise((resolve, reject) => {
      if (window.faceapi) return resolve(window.faceapi);
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js';
      script.async = true;
      script.onload = () => resolve(window.faceapi);
      script.onerror = () => reject(new Error('Failed to load face-api.js'));
      document.head.appendChild(script);
    });
  };

  // --- GET MEMBERS ---
  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/members', {
        params: {
          page: page,
          limit: pageSize,
          search: searchTerm.trim() || undefined
        }
      });
      const { items, total_pages, total_items } = response.data;
      setMembers(items || []);
      setTotalPages(total_pages || 1);
      setTotalCount(total_items || 0);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Could not retrieve the members directory.");
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // --- GET ACVTIVE MEMBERSHIPS ---
  const fetchActivePlans = async () => {
    try {
      
      const response = await api.get('/memberships');
      
      const activeOnly = (response.data || []).filter(plan => plan.status === 'Active');
      setActivePlans(activeOnly);
      if (activeOnly.length > 0) {
        setSelectedPlanId(activeOnly[0].id); 
      }
    } catch (err) {
      console.error("Error fetching active memberships:", err);
      alert("Could not load membership plans.");
    }
  };

  // --- CRUD OPERATIONS ---
  const handleOpenCreateModal = () => {
    setEditingMember(null);
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone_number: '',
      age: '',
      gender: 'Male',
      address: ''
    });
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (member) => {
    setEditingMember(member);
    setFormData({
      first_name: member.first_name || '',
      last_name: member.last_name || '',
      email: member.email || '',
      phone_number: member.phone_number || '',
      age: member.age || '',
      gender: member.gender || 'Male',
      address: member.address || ''
    });
    setIsFormModalOpen(true);
  };

  const handleSaveMember = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      age: formData.age ? parseInt(formData.age, 10) : null
    };

    try {
      if (editingMember) {
        await api.put(`/members/${editingMember.id}`, payload);
        setSuccessMessage('Member profile has been successfully updated!');
      } else {
        await api.post('/members', payload);
        setSuccessMessage('New member profile has been registered successfully!');
      }
      setIsFormModalOpen(false);
      setIsSuccessModalOpen(true);
      fetchMembers();
    } catch (err) {
      alert(err.response?.data?.detail || "An error occurred.");
    }
  };

  const handleConfirmDrop = (member) => {
    setMemberToDelete(member);
    setIsConfirmDeleteOpen(true);
  };

  const handleDropMember = async () => {
    if (!memberToDelete) return;
    try {
      await api.delete(`/members/${memberToDelete.id}`);
      setIsConfirmDeleteOpen(false);
      setMemberToDelete(null);
      fetchMembers();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to drop member.");
      setIsConfirmDeleteOpen(false);
      setMemberToDelete(null);
    }
  };

  // --- RENEW ACTIONS ---
  const handleOpenRenewModal = async (member) => {
    setSelectedMemberForRenew(member);
    setIsRenewModalOpen(true);
    await fetchActivePlans();
  };

  const handleConfirmRenew = async () => {
    if (!selectedMemberForRenew || !selectedPlanId) return;
    
    setRenewLoading(true);
    try {
      const response = await api.post('subscriptions/purchase', {
        member_id: selectedMemberForRenew.id,
        membership_id: parseInt(selectedPlanId, 10) 
      });

      setIsRenewModalOpen(false);
      setSuccessMessage(response.data?.message || `Membership successfully renewed for ${selectedMemberForRenew.first_name}!`);
      setIsSuccessModalOpen(true);
      fetchMembers(); 
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to purchase/renew membership.");
    } finally {
      setRenewLoading(false);
    }
  };

  // --- CAMERA & FACE PROCESSING ---

  const handleOpenFaceScan = (member) => {
    setSelectedMember(member);
    setIsFaceModalOpen(true);
    if (faceApiReady) {
      setBiometricStatus('Ready. Select file or toggle camera.');
    }
  };

  const closeFaceModal = () => {
    stopCamera();
    setIsFaceModalOpen(false);
    setSelectedMember(null);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 } 
      });
      setCameraStream(stream);
      setIsCameraActive(true);
      setBiometricStatus('Camera feed active. Look directly at the lens.');
    } catch (err) {
      console.error("Camera access denied or error:", err);
      setBiometricStatus('Could not access web camera. Ensure permissions are granted.');
    }
  };

  useEffect(() => {
    if (isCameraActive && cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
      videoRef.current.play().catch(err => {
        console.error("Error starting video playback:", err);
      });
    }
  }, [isCameraActive, cameraStream]);

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    processImageSource(file);
  };

  const captureCameraSnapshot = async () => {
    if (!videoRef.current || !cameraStream) return;
    
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    canvas.toBlob((blob) => {
      const file = new File([blob], "snapshot.jpg", { type: "image/jpeg" });
      processImageSource(file);
    }, 'image/jpeg');
  };

  const processImageSource = async (imageFile) => {
    setBiometricStatus('Extracting facial vectors... Keep steady.');
    const faceapi = window.faceapi;

    try {
      const img = await faceapi.bufferToImage(imageFile);
      const detection = await faceapi.detectSingleFace(img)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        setBiometricStatus('No face detected. Adjust lighting or try another image.');
        return;
      }

      const embedding = Array.from(detection.descriptor);
      setBiometricStatus('Vector generated. Syncing with secure backend...');

      const response = await api.put(`/members/${selectedMember.id}/register-face`, {
        face_embedding: embedding
      });

      if (response.status === 200) {
        setBiometricStatus('Face ID securely registered in Supabase!');
        stopCamera();
        setTimeout(() => {
          closeFaceModal();
          fetchMembers();
        }, 1500);
      } else {
        setBiometricStatus('Error during database write.');
      }
    } catch (err) {
      console.error(err);
      setBiometricStatus(`Error: ${err.response?.data?.detail || err.message}`);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-lg font-black tracking-tight uppercase">Members Directory</h1>
          <p className="text-sm text-zinc-400 mt-1">Manage client profiles, subscriptions, and Face ID enrollment.</p>
        </div>
        <button 
          onClick={handleOpenCreateModal}
          className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs uppercase tracking-wider px-4 py-3 rounded-xl transition-colors shadow-lg self-start md:self-auto"
        >
          + Add New Member
        </button>
      </div>

      {/* SEARCH */}
      <div className="w-full max-w-md flex items-center space-x-3">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(1);
          }}
          className="w-full bg-zinc-900 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
        />
        {loading && <span className="text-xs text-zinc-500 animate-pulse">Syncing...</span>}
      </div>

      {/* Table Container */}
      <div className="bg-zinc-900 rounded-2xl border border-white/5 p-6 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 text-zinc-500 text-[10px] font-bold uppercase tracking-wider">
              <th className="pb-3"> </th>
              <th className="pb-3">First Name</th>
              <th className="pb-3">Last Name</th>
              <th className="pb-3">Email</th>
              <th className="pb-3">Phone Number</th>
              <th className="pb-3">Age</th>
              <th className="pb-3">Gender</th>
              <th className="pb-3">Address</th>
              <th className="pb-3">Join Date</th>
              <th className="pb-3">Face ID Status</th>
              <th className="pb-3">Subscription</th>
              <th className="pb-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-[10px] text-zinc-300">
            {error ? (
              <tr>
                <td colSpan="12" className="py-8 text-center text-rose-400 font-medium">{error}</td>
              </tr>
            ) : members.length === 0 ? (
              <tr>
                <td colSpan="12" className="py-8 text-center text-zinc-500 font-medium">
                  {loading ? 'Reading secure database...' : 'No gym members found matching the criteria.'}
                </td>
              </tr>
            ) : (
              members.map((member) => (
                <tr key={member.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="py-4">
                    <div className="font-bold text-zinc-400 mr-2">
                      👤
                    </div>
                  </td>
                  
                  <td className="py-4 font-semibold text-white">{member.first_name}</td>
                  <td className="py-4 font-semibold text-white">{member.last_name}</td>
                  <td className="py-4 text-zinc-400">{member.email}</td>
                  <td className="py-4 text-zinc-400">{member.phone_number || '—'}</td>
                  <td className="py-4 text-zinc-400">{member.age || '—'}</td>
                  <td className="py-4 text-zinc-400">{member.gender || '—'}</td>
                  <td className="py-4 text-zinc-400 truncate max-w-xs">{member.address || '—'}</td>
                  <td className="py-4 text-zinc-500">{member.join_date?.split('T')[0] || 'N/A'}</td>
                  
                  <td className="py-4">
                    {member.face_id_registered ? (
                      <span className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider font-mono">
                        Captured
                      </span>
                    ) : (
                      <span className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse uppercase tracking-wider font-mono">
                        Pending
                      </span>
                    )}
                  </td>
                  
                  <td className="py-4">
                    <span className={member.status === 'Active' ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                      ● {member.status || 'Inactive'}
                    </span>
                  </td>
                  
                  <td className="py-4 text-right space-x-2 whitespace-nowrap">
                    {/* BOTÓN RENEW ADICIONADO */}
                    <button 
                      onClick={() => handleOpenRenewModal(member)}
                      className="p-1.5 bg-emerald-950 hover:bg-emerald-900 text-emerald-400 hover:text-emerald-350 rounded-lg text-[10px] font-bold uppercase transition-colors"
                    >
                      Renew
                    </button>
                    <button 
                      onClick={() => handleOpenEditModal(member)}
                      className="p-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-xs font-bold uppercase transition-colors text-zinc-300"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleOpenFaceScan(member)}
                      className={`p-1.5 rounded-lg text-[10px] font-bold uppercase transition-colors ${
                        member.face_id_registered 
                          ? 'bg-zinc-800 hover:bg-cyan-950 hover:text-cyan-400 text-zinc-300' 
                          : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-md'
                      }`}
                    >
                      Scan Face
                    </button>
                    <button 
                      onClick={() => handleConfirmDrop(member)}
                      className="p-1.5 bg-zinc-800 hover:bg-rose-950 hover:text-rose-400 rounded-lg text-[10px] font-bold uppercase transition-colors text-zinc-400"
                    >
                      Drop
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* PAGES */}
        {!error && members.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 mt-6 border-t border-white/5">
            <div className="text-xs text-zinc-500 font-mono">
              Showing <span className="text-zinc-300 font-bold">{members.length}</span> of{' '}
              <span className="text-zinc-300 font-bold">{totalCount}</span> members
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1 || loading}
                className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:pointer-events-none text-zinc-300 transition-colors"
              >
                Previous
              </button>
              
              <span className="text-xs text-zinc-400 font-mono px-2">
                Page <span className="text-white font-bold">{page}</span> of {totalPages}
              </span>

              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages || loading}
                className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:pointer-events-none text-zinc-300 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MEMBER FORM */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-white/5 rounded-2xl w-full max-w-xl p-6 space-y-4 shadow-2xl">
            <h2 className="text-lg font-black uppercase tracking-wide text-white">
              {editingMember ? 'Edit Profile' : 'Register New Member'}
            </h2>
            <form onSubmit={handleSaveMember} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-zinc-500 font-bold uppercase tracking-wider">First Name</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                    placeholder="First Name"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-500 font-bold uppercase tracking-wider">Last Name</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                    placeholder="Last Name"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-zinc-500 font-bold uppercase tracking-wider">Email Address</label>
                  <input 
                    type="email" 
                    required 
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                    placeholder="email@example.com"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-500 font-bold uppercase tracking-wider">Phone Number</label>
                  <input 
                    type="tel" 
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                    placeholder="1234567890"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-zinc-500 font-bold uppercase tracking-wider">Age</label>
                    <input 
                      type="number" 
                      min="1"
                      max="120"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      className="w-full bg-zinc-950 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                      placeholder="25"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-zinc-500 font-bold uppercase tracking-wider">Gender</label>
                    <select 
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full bg-zinc-950 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-zinc-500 font-bold uppercase tracking-wider">Address</label>
                  <input 
                    type="text" 
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                    placeholder="Address"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 font-bold uppercase tracking-wider">
                <button type="button" onClick={() => setIsFormModalOpen(false)} className="px-4 py-2 bg-zinc-800 text-zinc-400 hover:text-white rounded-xl transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl transition-colors">
                  {editingMember ? 'Save Changes' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL RENEW SUBSCRIPTION */}
      {isRenewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-white/5 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div>
              <h2 className="text-lg font-black uppercase tracking-wide text-white">Renew Subscription</h2>
              <p className="text-xs text-zinc-400 mt-1">
                Assign a new membership plan to <span className="text-white font-bold">{selectedMemberForRenew?.first_name} {selectedMemberForRenew?.last_name}</span>.
              </p>
            </div>

            <div className="space-y-4 py-2">
              <div className="space-y-1">
                <label className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Select Active Plan</label>
                {activePlans.length === 0 ? (
                  <p className="text-xs text-rose-400 font-mono p-3 bg-rose-500/5 rounded-xl border border-rose-500/10">
                    No active membership plans are currently available in the system catalog.
                  </p>
                ) : (
                  <select 
                    value={selectedPlanId}
                    onChange={(e) => setSelectedPlanId(e.target.value)}
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl px-3 py-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    {activePlans.map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name} — {plan.contract_period} {plan.contract_period === 1 ? 'Month' : 'Months'} (${plan.price})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-3 font-bold uppercase tracking-wider text-xs">
              <button 
                type="button" 
                onClick={() => setIsRenewModalOpen(false)} 
                disabled={renewLoading}
                className="px-4 py-2.5 bg-zinc-800 text-zinc-400 hover:text-white rounded-xl transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={handleConfirmRenew}
                disabled={activePlans.length === 0 || renewLoading}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {renewLoading ? 'Activating...' : 'Activate Plan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DELETE CONFIRMATION */}
      {isConfirmDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-rose-500/20 rounded-2xl w-full max-w-md p-6 space-y-6 shadow-2xl">
            <div className="text-center">
              <div className="w-12 h-12 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center text-xl mx-auto mb-4 border border-rose-500/25">
                !
              </div>
              <h2 className="text-lg font-black uppercase tracking-wide text-white">Confirm Drop Action</h2>
              <p className="text-sm text-zinc-400 mt-2">
                Are you sure you want to drop <span className="text-white font-bold">{memberToDelete?.first_name} {memberToDelete?.last_name}</span>? This action is permanent.
              </p>
            </div>
            
            <div className="flex justify-center gap-3 font-bold uppercase tracking-wider text-xs">
              <button 
                type="button" 
                onClick={() => { setIsConfirmDeleteOpen(false); setMemberToDelete(null); }} 
                className="px-4 py-2.5 bg-zinc-800 text-zinc-400 hover:text-white rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={handleDropMember} 
                className="px-4 py-2.5 bg-rose-650 hover:bg-rose-600 text-white rounded-xl transition-colors"
              >
                Drop Member
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL SUCCESS REGISTRER/UPDATE/RENEW */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-emerald-500/20 rounded-2xl w-full max-w-md p-6 space-y-6 shadow-2xl text-center">
            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center text-xl mx-auto mb-4 border border-emerald-500/25">
              ✓
            </div>
            <h2 className="text-lg font-black uppercase tracking-wide text-white">Success</h2>
            <p className="text-sm text-zinc-400 mt-2">{successMessage}</p>
            
            <div className="flex justify-center font-bold uppercase tracking-wider text-xs">
              <button 
                type="button" 
                onClick={() => setIsSuccessModalOpen(false)} 
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-colors"
              >
                Ok
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL FACE ID */}
      {isFaceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-lg p-6 space-y-6 shadow-2xl text-center">
            <div>
              <h2 className="text-xl font-black uppercase tracking-wide text-white">Face ID Enrollment</h2>
              <p className="text-xs text-zinc-400 mt-1">Register biometric credentials for {selectedMember?.first_name} {selectedMember?.last_name}</p>
            </div>

            <div className="relative aspect-video w-full bg-zinc-950 rounded-xl overflow-hidden border border-white/5 flex items-center justify-center">
              {isCameraActive ? (
                <video 
                  ref={videoRef}
                  autoPlay 
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]"
                />
              ) : (
                <div className="text-center p-6 space-y-2">
                  <div className="text-4xl">📸</div>
                  <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Camera Feed Offline</p>
                </div>
              )}
            </div>

            <div className="bg-zinc-950 rounded-xl p-3 border border-white/5 text-left">
              <span className="text-[10px] font-mono text-cyan-500 uppercase font-black block tracking-widest">System Output:</span>
              <p className="text-xs font-mono text-zinc-300 mt-1 whitespace-pre-line leading-relaxed">{biometricStatus}</p>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              {!isCameraActive ? (
                <button
                  type="button"
                  onClick={startCamera}
                  disabled={!faceApiReady}
                  className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-30 disabled:pointer-events-none text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-colors"
                >
                  Enable Camera
                </button>
              ) : (
                <button
                  type="button"
                  onClick={captureCameraSnapshot}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-colors"
                >
                  Capture Frame
                </button>
              )}

              <label className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl font-bold text-xs uppercase tracking-wider cursor-pointer transition-colors flex items-center">
                Upload File
                <input 
                  type="file" 
                  accept="image/*" 
                  disabled={!faceApiReady}
                  onChange={handleFileChange} 
                  className="hidden" 
                />
              </label>

              <button
                type="button"
                onClick={closeFaceModal}
                className="px-4 py-2.5 bg-zinc-950 text-rose-400 hover:text-rose-300 border border-rose-500/10 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MembersView;