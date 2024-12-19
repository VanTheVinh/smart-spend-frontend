import React, { useState, useEffect, useContext } from 'react';
import Modal from 'react-modal';
import { AppContext } from '~/contexts/appContext';
import { format, parse } from 'date-fns';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

Modal.setAppElement('#root');

const UpdateBillModal = ({ isOpen, onRequestClose, billToEdit, onBillUpdated }) => {
  const {userId, categories } = useContext(AppContext);
  const [billData, setBillData] = useState({
    id: '',
    type: '',
    amount: '',
    date: '',
    category_id: '',
    userId:'',
    description: '',
  });

  useEffect(() => {
    if (billToEdit) {
      setBillData({
        ...billToEdit,
        userId: userId || billToEdit.userId, // Ensure userId is set
      });
    }
  }, [billToEdit, userId]);

  const handleDateChange = (date) => {
    const formattedDate = format(date, 'dd-MM-yyyy');
    setBillData({ ...billData, date: formattedDate });
    console.log('date: ', formattedDate);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBillData({ ...billData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const updatedBillData = {
      ...billData,
      userId: userId || billData.userId,
    };

    try {
      const response = await fetch(`http://127.0.0.1:5000/update-bill/${billToEdit.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },  
        body: JSON.stringify(updatedBillData),
      });

      if (response.ok) {
        const updatedBill = await response.json();
        onBillUpdated(updatedBill);
        alert('Bill updated successfully!');

        onRequestClose();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error('Error during fetch:', error);
      alert(`Network error: ${error.message}`);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="modal max-w-lg w-full p-6 bg-white rounded-xl shadow-xl"
      overlayClassName="overlay fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center"
    >
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Cập nhật hóa đơn</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Bill Type */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Loại hóa đơn:</label>
          <select
            name="type"
            value={billData.type}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="THU">THU</option>
            <option value="CHI">CHI</option>
          </select>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Số tiền:</label>
          <input
            type="number"
            name="amount"
            value={billData.amount}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Date */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Ngày:</label>
          <DatePicker
            selected={billData.date ? parse(billData.date, 'dd-MM-yyyy', new Date()) : null}
            onChange={handleDateChange}
            dateFormat="dd/MM/yyyy"
            placeholderText="dd/mm/yyyy"
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Category Name */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Tên danh mục:</label>
          <select
            name="category_id"
            value={billData.category_id}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.category_name}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Mô tả:</label>
          <textarea
            name="description"
            value={billData.description}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            rows="4"
          ></textarea>
        </div>

        {/* Buttons */}
        <div className="flex justify-between gap-4">
          <button
            type="submit"
            className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
          >
            Cập nhật
          </button>
          <button
            type="button"
            onClick={onRequestClose}
            className="bg-gray-300 font-bold text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 transition"
          >
            Đóng
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default UpdateBillModal;
