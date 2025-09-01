
import useItemCategories from "../../../../hooks/inventory/useCategories";

const CategoryNav: React.FC<{
  selectedCategory: number | string;
  onSelectCategory: (category: number | string) => void;
  isMobile?: boolean;
}> = ({ selectedCategory, onSelectCategory, isMobile = false }) => {
  const {data: categories} = useItemCategories()

  return (
    <div className="flex space-x-2 overflow-x-auto pb-2">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onSelectCategory(category.id)}
          className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all duration-200 ${
            selectedCategory === category.id
              ? 'bg-blue-600 text-white shadow-lg scale-105'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {category.name}
        </button>
      ))}
       <button
          onClick={() => onSelectCategory(0)}
          className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all duration-200 bg-gray-100 text-gray-700 hover:bg-gray-200`}
        >
          All
        </button>
    </div>
  );
};

export default CategoryNav