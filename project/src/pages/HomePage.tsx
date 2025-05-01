import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Search, Award, BookOpen, Users, Play } from 'lucide-react';
import { courses, categories } from '../data/mockData';
import CourseCard from '../components/ui/CourseCard';
import CategoryCard from '../components/ui/CategoryCard';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const featuredCourses = courses.filter(course => course.featured).slice(0, 3);
  const popularCategories = categories.slice(0, 6);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 max-w-lg">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                Learn from YouTube's Best Tutorials, <span className="text-accent-300">Organized</span> for You
              </h1>
              <p className="text-lg md:text-xl opacity-90">
                Discover curated courses built from the best YouTube content, organized into structured learning paths.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <button 
                  onClick={() => navigate('/courses')}
                  className="btn bg-white text-primary-600 hover:bg-gray-100 py-3 px-6"
                >
                  Browse Courses
                </button>
                <button 
                  onClick={() => navigate('/register')}
                  className="btn bg-transparent text-white border border-white hover:bg-white/10 py-3 px-6"
                >
                  Sign Up Free
                </button>
              </div>
            </div>
            <div className="hidden md:block relative bg-white/10 p-6 rounded-lg shadow-lg">
              <img 
                src="https://images.pexels.com/photos/4145153/pexels-photo-4145153.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
                alt="Online learning" 
                className="rounded-lg h-80 w-full object-cover"
              />
              <div className="absolute -bottom-4 -right-4 bg-white text-gray-800 rounded-lg p-4 shadow-lg max-w-xs animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="bg-accent-500 text-white p-2 rounded-full">
                    <Play className="h-4 w-4" />
                  </div>
                  <p className="font-medium">Join 25,000+ students learning now</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="h-16 bg-white rounded-t-[5rem] -mb-1"></div>
      </section>

      {/* Featured Courses */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Featured Courses</h2>
            <button 
              onClick={() => navigate('/courses')}
              className="flex items-center text-primary-600 hover:text-primary-700 font-medium"
            >
              View all courses <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCourses.map(course => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Browse Categories</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore our diverse range of categories to find the perfect learning path for your needs.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            {popularCategories.map(category => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
          <div className="mt-10 text-center">
            <button 
              onClick={() => navigate('/categories')}
              className="btn btn-outline px-6"
            >
              View All Categories
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose EduTube?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We transform the world's best YouTube tutorials into structured, cohesive learning experiences.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center text-center">
              <div className="rounded-full bg-primary-100 p-4 mb-6 text-primary-600">
                <BookOpen className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Structured Content</h3>
              <p className="text-gray-600">
                Videos organized into logical modules with clear learning paths, making it easier to progress through topics.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="rounded-full bg-secondary-100 p-4 mb-6 text-secondary-600">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Community Learning</h3>
              <p className="text-gray-600">
                Join a community of learners working through the same content, sharing insights and solving problems together.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="rounded-full bg-accent-100 p-4 mb-6 text-accent-600">
                <Award className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Curated Quality</h3>
              <p className="text-gray-600">
                Only the highest quality tutorials make it into our courses, saving you time searching for reliable content.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-secondary-600 to-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Ready to start learning?</h2>
              <p className="text-xl mb-8">Join thousands of students already learning with our structured courses.</p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <button 
                  onClick={() => navigate('/register')}
                  className="btn bg-white text-primary-600 hover:bg-gray-100 py-3 px-6"
                >
                  Get Started Free
                </button>
                <button 
                  onClick={() => navigate('/courses')}
                  className="btn bg-transparent text-white border border-white hover:bg-white/10 py-3 px-6"
                >
                  Explore Courses
                </button>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Find the perfect course</h3>
                <form className="space-y-4">
                  <div>
                    <label htmlFor="searchQuery" className="sr-only">Search for courses</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="searchQuery"
                        name="searchQuery"
                        type="text"
                        className="input pl-10"
                        placeholder="What do you want to learn?"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="category" className="sr-only">Category</label>
                    <select id="category" name="category" className="input">
                      <option value="">Select a category</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                  </div>
                  <button 
                    type="submit"
                    className="w-full btn btn-primary py-3"
                  >
                    Search Courses
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Students Say</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Hear from people who have transformed their learning through our platform.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <img 
                    className="h-12 w-12 rounded-full"
                    src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                    alt="User avatar"
                  />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Alex Johnson</h3>
                  <p className="text-gray-500">Web Developer</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "I've tried many online learning platforms, but EduTube's organized approach to YouTube content is exactly what I needed. The structured courses helped me master React in just a few weeks."
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <img 
                    className="h-12 w-12 rounded-full"
                    src="https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                    alt="User avatar"
                  />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Maria Garcia</h3>
                  <p className="text-gray-500">Data Scientist</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "The Python for Data Science course completely changed my career trajectory. Having all the best content in one place saved me countless hours of searching YouTube for quality tutorials."
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <img 
                    className="h-12 w-12 rounded-full"
                    src="https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                    alt="User avatar"
                  />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">James Wilson</h3>
                  <p className="text-gray-500">UX Designer</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "EduTube took the overwhelming amount of design content on YouTube and transformed it into a coherent learning journey. I'm now confidently applying UI/UX principles in my daily work."
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;