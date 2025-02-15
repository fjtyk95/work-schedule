import React, { useEffect, useState, useRef, useMemo } from 'react';
import { WorkSchedule, Employee, BusinessDay } from '../types/types';
import { getAllEmployees, findEmployeeById } from '../services/employeeService';
import { getBusinessDays, getDayType, getWeekStartDate } from '../utils/dateUtils';
import { getSchedules, updateSchedule } from '../services/scheduleService';
import { EditScheduleModal } from './EditScheduleModal';

export const EmployeeScheduleList: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [businessDays, setBusinessDays] = useState<BusinessDay[]>([]);
  const [schedules, setSchedules] = useState<WorkSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSchedule, setSelectedSchedule] = useState<WorkSchedule | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchEmployeeId, setSearchEmployeeId] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  
  // ドラッグ選択用の状態
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartDate, setDragStartDate] = useState<Date | null>(null);
  const [dragEndDate, setDragEndDate] = useState<Date | null>(null);

  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return getWeekStartDate(today);
  });

  // 週の開始日と終了日を計算
  const weekRange = useMemo(() => {
    const endDate = new Date(currentWeekStart);
    endDate.setDate(endDate.getDate() + 6);
    return { startDate: currentWeekStart, endDate };
  }, [currentWeekStart]);

  // 初期化処理を更新
  useEffect(() => {
    const emps = getAllEmployees();
    setEmployees(emps);

    const scheduleData = getSchedules();
    setSchedules(scheduleData);

    const days = getBusinessDays(weekRange.startDate, weekRange.endDate);
    setBusinessDays(days);
    
    setLoading(false);
  }, [weekRange]);

  // 表示用の社員リストを計算
  const displayEmployees = useMemo(() => {
    if (!selectedEmployee) return employees;
    return employees.filter(emp => emp.id === selectedEmployee.id);
  }, [employees, selectedEmployee]);

  // 日付ヘッダーを計算
  const dateHeaders = useMemo(() => {
    return businessDays.map(day => ({
      date: day.date,
      display: day.date.toLocaleDateString('ja-JP', {
        month: 'numeric',
        day: 'numeric',
        weekday: 'short'
      })
    }));
  }, [businessDays]);

  // 社員検索
  const handleEmployeeSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchEmployeeId(value);
    setSelectedEmployee(value ? findEmployeeById(value) || null : null);
  };

  // 週の切り替え処理
  const handleWeekChange = (direction: 'prev' | 'next') => {
    setCurrentWeekStart(prev => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() + (direction === 'next' ? 7 : -7));
      return newDate;
    });
  };

  // 日付範囲のドラッグ選択機能
  const handleMouseDown = (date: Date, employee: Employee) => {
    if (!selectedEmployee || selectedEmployee.id !== employee.id) return;
    setIsDragging(true);
    setDragStartDate(date);
    setDragEndDate(date);
  };

  const handleMouseMove = (date: Date) => {
    if (isDragging) {
      setDragEndDate(date);
    }
  };

  const handleMouseUp = (employee: Employee) => {
    if (!isDragging || !dragStartDate || !dragEndDate) return;
    
    const startDate = new Date(Math.min(dragStartDate.getTime(), dragEndDate.getTime()));
    const endDate = new Date(Math.max(dragStartDate.getTime(), dragEndDate.getTime()));

    setSelectedSchedule({
      id: 'temp',
      employeeId: employee.id,
      employeeName: employee.name,
      startDate,
      endDate,
      workType: '出社'
    });
    
    setIsModalOpen(true);
    setIsDragging(false);
    setDragStartDate(null);
    setDragEndDate(null);
  };

  const isDateInRange = (date: Date) => {
    if (!isDragging || !dragStartDate || !dragEndDate) return false;
    const start = dragStartDate < dragEndDate ? dragStartDate : dragEndDate;
    const end = dragStartDate < dragEndDate ? dragEndDate : dragStartDate;
    return date >= start && date <= end;
  };

  // 日付ヘッダーのスタイルを決定する関数
  const getHeaderStyle = (date: Date) => {
    const dayType = getDayType(date);
    switch (dayType) {
      case 'sunday':
      case 'holiday':
        return 'text-red-600';
      case 'saturday':
        return 'text-blue-600';
      default:
        return 'text-gray-900';
    }
  };

  // セルのスタイルを決定する関数
  const getCellStyle = (date: Date, isInRange: boolean) => {
    const dayType = getDayType(date);
    const baseStyle = 'border p-2 text-center cursor-pointer select-none';
    const rangeStyle = isInRange ? 'bg-blue-100' : 'hover:bg-gray-50';
    
    switch (dayType) {
      case 'sunday':
      case 'holiday':
        return `${baseStyle} ${rangeStyle} bg-red-50`;
      case 'saturday':
        return `${baseStyle} ${rangeStyle} bg-blue-50`;
      default:
        return `${baseStyle} ${rangeStyle}`;
    }
  };

  if (loading) {
    return <div className="text-center p-4">読み込み中...</div>;
  }

  return (
    <div className="p-4">
      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          社員番号で検索
        </label>
        <input
          type="text"
          value={searchEmployeeId}
          onChange={handleEmployeeSearch}
          className="w-64 p-2 border rounded focus:outline-none focus:border-blue-500"
          placeholder="例: E001"
        />
        {selectedEmployee && (
          <div className="mt-2 text-sm text-gray-600">
            選択中: {selectedEmployee.name} ({selectedEmployee.department})
          </div>
        )}
      </div>

      {/* 週の切り替えコントロール */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => handleWeekChange('prev')}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 flex items-center"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          前週
        </button>
        <div className="text-lg font-semibold">
          {weekRange.startDate.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' })}
          ～
          {weekRange.endDate.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' })}
        </div>
        <button
          onClick={() => handleWeekChange('next')}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 flex items-center"
        >
          次週
          <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 sticky left-0 bg-gray-100 min-w-[200px]">社員情報</th>
              {dateHeaders.map(({ date, display }) => (
                <th 
                  key={date.toISOString()} 
                  className={`border p-2 min-w-[100px] ${getHeaderStyle(date)}`}
                >
                  {display}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayEmployees.map(employee => (
              <tr key={employee.id}>
                <td className="border p-2 sticky left-0 bg-white">
                  <div className="font-medium">{employee.name}</div>
                  <div className="text-sm text-gray-600">社員番号：{employee.id}</div>
                  <div className="text-sm text-gray-500">{employee.department}</div>
                </td>
                {businessDays.map(({ date }) => {
                  const schedule = schedules.find(
                    s => s.employeeId === employee.id &&
                    s.startDate <= date &&
                    s.endDate >= date
                  );
                  return (
                    <td 
                      key={date.toISOString()}
                      className={getCellStyle(date, isDateInRange(date))}
                      onMouseDown={() => handleMouseDown(date, employee)}
                      onMouseMove={() => handleMouseMove(date)}
                      onMouseUp={() => handleMouseUp(employee)}
                      onMouseLeave={() => {
                        if (isDragging) {
                          handleMouseUp(employee);
                        }
                      }}
                    >
                      {schedule?.workType || '-'}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedSchedule && (
        <EditScheduleModal
          schedule={selectedSchedule}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedSchedule(null);
          }}
          onSave={(updated) => {
            updateSchedule(updated);
            setSchedules(prev => 
              prev.map(s => s.id === updated.id ? updated : s)
            );
            setIsModalOpen(false);
            setSelectedSchedule(null);
          }}
        />
      )}
    </div>
  );
};

export default EmployeeScheduleList; 