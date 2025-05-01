export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatar?: string;
  createdAt: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  thumbnail: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  rating: number;
  totalStudents: number;
  featured?: boolean;
  createdAt: string;
  updatedAt: string;
  modules: Module[];
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: string;
  videoUrl: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
}