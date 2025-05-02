import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface Category {
  _id: string;
  name: string;
  description?: string;
  count?: number;
}

const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('http://localhost:5000/api/categories');
        
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        
        const data = await response.json();
        setCategories(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching categories:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCategories();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  // Colors for category cards
  const categoryColors = [
    'bg-blue-100 text-blue-800',
    'bg-green-100 text-green-800',
    'bg-purple-100 text-purple-800',
    'bg-yellow-100 text-yellow-800',
    'bg-red-100 text-red-800',
    'bg-indigo-100 text-indigo-800',
    'bg-pink-100 text-pink-800',
    'bg-teal-100 text-teal-800'
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Browse Categories</h1>
      
      {categories.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-600">No categories found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <Link 
              key={category._id} 
              to={`/courses?category=${category._id}`}
              className="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className={`p-6 ${categoryColors[index % categoryColors.length]}`}>
                <h3 className="text-xl font-bold mb-2">{category.name}</h3>
                {category.description && (
                  <p className="text-sm mb-4">{category.description}</p>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-sm">{category.count || 0} courses</span>
                  <ArrowRight className="h-5 w-5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Progress tracking info section */}
      <div className="mt-12 bg-primary-50 rounded-lg p-6 border border-primary-100">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Track Your Progress</h2>
        <p className="text-gray-600 mb-4">
          As you enroll and complete courses, your progress will be tracked automatically. 
          Visit your dashboard to see detailed statistics on your learning journey.
        </p>
        <Link 
          to="/dashboard" 
          className="inline-block bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 transition"
        >
          View My Dashboard
        </Link>
      </div>
    </div>
  );
};

export default CategoriesPage;
