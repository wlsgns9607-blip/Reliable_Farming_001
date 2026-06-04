export interface UserProfile {
  uid: string;
  displayName: string;
  photoURL?: string;
  role: 'farmer' | 'family';
  familyUids?: string[];
  createdAt: any;
}

export interface FarmLog {
  id?: string;
  userId: string;
  userName: string;
  content: string;
  category: string;
  timestamp: any;
  imageUrl?: string;
  address?: string;
}

export interface HarvestGuide {
  cropName: string;
  startMonth: number;
  endMonth: number;
  description: string;
  healthBenefits: string;
}
