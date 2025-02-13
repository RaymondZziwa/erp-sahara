//@ts-nocheck
import useItemCategories from "../../../../hooks/inventory/useCategories";
import { useEffect } from "react";

  const CategoryNav = ({ selectedCategory, onSelectCategory }) => {
    const {data, refresh} = useItemCategories()

    useEffect(()=> {
        if(!data) {
            refresh()
        }
    }, [])
    return (
      <div className="w-full overflow-x-auto bg-white rounded-xl">
        <div className="flex space-x-4 px-4 py-2">
          {data.map((category) => (
            <button
              key={category.id}
              onClick={() => onSelectCategory(category.name)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200
                ${
                  selectedCategory.toLocaleLowerCase() === category.name.toLocaleLowerCase()
                    ? "border-2 border-teal-500 text-teal-500 font-semibold"
                    : "text-gray-700 hover:text-teal-500"
                }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>
    );
  };

export default CategoryNav