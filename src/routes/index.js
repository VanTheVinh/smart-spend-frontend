import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from '~/pages/login';
import Register from '~/pages/register';
import Dashboard from '~/pages/dashboard';
import UserBill from '~/pages/bill/userBill';
import GroupBill from '~/pages/bill/groupBill';
import CategoryList from '~/pages/category';
import Group from '~/pages/group';
import GroupDetail from '~/pages/group/groupDetail';

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/user-bill" element={<UserBill />} />
      <Route path="/group-bill" element={<GroupBill />} />
      <Route path="/category" element={<CategoryList />} />
      <Route path="/group" element={<Group />} />
      <Route path="/group-detail/:groupId" element={<GroupDetail />} />
    </Routes>
  );
};

export default AppRouter;
