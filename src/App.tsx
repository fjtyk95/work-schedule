import React from 'react';
import { HashRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { WorkScheduleForm } from './components/WorkScheduleForm';
import { EmployeeScheduleList } from './components/EmployeeScheduleList';
import { WorkSchedule } from './types/types';
import { addSchedule } from './services/scheduleService';

// ナビゲーションリンクコンポーネント
const NavLink: React.FC<{ to: string; children: React.ReactNode }> = ({ to, children }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link 
      to={to}
      className={`flex items-center space-x-2 ${
        isActive 
          ? 'text-blue-600 font-bold' 
          : 'text-gray-600 hover:text-blue-500'
      }`}
    >
      {children}
    </Link>
  );
};

// フォームのラッパーコンポーネント
const WorkScheduleFormWrapper: React.FC = () => {
  const navigate = useNavigate();

  const handleSubmit = (schedule: Omit<WorkSchedule, 'id'>) => {
    try {
      const newSchedule = addSchedule(schedule);
      console.log('登録完了:', newSchedule);
      alert('勤務予定を登録しました');
      navigate('/schedule');
    } catch (error) {
      console.error('登録に失敗しました:', error);
      alert('登録に失敗しました');
    }
  };

  return <WorkScheduleForm onSubmit={handleSubmit} />;
};

function App() {
  return (
    <HashRouter>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">勤務スケジュール管理システム</h1>
        <nav className="mb-8 bg-gray-100 p-4 rounded-lg">
          <ul className="flex space-x-6">
            <li>
              <NavLink to="/">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
                </svg>
                <span>新規登録</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/schedule">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                </svg>
                <span>一覧表示</span>
              </NavLink>
            </li>
          </ul>
        </nav>

        <div className="bg-white rounded-lg shadow">
          <Routes>
            <Route path="/" element={<WorkScheduleFormWrapper />} />
            <Route path="/schedule" element={<EmployeeScheduleList />} />
          </Routes>
        </div>
      </div>
    </HashRouter>
  );
}

export default App; 