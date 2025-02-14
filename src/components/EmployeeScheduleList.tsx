import React, { useEffect, useState, useRef } from 'react';
import { WorkSchedule, Employee, BusinessDay } from '../types/types';
import { getAllEmployees, findEmployeeById } from '../services/employeeService';
import { getBusinessDays } from '../utils/dateUtils';
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
  const tableRef = useRef<HTMLTableElement>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const emps = getAllEmployees();
        setEmployees(emps);

        const today = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 30);

        const days = await getBusinessDays(today, endDate);
        setBusinessDays(days.filter(day => day.isBusinessDay));

        const scheduleData = getSchedules();
        setSchedules(scheduleData);
      } catch (error) {
        console.error('データの取得に失敗しました:', error);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const handleEmployeeSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchEmployeeId(value);
    
    if (value) {
      const employee = findEmployeeById(value);
      setSelectedEmployee(employee || null);
    } else {
      setSelectedEmployee(null);
    }
  };

  const handleDragStart = (date: Date, employee: Employee) => {
    if (!selectedEmployee || selectedEmployee.id !== employee.id) return;
    
    setIsDragging(true);
    setDragStartDate(date);
    setDragEndDate(date);
  };

  const handleDragOver = (date: Date) => {
    if (!isDragging) return;
    setDragEndDate(date);
  };

  const handleDragEnd = (employee: Employee) => {
    if (!isDragging || !dragStartDate || !dragEndDate) return;
    setIsDragging(false);

    // 日付範囲を正規化（開始日が終了日より後の場合は入れ替え）
    const startDate = dragStartDate < dragEndDate ? dragStartDate : dragEndDate;
    const endDate = dragStartDate < dragEndDate ? dragEndDate : dragStartDate;

    const newSchedule: Omit<WorkSchedule, 'id'> & { id: string } = {
      id: 'temp',
      employeeId: employee.id,
      employeeName: employee.name,
      startDate,
      endDate,
      workType: '出社'
    };

    setSelectedSchedule(newSchedule);
    setIsModalOpen(true);
    setDragStartDate(null);
    setDragEndDate(null);
  };

  const isDateInRange = (date: Date) => {
    if (!isDragging || !dragStartDate || !dragEndDate) return false;
    return date >= (dragStartDate < dragEndDate ? dragStartDate : dragEndDate) &&
           date <= (dragStartDate < dragEndDate ? dragEndDate : dragStartDate);
  };

  const handleDateClick = (employee: Employee, date: Date) => {
    const existingSchedule = schedules.find(
      s => s.employeeId === employee.id &&
      s.startDate <= date &&
      s.endDate >= date
    );

    if (existingSchedule) {
      setSelectedSchedule(existingSchedule);
    } else {
      // 新規スケジュール作成
      const newSchedule: Omit<WorkSchedule, 'id'> & { id: string } = {
        id: 'temp', // 一時的なID
        employeeId: employee.id,
        employeeName: employee.name,
        startDate: date,
        endDate: date,
        workType: '出社'
      };
      setSelectedSchedule(newSchedule);
    }
    setIsModalOpen(true);
  };

  const handleScheduleUpdate = (updatedSchedule: WorkSchedule) => {
    try {
      updateSchedule(updatedSchedule);
      setSchedules(prev => 
        prev.map(s => s.id === updatedSchedule.id ? updatedSchedule : s)
      );
      alert('スケジュールを更新しました');
    } catch (error) {
      console.error('更新に失敗しました:', error);
      alert('更新に失敗しました');
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

      <div className="overflow-x-auto">
        <table ref={tableRef} className="min-w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 sticky left-0 bg-gray-100 min-w-[200px]">社員情報</th>
              {businessDays.map(day => (
                <th key={day.date.toISOString()} className="border p-2 min-w-[100px]">
                  {day.date.toLocaleDateString('ja-JP', {
                    month: 'numeric',
                    day: 'numeric',
                    weekday: 'short'
                  })}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {employees.map(employee => (
              <tr 
                key={employee.id}
                className={selectedEmployee && selectedEmployee.id !== employee.id ? 'opacity-50' : ''}
              >
                <td className="border p-2 sticky left-0 bg-white">
                  <div className="font-medium">{employee.name}</div>
                  <div className="text-sm text-gray-600">社員番号：{employee.id}</div>
                  <div className="text-sm text-gray-500">{employee.department}</div>
                </td>
                {businessDays.map(day => {
                  const schedule = schedules.find(
                    s => s.employeeId === employee.id &&
                    s.startDate <= day.date &&
                    s.endDate >= day.date
                  );
                  return (
                    <td 
                      key={day.date.toISOString()} 
                      className={`border p-2 text-center 
                        ${(!selectedEmployee || selectedEmployee.id === employee.id) ? 'cursor-pointer hover:bg-gray-100' : ''}
                        ${isDateInRange(day.date) ? 'bg-blue-100' : ''}`}
                      onMouseDown={() => handleDragStart(day.date, employee)}
                      onMouseOver={() => handleDragOver(day.date)}
                      onMouseUp={() => handleDragEnd(employee)}
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
          onSave={handleScheduleUpdate}
        />
      )}
    </div>
  );
};

export default EmployeeScheduleList; 