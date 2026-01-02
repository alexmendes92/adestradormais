import React, { useState, useEffect } from 'react';
import { Save, RotateCcw, Smartphone, User, Palette, Phone, MapPin, Instagram, Layout, Briefcase, Edit2, Plus, Upload, Camera, Image as ImageIcon, Grid, ChevronDown, ChevronUp, Loader2, Server, Database, CheckCircle, Sparkles, Zap } from 'lucide-react';
import { useAppConfig } from '../contexts/AppConfigContext';
import { AppConfig, ServiceDetailData } from '../types';
import { ServiceEditorView } from './ServiceEditor';
import { HERO_IMAGES_GALLERY } from '../data/heroImages';

// Utilitário para formatar telefone (Máscara)
const formatPhone = (value: string) => {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 2) return numbers;
  if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
};

// Utilitário para comprimir imagem (Mesma lógica do Editor para evitar conflitos)
const resizeImage = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxWidth = 800; // Limite seguro para localStorage
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7)); // Compressão 70%
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

export const AdminView: React.FC = () => {
  const { config, updateConfig, resetConfig } = useAppConfig();
  
  // --- ONBOARDING STATE ---
  const [setupName, setSetupName] = useState('');
  const [setupPhone, setSetupPhone] = useState('');
  const [setupStep, setSetupStep] = useState<'form' | 'processing'>('form');
  const [loadingMsg, setLoadingMsg] = useState('Iniciando sistema...');
  // -----------------------

  const [tempConfig, setTempConfig] = useState<AppConfig>(config);
  const [saved, setSaved] = useState(false);
  
  // Controle de Navegação Interna do Admin
  const [viewMode, setViewMode] = useState<'dashboard' | 'editor'>('dashboard');
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);

  // Estado para controlar qual seção está expandida.
  const [expandedSection, setExpandedSection] = useState<string | null>('profile');

  const toggleSection = (section: string) => {
    setExpandedSection(prev => prev === section ? null : section);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Aplica máscara se for campo de telefone
    if (name === 'phone') {
        setTempConfig(prev => ({ ...prev, [name]: formatPhone(value) }));
    } else {
        setTempConfig(prev => ({ ...prev, [name]: value }));
    }
    setSaved(false);
  };

  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressedImage = await resizeImage(file);
        setTempConfig(prev => ({ ...prev, profileImage: compressedImage }));
        setSaved(false);
      } catch (err) {
        console.error("Erro ao processar imagem de perfil", err);
        alert("Erro ao carregar imagem.");
      }
    }
  };

  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressedImage = await resizeImage(file);
        setTempConfig(prev => ({ ...prev, heroImage: compressedImage }));
        setSaved(false);
      } catch (err) {
        console.error("Erro ao processar imagem de capa", err);
        alert("Erro ao carregar imagem.");
      }
    }
  };

  const openEditor = (serviceId?: string) => {
    setEditingServiceId(serviceId || null);
    setViewMode('editor');
  };

  const closeEditor = () => {
    setViewMode('dashboard');
    setEditingServiceId(null);
  };

  const handleSaveService = (updatedService: ServiceDetailData) => {
    const newServices = tempConfig.services.map(s => s.id === updatedService.id ? updatedService : s);
    if (!tempConfig.services.find(s => s.id === updatedService.id)) {
        newServices.push(updatedService);
    }
    const newConfig = { ...tempConfig, services: newServices };
    setTempConfig(newConfig);
    updateConfig(newConfig);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    closeEditor();
  };

  const handleDeleteService = (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este plano permanentemente?")) {
      const newConfig = {
        ...tempConfig,
        services: tempConfig.services.filter(s => s.id !== id)
      };
      setTempConfig(newConfig);
      updateConfig(newConfig);
      setSaved(false);
      closeEditor();
    }
  };

  const handleGlobalSave = () => {
    // Remove formatação do telefone antes de salvar para garantir consistência se necessário,
    // mas aqui salvaremos com formato para exibição visual nos inputs.
    // O link do WhatsApp remove caracteres não numéricos.
    updateConfig(tempConfig);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const SectionHeader = ({ id, title, icon: Icon, colorClass }: { id: string, title: string, icon: any, colorClass: string }) => (
    <button 
        onClick={() => toggleSection(id)}
        className={`w-full flex items-center justify-between p-5 bg-white ${expandedSection === id ? 'rounded-t-3xl border-b border-slate-50' : 'rounded-3xl hover:bg-slate-50'} transition-all shadow-sm border border-slate-100 mb-1 z-10 relative`}
    >
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${colorClass} bg-opacity-10`}>
                <Icon size={20} className={colorClass.replace('bg-', 'text-')} />
            </div>
            <span className="font-bold text-slate-800 text-sm">{title}</span>
        </div>
        <div className={`text-slate-400 transition-transform duration-300 ${expandedSection === id ? 'rotate-180' : ''}`}>
            <ChevronDown size={20} />
        </div>
    </button>
  );

  // --- LOGICA DE SETUP INICIAL (ONBOARDING) ---
  const handleStartSetup = () => {
    if(!setupName || !setupPhone) {
        alert("Por favor, preencha seu nome e WhatsApp.");
        return;
    }
    setSetupStep('processing');
  };

  // Efeito para animação de loading do setup
  useEffect(() => {
    if (setupStep === 'processing') {
        const messages = [
            "Conectando ao servidor...",
            "Criando perfil profissional...",
            `Configurando conta de ${setupName}...`,
            "Vinculando WhatsApp...",
            "Gerando painel administrativo...",
            "Aplicando tema visual...",
            "Finalizando configuração..."
        ];
        
        let i = 0;
        const interval = setInterval(() => {
            if (i < messages.length) {
                setLoadingMsg(messages[i]);
                i++;
            } else {
                clearInterval(interval);
                // FINALIZA SETUP
                updateConfig({
                    professionalName: setupName,
                    phone: setupPhone.replace(/\D/g, ''), // Salva limpo no config global
                    isOnboarded: true
                });
                setTempConfig(prev => ({
                    ...prev,
                    professionalName: setupName,
                    phone: setupPhone, // Mantém formatado no input local
                    isOnboarded: true
                }));
            }
        }, 800); // Velocidade da troca de mensagens

        return () => clearInterval(interval);
    }
  }, [setupStep]);

  // RENDERIZAÇÃO DO SETUP SE NÃO TIVER FEITO ONBOARDING
  if (!config.isOnboarded) {
    if (setupStep === 'form') {
        return (
            <div className="fixed inset-0 z-50 bg-slate-900 flex flex-col items-center justify-center p-8 animate-fade-in">
                <div className="w-full max-w-md">
                    <div className="text-center mb-10">
                        <div className="w-20 h-20 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-3xl mx-auto flex items-center justify-center mb-6 shadow-2xl shadow-blue-500/20 animate-bounce-slow">
                            <Sparkles size={40} className="text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-white font-brand mb-2">Bem-vindo, Treinador!</h1>
                        <p className="text-slate-400 text-sm">Vamos configurar seu aplicativo em segundos.</p>
                    </div>

                    <div className="space-y-5 bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-sm">
                        <div>
                            <label className="text-xs font-bold text-blue-400 uppercase ml-1 mb-1 block">Como você quer ser chamado?</label>
                            <div className="relative">
                                <User className="absolute left-4 top-3.5 text-slate-500" size={18} />
                                <input 
                                    value={setupName}
                                    onChange={(e) => setSetupName(e.target.value)}
                                    placeholder="Ex: Carlos Adestrador"
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-11 pr-4 py-3.5 text-white font-bold placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-green-400 uppercase ml-1 mb-1 block">Seu WhatsApp (Com DDD)</label>
                            <div className="relative">
                                <Smartphone className="absolute left-4 top-3.5 text-slate-500" size={18} />
                                <input 
                                    value={setupPhone}
                                    onChange={(e) => setSetupPhone(formatPhone(e.target.value))}
                                    type="tel"
                                    placeholder="(11) 99999-9999"
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-11 pr-4 py-3.5 text-white font-bold placeholder:text-slate-600 focus:outline-none focus:border-green-500 transition-colors"
                                />
                            </div>
                        </div>

                        <button 
                            onClick={handleStartSetup}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/30 active:scale-95 transition-all flex items-center justify-center gap-2 mt-4 hover:shadow-blue-600/50"
                        >
                            <Zap size={20} fill="currentColor" />
                            Configurar Sistema Agora
                        </button>
                    </div>
                    
                    <p className="text-center text-[10px] text-slate-600 mt-8">Configuração segura e local. Seus dados ficam no seu dispositivo.</p>
                </div>
            </div>
        );
    }

    if (setupStep === 'processing') {
        return (
            <div className="fixed inset-0 z-50 bg-slate-900 flex flex-col items-center justify-center p-8">
                <div className="relative mb-8">
                    <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20 rounded-full animate-pulse"></div>
                    <div className="relative z-10 w-24 h-24 bg-slate-800 rounded-full border-4 border-slate-700 flex items-center justify-center">
                        <Loader2 size={48} className="text-blue-500 animate-spin" />
                    </div>
                    {/* Icones orbitando (efeito visual) */}
                    <div className="absolute top-0 right-0 -mt-2 -mr-2 bg-slate-700 p-2 rounded-full animate-bounce">
                        <Server size={14} className="text-green-400" />
                    </div>
                    <div className="absolute bottom-0 left-0 -mb-2 -ml-2 bg-slate-700 p-2 rounded-full animate-bounce delay-100">
                        <Database size={14} className="text-purple-400" />
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-white mb-2 font-brand animate-pulse">{loadingMsg}</h2>
                
                {/* Progress Bar Falso */}
                <div className="w-64 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-4">
                    <div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 w-full animate-progress origin-left"></div>
                </div>
            </div>
        );
    }
  }

  // --- FIM DA LÓGICA DE ONBOARDING ---

  // Se estiver no modo Editor, renderiza a View de Edição
  if (viewMode === 'editor') {
    const serviceToEdit = tempConfig.services.find(s => s.id === editingServiceId);
    return (
      <ServiceEditorView 
        initialService={serviceToEdit}
        onSave={handleSaveService}
        onCancel={closeEditor}
        onDelete={handleDeleteService}
      />
    );
  }

  // Modo Dashboard (Lista Principal - PÓS ONBOARDING)
  return (
    <div className="bg-slate-50 min-h-full pb-24 animate-fade-in relative">
      
      {/* Header Admin */}
      <div className="bg-slate-900 pt-8 pb-10 px-6 rounded-b-[2.5rem] relative overflow-hidden shadow-xl mb-6">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2 text-orange-400">
             <Layout size={20} />
             <span className="text-xs font-bold uppercase tracking-widest">Modo Editor</span>
          </div>
          <h2 className="text-3xl font-bold text-white font-brand mb-1">Painel do Adestrador</h2>
          <p className="text-slate-400 text-sm">Personalize seu aplicativo em tempo real.</p>
        </div>
      </div>

      <div className="px-6 -mt-6 relative z-20 space-y-4">
        
        {/* SEÇÃO 1: DADOS DO PROFISSIONAL */}
        <div className={`transition-all duration-300 ${expandedSection === 'profile' ? 'mb-4' : ''}`}>
            <SectionHeader id="profile" title="Dados do Profissional" icon={User} colorClass="bg-blue-500" />
            
            {expandedSection === 'profile' && (
                <div className="bg-white p-6 rounded-b-3xl border-x border-b border-slate-100 shadow-sm animate-fade-in -mt-2 pt-4">
                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Seu Nome Profissional</label>
                            <input 
                                name="professionalName"
                                value={tempConfig.professionalName}
                                onChange={handleChange}
                                placeholder="Ex: Carlos Adestrador"
                                className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:border-${tempConfig.themeColor}-500`}
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Slogan / Cargo</label>
                            <input 
                                name="slogan"
                                value={tempConfig.slogan}
                                onChange={handleChange}
                                placeholder="Ex: Adestramento Comportamental"
                                className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:border-${tempConfig.themeColor}-500`}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* SEÇÃO 2: IMAGENS & VISUAL */}
        <div className={`transition-all duration-300 ${expandedSection === 'images' ? 'mb-4' : ''}`}>
            <SectionHeader id="images" title="Imagens & Identidade" icon={ImageIcon} colorClass="bg-purple-500" />
            
            {expandedSection === 'images' && (
                <div className="bg-white p-6 rounded-b-3xl border-x border-b border-slate-100 shadow-sm animate-fade-in -mt-2 pt-4">
                    <div className="space-y-6">
                        {/* Upload Foto Perfil */}
                        <div className="flex items-center gap-4 border-b border-slate-50 pb-4">
                            <div className="relative group cursor-pointer">
                                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-slate-200 bg-slate-100">
                                    <img src={tempConfig.profileImage} alt="Profile" className="w-full h-full object-cover" />
                                </div>
                                <label htmlFor="profile-upload" className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                    <Camera size={20} className="text-white" />
                                </label>
                                <input 
                                    type="file" 
                                    id="profile-upload" 
                                    accept="image/*" 
                                    className="hidden" 
                                    onChange={handleProfileImageUpload}
                                />
                            </div>
                            <div className="flex-1">
                                <label htmlFor="profile-upload" className="block text-xs font-bold text-slate-700 mb-0.5 cursor-pointer hover:underline">
                                    Foto de Perfil
                                </label>
                                <p className="text-[10px] text-slate-400 leading-tight">Aparece na página de contato e topo.</p>
                            </div>
                        </div>

                        {/* Upload Hero Image & Gallery */}
                        <div>
                            <div className="flex items-center gap-4 mb-3">
                                <div className="relative group cursor-pointer w-24 h-14 rounded-lg overflow-hidden border-2 border-slate-200 bg-slate-100 shrink-0">
                                    <img src={tempConfig.heroImage} alt="Hero" className="w-full h-full object-cover" />
                                    <label htmlFor="hero-upload" className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                        <ImageIcon size={20} className="text-white" />
                                    </label>
                                    <input 
                                        type="file" 
                                        id="hero-upload" 
                                        accept="image/*" 
                                        className="hidden" 
                                        onChange={handleHeroImageUpload}
                                    />
                                </div>
                                <div className="flex-1">
                                    <label htmlFor="hero-upload" className="block text-xs font-bold text-slate-700 mb-0.5 cursor-pointer hover:underline">
                                        Capa Inicial (Hero)
                                    </label>
                                    <p className="text-[10px] text-slate-400 leading-tight">Destaque principal da página Início.</p>
                                </div>
                            </div>

                            {/* Galeria Rápida Hero */}
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 flex items-center gap-1"><Grid size={10}/> Galeria Rápida:</p>
                                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                                    {HERO_IMAGES_GALLERY.map((img, idx) => (
                                        <button 
                                            key={idx}
                                            onClick={() => {
                                                setTempConfig(prev => ({ ...prev, heroImage: img.img_full }));
                                                setSaved(false);
                                            }}
                                            className={`flex-shrink-0 w-20 h-12 rounded-lg overflow-hidden border-2 transition-all ${tempConfig.heroImage === img.img_full ? `border-${tempConfig.themeColor}-500 ring-2 ring-${tempConfig.themeColor}-200` : 'border-slate-100 hover:border-slate-300'}`}
                                        >
                                            <img src={img.img_thumb} className="w-full h-full object-cover" alt={`Opção ${idx}`} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* SEÇÃO 3: PLANOS E SERVIÇOS */}
        <div className={`transition-all duration-300 ${expandedSection === 'services' ? 'mb-4' : ''}`}>
            <SectionHeader id="services" title="Seus Planos e Serviços" icon={Briefcase} colorClass="bg-orange-500" />
            
            {expandedSection === 'services' && (
                <div className="bg-white p-6 rounded-b-3xl border-x border-b border-slate-100 shadow-sm animate-fade-in -mt-2 pt-4">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-xs text-slate-400">Gerencie os serviços oferecidos.</p>
                        <button 
                            onClick={() => openEditor()}
                            className={`text-[10px] font-bold bg-${tempConfig.themeColor}-50 text-${tempConfig.themeColor}-600 px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-${tempConfig.themeColor}-100 transition-colors shadow-sm`}
                        >
                            <Plus size={12} /> Novo
                        </button>
                    </div>
                    
                    <div className="space-y-3">
                    {tempConfig.services.map((service) => (
                        <div 
                            key={service.id} 
                            onClick={() => openEditor(service.id)}
                            className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50 hover:border-slate-300 hover:bg-white transition-all cursor-pointer group"
                        >
                            <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 bg-white shrink-0">
                                <img src={service.image} alt="ico" className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-slate-800 line-clamp-1">{service.title}</h4>
                                <div className="flex gap-2">
                                    <span className={`text-[9px] font-bold text-${service.tagColor || 'slate'}-500`}>{service.tag}</span>
                                    {service.popular && <span className="text-[9px] font-bold text-orange-500">★ Popular</span>}
                                </div>
                            </div>
                            </div>
                            <div className="bg-white p-2 rounded-full border border-slate-100 text-slate-300 group-hover:text-blue-500 group-hover:border-blue-200 transition-colors">
                                <Edit2 size={14} />
                            </div>
                        </div>
                    ))}
                    
                    {tempConfig.services.length === 0 && (
                        <div className="text-center py-6 text-slate-400 text-xs">
                            Nenhum plano cadastrado. Clique em "Novo" para começar.
                        </div>
                    )}
                    </div>
                </div>
            )}
        </div>

        {/* SEÇÃO 4: CONTATO E LOCALIZAÇÃO */}
        <div className={`transition-all duration-300 ${expandedSection === 'contact' ? 'mb-4' : ''}`}>
            <SectionHeader id="contact" title="Contato e Local" icon={Smartphone} colorClass="bg-green-500" />
            
            {expandedSection === 'contact' && (
                <div className="bg-white p-6 rounded-b-3xl border-x border-b border-slate-100 shadow-sm animate-fade-in -mt-2 pt-4">
                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 flex items-center gap-1"><Phone size={10}/> WhatsApp (Apenas números)</label>
                            <input 
                                name="phone"
                                value={tempConfig.phone}
                                onChange={handleChange}
                                placeholder="(11) 99999-9999"
                                className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:border-${tempConfig.themeColor}-500`}
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 flex items-center gap-1"><Instagram size={10}/> Link Instagram</label>
                            <input 
                                name="instagramUrl"
                                value={tempConfig.instagramUrl}
                                onChange={handleChange}
                                className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 focus:outline-none focus:border-${tempConfig.themeColor}-500`}
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 flex items-center gap-1"><MapPin size={10}/> Local de Atendimento</label>
                            <input 
                                name="locationText"
                                value={tempConfig.locationText}
                                onChange={handleChange}
                                className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 focus:outline-none focus:border-${tempConfig.themeColor}-500`}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* SEÇÃO 5: APARÊNCIA */}
        <div className={`transition-all duration-300 ${expandedSection === 'theme' ? 'mb-4' : ''}`}>
            <SectionHeader id="theme" title="Aparência do App" icon={Palette} colorClass="bg-pink-500" />
            
            {expandedSection === 'theme' && (
                <div className="bg-white p-6 rounded-b-3xl border-x border-b border-slate-100 shadow-sm animate-fade-in -mt-2 pt-4">
                    <p className="text-xs text-slate-400 mb-3">Escolha a cor principal do aplicativo:</p>
                    <div className="grid grid-cols-4 gap-2">
                        {['orange', 'blue', 'green', 'purple'].map((color) => (
                            <button
                                key={color}
                                onClick={() => setTempConfig(prev => ({ ...prev, themeColor: color as any }))}
                                className={`h-12 rounded-xl border-2 transition-all flex items-center justify-center ${
                                    tempConfig.themeColor === color 
                                    ? `border-${color}-500 bg-${color}-50 ring-2 ring-${color}-200` 
                                    : 'border-slate-100 bg-slate-50'
                                }`}
                            >
                                <div className={`w-6 h-6 rounded-full bg-${color}-500`}></div>
                            </button>
                        ))}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2 text-center">Cor selecionada: <span className="uppercase font-bold text-slate-600">{tempConfig.themeColor}</span></p>
                </div>
            )}
        </div>

        {/* Actions */}
        <div className="pb-4 space-y-3 pt-4 border-t border-slate-100 mt-4">
            <button 
                onClick={handleGlobalSave}
                className={`w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 transition flex items-center justify-center gap-2`}
            >
                <Save size={20} />
                {saved ? 'Alterações Salvas!' : 'Salvar Alterações'}
            </button>
            
            <button 
                onClick={() => {
                    resetConfig();
                    setTempConfig(useAppConfig().config);
                    alert("Configurações restauradas para o padrão.");
                }}
                className="w-full text-slate-400 text-xs font-bold py-3 flex items-center justify-center gap-2 hover:text-red-500 transition"
            >
                <RotateCcw size={14} />
                Restaurar Padrão
            </button>
        </div>

      </div>
    </div>
  );
};