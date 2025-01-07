import { AppContext } from '~/contexts/appContext';
import AddCategory from './addCategory';
import React, { useState, useEffect, useContext, useCallback } from 'react';
import UpdateCategory from './updateCategory';
import DeleteCategory from './deleteCategory';
import { getCategoryByUserId } from '~/services/categoryService';
import { getUserInfo } from '~/services/userService';
import '@fortawesome/fontawesome-free/css/all.min.css';

const CategoryList = () => {
  const { userId } = useContext(AppContext);
  const [categories, setCategories] = useState([]);
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [amountSortOrder] = useState('default');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [filterType, setFilterType] = useState('ALL');
  const [totalIncomePercentageLimit, setTotalIncomePercentageLimit] =
    useState(0);
  const [totalExpensePercentageLimit, setTotalExpensePercentageLimit] =
    useState(0);

  const formatCurrency = (amount) => {
    if (typeof amount === 'string') {
      amount = parseFloat(amount);
    }
    return amount.toLocaleString('vi-VN');
  };

  const fetchCategories = useCallback(async () => {
    if (!userId) return;
    try {
      console.log('Budget', budget);
      
      const data = await getCategoryByUserId(userId);
      setCategories(data);
      console.log('Categories:', categories);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError(error.message);
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const fetchUserInfo = useCallback(async () => {
    if (!userId) return;
    try {
      const data = await getUserInfo(userId);
      setBudget(data.budget);
      setLoading(false);
    } catch (error) {
      console.error('Lỗi khi lấy thông tin người dùng:', error);
      setError(error.message);
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchCategories();
      fetchUserInfo();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    if (categories && categories.length > 0) {
      const totalIncome = categories.reduce((acc, category) => {
        return category.category_type === 'THU'
          ? acc + (parseFloat(category.percentage_limit) || 0)
          : acc;
      }, 0);
      const totalExpense = categories.reduce((acc, category) => {
        return category.category_type === 'CHI'
          ? acc + (parseFloat(category.percentage_limit) || 0)
          : acc;
      }, 0);
      setTotalIncomePercentageLimit(totalIncome);
      setTotalExpensePercentageLimit(totalExpense);
      console.log('Total Income Percentage Limit:', totalIncome); // Kiểm tra giá trị tổng giới hạn phần trăm THU
      console.log('Total Expense Percentage Limit:', totalExpense); // Kiểm tra giá trị tổng giới hạn phần trăm CHI
    }
  }, [categories]);

  const handleOpenUpdateModal = (category) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleOpenDeleteModal = (category) => {
    setSelectedCategory(category);
    setIsDeleteModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCategory(null);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedCategory(null);
  };

  const handleDeleteCategory = (categoryId) => {
    setCategories(categories.filter((category) => category.id !== categoryId));
  };

  const filteredCategories = categories
    .filter(
      (category) =>
        filterType === 'ALL' ? true : category.category_type === filterType, // Đảm bảo so sánh với category.category_type
    )
    .sort((a, b) => {
      if (amountSortOrder === 'default') {
        return new Date(a.date) - new Date(b.date);
      }
      const amountA = a.amount;
      const amountB = b.amount;
      return amountSortOrder === 'asc' ? amountA - amountB : amountB - amountA;
    });

  // const toggleAmountSortOrder = (order) => {
  //   setAmountSortOrder(order);
  // };

  const handleUpdateCategorySuccess = async () => {
    await fetchCategories();
    handleCloseModal();
  };

  const calculateProgress = (amount, actualAmount) => {
    if (!amount || !actualAmount) return 0;
    return Math.min(Math.round((actualAmount / amount) * 100), 100); // Làm tròn số về số nguyên
  };

  if (loading) {
    return <div>Loading categories...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="flex flex-col justify-center ">
      <div className="min-h-screen">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-3xl font-bold text-center mt-3 text-tealColor11">
            DANH SÁCH DANH MỤC
          </h3>

          <div className="flex justify-between mb-4 items-center">
            <div className="flex justify-start mb-6">
              <AddCategory
                onCategoryAdded={fetchCategories}
                totalIncomePercentageLimit={totalIncomePercentageLimit}
                totalExpensePercentageLimit={totalExpensePercentageLimit}
              />
            </div>

            <div className="flex items-center space-x-4 text-gray-600">
              <i className="fa-solid fa-filter"></i>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="p-2 border border-gray-300 rounded-md"
              >
                <option value="ALL">Tất cả</option>
                <option value="THU">Thu nhập</option>
                <option value="CHI">Chi tiêu</option>
              </select>
            </div>
          </div>

          {filteredCategories.length === 0 ? (
            <p className="text-center text-gray-600">Không có danh mục nào.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 ">
              {filteredCategories.map((category, index) => {
                const progress = calculateProgress(
                  category.amount,
                  category.actual_amount,
                );

                // Đổi màu nền và thanh tiến trình theo loại danh mục
                const categoryBackgroundColor =
                  category.category_type === 'CHI'
                    ? 'bg-orange-50' // Nền đỏ nhạt cho Chi tiêu
                    : category.category_type === 'THU'
                    ? 'bg-teal-50' // Nền xanh dương nhạt cho Thu nhập
                    : 'bg-teal-50'; // Màu nền mặc định

                const progressBarColor =
                  category.category_type === 'CHI'
                    ? 'bg-red-400' // Màu đỏ cho Chi tiêu
                    : category.category_type === 'THU'
                    ? 'bg-teal-500' // Màu xanh dương cho Thu nhập
                    : 'bg-tealColor11'; // Màu mặc định nếu không phải THU hoặc CHI

                return (
                  <div
                    key={category.id}
                    className={`p-6 rounded-xl shadow flex flex-col group ${categoryBackgroundColor}`}
                  >
                    <div className="text-3xl font-bold text-tealColor02">
                      {category.category_name}
                    </div>
                    <div className="text-sm text-gray-500 mt-2">
                      {category.category_type}
                    </div>
                    <div className="mt-4 flex-grow">
                      <div className="flex justify-between">
                        <span className="text-gray-700">Giới hạn:</span>
                        <span className="font-semibold">
                          {category.percentage_limit}%
                        </span>
                      </div>
                    </div>
                    

                    <div className="mt-4 flex-grow">
                      <div className="flex justify-between">
                        <span className="text-gray-700">Ngân sách:</span>
                        <span className="font-semibold">
                          {formatCurrency(category.amount)} đ
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 flex-grow">
                      <div className="flex justify-between">
                        <span className="text-gray-700">Ngân sách thực tế:</span>
                        <span className="font-semibold">
                          {formatCurrency(category.actual_amount)} đ
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="text-gray-700 mb-10">Đã thu/chi:</div>
                      <div className="w-full bg-gray-300 rounded-full h-2 mt-1">
                        <div
                          className={`h-2 rounded-full ${progressBarColor}`}
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <div className="text-right text-xl font-bold text-gray-600 mt-1">
                        {progress}%
                      </div>
                    </div>

                    {/* Nút sửa và xóa */}
                    <div className="mt-4 flex justify-end space-x-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={() => handleOpenUpdateModal(category)}
                        className="text-tealColor00 hover:text-teal-700"
                      >
                        <i className="fa-solid fa-pen"></i>
                      </button>
                      <button
                        onClick={() => handleOpenDeleteModal(category)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <i className="fa-solid fa-trash-can ml-4"></i>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {isModalOpen && (
          <UpdateCategory
            isOpen={isModalOpen}
            onRequestClose={handleCloseModal}
            category={selectedCategory}
            onUpdateSuccess={handleUpdateCategorySuccess}
            totalIncomePercentageLimit={totalIncomePercentageLimit}
            totalExpensePercentageLimit={totalExpensePercentageLimit}
          />
        )}

        {isDeleteModalOpen && (
          <DeleteCategory
            isOpen={isDeleteModalOpen}
            onRequestClose={handleCloseDeleteModal}
            category={selectedCategory}
            onDelete={handleDeleteCategory}
          />
        )}
      </div>
    </div>
  );
};

export default CategoryList;
