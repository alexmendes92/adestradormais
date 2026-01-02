
export type Tab = 'home' | 'diagnosis' | 'services' | 'contact' | 'breeds' | 'schedule' | 'admin';

export type AgeGroup = 'puppy' | 'adult' | '';
export type ProblemType = 'leash' | 'potty' | 'destruction' | 'aggression' | '';
export type DogSize = 'small' | 'medium' | 'large' | '';

export interface AppConfig {
  appName: string;
  professionalName: string;
  slogan: string;
  phone: string; // Format: 5511999999999
  profileImage: string;
  themeColor: 'orange' | 'blue' | 'green' | 'purple';
  instagramUrl: string;
  locationText: string;
  services: ServiceDetailData[]; // Novo campo para lista de serviços
}

export interface QuizState {
  step: number;
  name: string;
  age: AgeGroup;
  problem: ProblemType;
  breed: string;
  size: DogSize;
}

export interface ServiceData {
  id: string;
  title: string;
  description: string;
  image: string;
  tag: string;
  tagColor: string;
  popular?: boolean;
}

export interface ServiceDetailData extends ServiceData {
  fullDescription: string;
  benefits: string[];
  duration: string;
  location: string;
}

export interface BreedData {
  identificacao: {
    nome: string;
    slogan: string;
    origem: string;
    bandeira: string;
    recomendacaoPrincipal: string;
    fatoCurioso: string;
    id: string;
  };
  fisico: {
    altura: string;
    peso: string;
    expectativaVida: string;
    quedaPelo: number; // 1-5
  };
  estatisticas: {
    energia: number;
    inteligencia: number;
    afeto: number;
    guarda: number;
    treinabilidade: number;
    latidos: number;
  };
  saude: {
    consumoDiario: string;
    problemasSaude: string;
    manutencao: string;
  };
  convivencia: {
    sociabilidade: string;
    adaptacao: string;
    apartamento: string;
    nivelExperiencia: string;
    problemasComportamento: string;
  };
  historia: {
    cronologia: string[];
  };
  imagens: {
    categoria: string;
    img1: string;
    img2: string;
  };
}