import React, { useState, useRef, useEffect } from 'react';
import { Save, RotateCcw, Smartphone, User, Palette, Phone, MapPin, Instagram, Layout, Briefcase, Edit2, ChevronDown, ChevronUp, Link as LinkIcon, Trash2, Plus, ArrowRight, ArrowLeft, AlignLeft, Image as ImageIcon, Clock, List, CheckSquare, Upload, Grid } from 'lucide-react';
import { useAppConfig } from '../contexts/AppConfigContext';
import { AppConfig, ServiceDetailData } from '../types';
import { SERVICE_IMAGES_GALLERY } from '../data/serviceImages';

export const AdminView: React.FC = () => {
  const { config, updateConfig, resetConfig } = useAppConfig();
  const [tempConfig, setTempConfig] = useState<AppConfig>(config);
  const [saved, setSaved] = useState(false);
  
  // State para controle do Wizard de Serviços
  const [expandedServiceId, setExpandedServiceId] = useState<string | null>(null);
  const [editingStep, setEditingStep] = useState<number>(1);
  const wizardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (expandedServiceId && wizardRef.current) {
      wizardRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [editingStep, expandedServiceId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTempConfig(prev => ({ ...prev, [name]: value }));
    setSaved(false);
  };

  // --- Lógica de Serviços ---

  const handleServiceChange = (index: number, field: keyof ServiceDetailData, value: any) => {
    const updatedServices = [...tempConfig.services];
    updatedServices[index] = { ...updatedServices[index], [field]: value };
    setTempConfig(prev => ({ ...prev, services: updatedServices }));
    setSaved(false);
  };

  // Tratamento especial para benefícios (array de strings) via textarea
  const handleBenefitsChange = (index: number, text: string) => {
    const benefitsArray = text.split('\n');
    handleServiceChange(index, 'benefits', benefitsArray);
  };

  const handleFileUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleServiceChange(index, 'image', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddService = () => {
    const newId = `custom-${Date.now()}`;
    const newService: ServiceDetailData = {
      id: newId,
      title: "Novo Plano",
      description: "Descrição curta para o card.",
      fullDescription: "Descrição completa e persuasiva sobre este serviço.",
      image: "https://placehold.co/600x400?text=Novo+Plano",
      tag: "NOVIDADE",
      tagColor: "blue",
      popular: false,
      benefits: ["Benefício 1", "Benefício 2", "Benefício 3"],
      duration: "A combinar",
      location: "Domiciliar"
    };

    setTempConfig(prev => ({
      ...prev,
      services: [...prev.services, newService]
    }));
    
    // Abre o novo serviço imediatamente no passo 1
    setExpandedServiceId(newId);
    setEditingStep(1);
    setSaved(false);
  };

  const handleDeleteService = (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este plano permanentemente?")) {
      setTempConfig(prev => ({
        ...prev,
        services: prev.services.filter(s => s.id !== id)
      }));
      if (expandedServiceId === id) setExpandedServiceId(null);
      setSaved(false);
    }
  };

  const toggleService = (id: string) => {
    if (expandedServiceId === id) {
      setExpandedServiceId(null);
    } else {
      setExpandedServiceId(id);
      setEditingStep(1); // Sempre reseta para o passo 1 ao abrir
    }
  };

  const handleSave = () => {
    updateConfig(tempConfig);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  // --- Renderização dos Passos do Wizard ---

  const renderStepIndicator = () => (
    <div className="flex items-center justify-between mb-6 px-4 relative">
      {/* Linha de conexão */}
      <div className="absolute left-4 right-4 top-4 h-0.5 bg-slate-100 -z-0">
         <div 
            className={`h-full bg-${tempConfig.themeColor}-500 transition-all duration-300`} 
            style={{ width: `${((editingStep - 1) / 2) * 100}%` }}
         ></div>
      </div>

      {[1, 2, 3].map((step) => (
        <div key={step} className="flex flex-col items-center relative z-10 cursor-pointer" onClick={() => setEditingStep(step)}>
          <div 
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
              editingStep >= step 
                ? `bg-${tempConfig.themeColor}-500 text-white shadow-lg transform scale-110` 
                : 'bg-white border-2 border-slate-100 text-slate-300'
            }`}
          >
            {step}
          </div>
          <span className={`text-[9px] mt-1.5 font-bold uppercase tracking-wider ${editingStep >= step ? 'text-slate-800' : 'text-slate-300'}`}>
            {step === 1 ? 'Identidade' : step === 2 ? 'Conteúdo' : 'Detalhes'}
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="bg-slate-50 min-h-full pb-24 animate-fade-in">
      
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

      <div className="px-6 -mt-6 relative z-20 space-y-6">
        
        {/* Card 1: Identidade */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <User size={18} className={`text-${tempConfig.themeColor}-500`} />
                Identidade Visual
            </h3>
            <div className="space-y-4">
                <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Seu Nome Profissional</label>
                    <input 
                        name="professionalName"
                        value={tempConfig.professionalName}
                        onChange={handleChange}
                        className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:border-${tempConfig.themeColor}-500`}
                    />
                </div>
                <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Slogan / Cargo</label>
                    <input 
                        name="slogan"
                        value={tempConfig.slogan}
                        onChange={handleChange}
                        className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:border-${tempConfig.themeColor}-500`}
                    />
                </div>
                <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">URL da Foto de Perfil</label>
                    <input 
                        name="profileImage"
                        value={tempConfig.profileImage}
                        onChange={handleChange}
                        placeholder="https://..."
                        className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-600 focus:outline-none focus:border-${tempConfig.themeColor}-500`}
                    />
                </div>
            </div>
        </div>

        {/* Card 2: Serviços (WIZARD) */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <Briefcase size={18} className="text-blue-500" />
                  Seus Planos
              </h3>
              <button 
                onClick={handleAddService}
                className={`text-[10px] font-bold bg-${tempConfig.themeColor}-50 text-${tempConfig.themeColor}-600 px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-${tempConfig.themeColor}-100 transition-colors shadow-sm`}
              >
                <Plus size={12} /> Criar Plano
              </button>
            </div>
            
            <div className="space-y-3">
              {tempConfig.services.map((service, index) => (
                <div key={service.id} className={`border rounded-xl overflow-hidden transition-all duration-300 ${expandedServiceId === service.id ? `border-${tempConfig.themeColor}-200 shadow-md ring-1 ring-${tempConfig.themeColor}-100` : 'border-slate-100 bg-slate-50/50'}`}>
                  
                  {/* Service Header / Toggle */}
                  <div 
                    onClick={() => toggleService(service.id)}
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 bg-white shrink-0 relative">
                         <img src={service.image} alt="ico" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 line-clamp-1">{service.title}</h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${service.tagColor ? `text-${service.tagColor}-600 bg-${service.tagColor}-50 border-${service.tagColor}-100` : 'text-slate-500 bg-slate-100 border-slate-200'}`}>
                          {service.tag}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {expandedServiceId === service.id ? <ChevronUp size={18} className="text-slate-400" /> : <Edit2 size={16} className="text-slate-400" />}
                    </div>
                  </div>

                  {/* Service Wizard Form (Expandable) */}
                  {expandedServiceId === service.id && (
                    <div ref={wizardRef} className="p-5 border-t border-slate-100 bg-white animate-fade-in relative">
                      
                      {renderStepIndicator()}

                      {/* STEP 1: IDENTIDADE */}
                      {editingStep === 1 && (
                        <div className="space-y-4 animate-slide-in">
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Título do Plano</label>
                            <input 
                              value={service.title}
                              onChange={(e) => handleServiceChange(index, 'title', e.target.value)}
                              className={`w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-900 focus:outline-none focus:border-${tempConfig.themeColor}-500`}
                              placeholder="Ex: Adestramento Básico"
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                             <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Etiqueta (Tag)</label>
                                <input 
                                  value={service.tag}
                                  onChange={(e) => handleServiceChange(index, 'tag', e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-${tempConfig.themeColor}-500"
                                  placeholder="Ex: POPULAR"
                                />
                             </div>
                             <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Cor da Tag</label>
                                <select 
                                  value={service.tagColor}
                                  onChange={(e) => handleServiceChange(index, 'tagColor', e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-${tempConfig.themeColor}-500"
                                >
                                  <option value="orange">Laranja</option>
                                  <option value="blue">Azul</option>
                                  <option value="green">Verde</option>
                                  <option value="purple">Roxo</option>
                                  <option value="slate">Cinza</option>
                                </select>
                             </div>
                          </div>

                          <div className="flex items-center gap-2 pt-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                             <input 
                               type="checkbox"
                               id={`pop-${service.id}`}
                               checked={service.popular || false}
                               onChange={(e) => handleServiceChange(index, 'popular', e.target.checked)}
                               className={`w-4 h-4 text-${tempConfig.themeColor}-500 rounded focus:ring-${tempConfig.themeColor}-500`}
                             />
                             <label htmlFor={`pop-${service.id}`} className="text-xs font-bold text-slate-600 flex items-center gap-1 cursor-pointer">
                                Marcar como Destaque (Popular)
                             </label>
                          </div>
                        </div>
                      )}

                      {/* STEP 2: CONTEÚDO (Com Seletor de Imagem Melhorado) */}
                      {editingStep === 2 && (
                        <div className="space-y-4 animate-slide-in">
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 flex items-center gap-1"><AlignLeft size={10}/> Descrição Curta (Card)</label>
                            <input 
                              value={service.description}
                              onChange={(e) => handleServiceChange(index, 'description', e.target.value)}
                              className={`w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-${tempConfig.themeColor}-500`}
                              placeholder="Ex: Comandos essenciais e foco."
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 flex items-center gap-1"><AlignLeft size={10}/> Descrição Completa</label>
                            <textarea 
                              rows={3}
                              value={service.fullDescription}
                              onChange={(e) => handleServiceChange(index, 'fullDescription', e.target.value)}
                              className={`w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-${tempConfig.themeColor}-500 resize-none`}
                              placeholder="Texto detalhado..."
                            />
                          </div>

                          {/* Seletor de Imagem Aprimorado */}
                          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                            <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 flex items-center gap-1">
                               <ImageIcon size={12}/> Imagem de Capa
                            </label>
                            
                            {/* Preview */}
                            <div className="relative h-32 w-full rounded-lg overflow-hidden bg-slate-200 mb-3 border border-slate-200 shadow-inner">
                                <img src={service.image} className="w-full h-full object-cover" alt="Preview" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-2">
                                    <span className="text-[10px] text-white font-bold bg-black/30 px-2 py-1 rounded backdrop-blur-sm">Atual</span>
                                </div>
                            </div>

                            {/* Image Source Options */}
                            <div className="space-y-3">
                                {/* Option 1: Gallery */}
                                <div>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1"><Grid size={10}/> Sugestões (Clique para selecionar)</p>
                                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                                        {SERVICE_IMAGES_GALLERY.map((img, idx) => (
                                            <button 
                                                key={idx}
                                                onClick={() => handleServiceChange(index, 'image', img.img_full)} // Using full image for quality
                                                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${service.image === img.img_full ? `border-${tempConfig.themeColor}-500 ring-2 ring-${tempConfig.themeColor}-200` : 'border-slate-200 hover:border-slate-400'}`}
                                            >
                                                <img src={img.img_thumb} className="w-full h-full object-cover" alt={`Opção ${idx}`} />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-2 items-center">
                                    <div className="h-px bg-slate-200 flex-1"></div>
                                    <span className="text-[9px] text-slate-400 font-bold uppercase">Ou</span>
                                    <div className="h-px bg-slate-200 flex-1"></div>
                                </div>

                                {/* Option 2 & 3: Upload or URL */}
                                <div className="grid grid-cols-1 gap-2">
                                    <div className="relative">
                                        <input 
                                            type="file" 
                                            id={`upload-${index}`}
                                            accept="image/*"
                                            className="hidden" 
                                            onChange={(e) => handleFileUpload(index, e)}
                                        />
                                        <label 
                                            htmlFor={`upload-${index}`}
                                            className={`w-full flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-600 text-xs font-bold py-2 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors`}
                                        >
                                            <Upload size={14} /> Fazer Upload (Dispositivo)
                                        </label>
                                    </div>
                                    <div className="relative">
                                        <LinkIcon size={14} className="absolute left-3 top-2.5 text-slate-400" />
                                        <input 
                                          value={service.image.startsWith('data:') ? '' : service.image}
                                          onChange={(e) => handleServiceChange(index, 'image', e.target.value)}
                                          className={`w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-600 focus:outline-none focus:border-${tempConfig.themeColor}-500`}
                                          placeholder="Colar URL da imagem..."
                                        />
                                    </div>
                                </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* STEP 3: DETALHES */}
                      {editingStep === 3 && (
                        <div className="space-y-4 animate-slide-in">
                           <div className="grid grid-cols-2 gap-3">
                             <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 flex items-center gap-1"><Clock size={10}/> Duração/Preço</label>
                                <input 
                                  value={service.duration}
                                  onChange={(e) => handleServiceChange(index, 'duration', e.target.value)}
                                  className={`w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-${tempConfig.themeColor}-500`}
                                  placeholder="Ex: 8 aulas"
                                />
                             </div>
                             <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 flex items-center gap-1"><MapPin size={10}/> Local</label>
                                <input 
                                  value={service.location}
                                  onChange={(e) => handleServiceChange(index, 'location', e.target.value)}
                                  className={`w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-${tempConfig.themeColor}-500`}
                                  placeholder="Ex: Domicílio"
                                />
                             </div>
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 flex items-center gap-1"><List size={10}/> Benefícios (Um por linha)</label>
                            <textarea 
                              rows={5}
                              value={service.benefits.join('\n')}
                              onChange={(e) => handleBenefitsChange(index, e.target.value)}
                              className={`w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-${tempConfig.themeColor}-500 resize-none leading-relaxed`}
                              placeholder="Adicione um benefício por linha..."
                            />
                            <p className="text-[9px] text-slate-400 mt-1 pl-1">Cada linha será um item com <CheckSquare size={8} className="inline"/> na lista.</p>
                          </div>
                        </div>
                      )}

                      {/* Wizard Footer Navigation */}
                      <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-50">
                         {editingStep === 1 ? (
                            <button 
                                onClick={() => handleDeleteService(service.id)}
                                className="text-red-400 hover:text-red-600 text-xs font-bold flex items-center gap-1 px-2 py-1"
                            >
                                <Trash2 size={14} /> Excluir
                            </button>
                         ) : (
                            <button 
                                onClick={() => setEditingStep(prev => prev - 1)}
                                className="text-slate-400 hover:text-slate-600 text-xs font-bold flex items-center gap-1 px-2 py-1"
                            >
                                <ArrowLeft size={14} /> Voltar
                            </button>
                         )}

                         {editingStep < 3 ? (
                            <button 
                                onClick={() => setEditingStep(prev => prev + 1)}
                                className={`bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1 active:scale-95 transition shadow-sm`}
                            >
                                Próximo <ArrowRight size={14} />
                            </button>
                         ) : (
                            <div className="text-xs font-bold text-green-500 flex items-center gap-1 px-2">
                                <CheckSquare size={14} /> Tudo Pronto
                            </div>
                         )}
                      </div>

                    </div>
                  )}
                </div>
              ))}
            </div>
            <p className="text-[10px] text-center text-slate-400 mt-4">Salve as alterações para aplicar no App.</p>
        </div>

        {/* Card 3: Aparência */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Palette size={18} className="text-purple-500" />
                Tema do App
            </h3>
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
            <p className="text-[10px] text-slate-400 mt-2 text-center">Cor selecionada: <span className="uppercase font-bold">{tempConfig.themeColor}</span></p>
        </div>

        {/* Card 4: Contato */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Smartphone size={18} className="text-green-500" />
                Configurações de Contato
            </h3>
            <div className="space-y-4">
                <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 flex items-center gap-1"><Phone size={10}/> WhatsApp (Apenas números)</label>
                    <input 
                        name="phone"
                        value={tempConfig.phone}
                        onChange={handleChange}
                        placeholder="5511999999999"
                        className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:border-${tempConfig.themeColor}-500`}
                    />
                </div>
                <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 flex items-center gap-1"><Instagram size={10}/> Link Instagram</label>
                    <input 
                        name="instagramUrl"
                        value={tempConfig.instagramUrl}
                        onChange={handleChange}
                        className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-600 focus:outline-none focus:border-${tempConfig.themeColor}-500`}
                    />
                </div>
                <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 flex items-center gap-1"><MapPin size={10}/> Local de Atendimento</label>
                    <input 
                        name="locationText"
                        value={tempConfig.locationText}
                        onChange={handleChange}
                        className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-600 focus:outline-none focus:border-${tempConfig.themeColor}-500`}
                    />
                </div>
            </div>
        </div>

        {/* Actions */}
        <div className="pb-4 space-y-3">
            <button 
                onClick={handleSave}
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