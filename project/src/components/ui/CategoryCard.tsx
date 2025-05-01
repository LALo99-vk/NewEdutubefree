import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Code, BarChart, Smartphone, Layout, GitBranch, Brain,
  BookOpen, Database, Video, Briefcase, Globe, Music
} from 'lucide-react';
import { Category } from '../../types';

interface CategoryCardProps {
  category: Category;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  const navigate = useNavigate();
  
  const getIcon = () => {
    switch (category.icon) {
      case 'code':
        return <Code className="h-6 w-6" />;
      case 'bar-chart':
        return <BarChart className="h-6 w-6" />;
      case 'smartphone':
        return <Smartphone className="h-6 w-6" />;
      case 'layout':
        return <Layout className="h-6 w-6" />;
      case 'git-branch':
        return <GitBranch className="h-6 w-6" />;
      case 'brain':
        return <Brain className="h-6 w-6" />;
      case 'book':
        return <BookOpen className="h-6 w-6" />;
      case 'database':
        return <Database className="h-6 w-6" />;
      case 'video':
        return <Video className="h-6 w-6" />;
      case 'briefcase':
        return <Briefcase className="h-6 w-6" />;
      case 'globe':
        return <Globe className="h-6 w-6" />;
      case 'music':
        return <Music className="h-6 w-6" />;
      default:
        return <BookOpen className="h-6 w-6" />;
    }
  };

  return (
    <div 
      className="card p-6 cursor-pointer transition-all duration-300 hover:translate-y-[-5px]"
      onClick={() => navigate(`/courses?category=${encodeURIComponent(category.name)}`)}
    >
      <div className="flex flex-col items-center text-center">
        <div className="rounded-full bg-primary-100 p-3 mb-4 text-primary-600">
          {getIcon()}
        </div>
        <h3 className="text-lg font-semibold mb-1">{category.name}</h3>
        <p className="text-sm text-gray-500">{category.count} courses</p>
      </div>
    </div>
  );
};

export default CategoryCard;