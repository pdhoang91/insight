// components/Category/CategoriesSection.js
import React from 'react';
import { useCategories, useTopCategories } from '../../hooks/useCategories';
import Link from 'next/link';
import { FaBook, FaCode, FaMusic, FaFilm } from 'react-icons/fa'; // Ví dụ các icon
import ViewMoreButton from '../../components/Utils/ViewMoreButton';
import { useRouter } from 'next/router';

const iconMap = {
  Technology: <FaCode />,
  Literature: <FaBook />,
  Music: <FaMusic />,
  Movies: <FaFilm />,
  // Thêm các thể loại khác và icon tương ứng
};


const CategoriesSection = () => {
  const { categories, isLoading, isError } = useTopCategories();
  const router = useRouter();

  const handleSeeMore = () => {
    router.push(`/category`);
  };

  // if (isError) return <div className="text-red-500">Không thể tải danh mục</div>;
  // if (isLoading) return <div>Đang tải...</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Danh Mục</h2>
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
            <Link key={category.id} href={`/category/${encodeURIComponent(category.name)}`} className="flex items-center text-gray-700 hover:text-blue-500 transition-colors">
               
                <span className="mr-2">
                  {iconMap[category.name] || <FaBook />}
                </span>
                {category.name}
             
            </Link>
        ))}
      </div>
      {categories.length > 3 && (
         <ViewMoreButton onClick={handleSeeMore} />
      )}
    </div>
  );
};

export default CategoriesSection;

