export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface Profile {
  avatar?: string;
  bio?: string;
  college?: string;
}

export interface Course {
  _id: string;
  title: string;
  description: string;
  instructor: string;
  thumbnail: string;
  videoUrl?: string;
  studyMaterial?: {
    fileName: string;
    fileUrl: string;
    uploadedAt: Date;
  };
  category: {
    _id: string;
    name: string;
  };
  level: string;
  rating: number;
  totalStudents: number;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
  modules?: Module[];
}

export interface Module {
  _id: string;
  title: string;
  lessons: Lesson[];
}

export interface Lesson {
  _id: string;
  title: string;
  description?: string;
  duration: string;
  videoUrl: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
}