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
  level: string;
  rating: number;
  totalStudents: number;
  modules: Module[];
  createdAt: string;
  updatedAt: string;
  videoUrl?: string;
  duration?: string;
  lessonsCount?: number;
  studentsCount?: number;
  featured?: boolean;
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