import React, { useEffect, useState } from 'react';
import { WorkSchedule, Employee, BusinessDay } from '../types/types';
import { getAllEmployees } from '../services/employeeService';
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

  useEffect(() => {
    const init = async () => {
      try {
        // 社員データの取得
        const emps = getAllEmployees();
        setEmployees(emps);

        // 今日から30日分の営業日を取得
        const today = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 30);

        const days = await getBusinessDays(today, endDate);
        setBusinessDays(days.filter(day => day.isBusinessDay));

        // スケジュールデータの取得を追加
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
      <h2 className="text-xl font-bold mb-6">勤務予定一覧</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
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
              <tr key={employee.id}>
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
                      className={`border p-2 text-center cursor-pointer hover:bg-gray-100`}
                      onClick={() => handleDateClick(employee, day.date)}
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