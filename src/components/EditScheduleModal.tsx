import React, { useState, useEffect } from 'react';
import { WorkSchedule, WorkType, BaseWorkType, HalfDayWorkType } from '../types/types';

interface EditScheduleModalProps {
  schedule: WorkSchedule;
  isOpen: boolean;
  onClose: () => void;
  onSave: (schedule: WorkSchedule) => void;
}

export const EditScheduleModal: React.FC<EditScheduleModalProps> = ({
  schedule,
  isOpen,
  onClose,
  onSave
}) => {
  const [editedSchedule, setEditedSchedule] = useState<WorkSchedule>(schedule);
  const baseWorkTypes: BaseWorkType[] = ['出社', '在宅', '午前休', '午後休', '休暇'];
  const halfDayWorkTypes: HalfDayWorkType[] = ['出社', '在宅'];

  // 初期値の設定を修正
  const parseWorkType = (workType: WorkType) => {
    const parts = workType.split('_');
    return {
      baseType: parts[0] as BaseWorkType,
      halfDayType: parts[1]?.includes('午前') 
        ? parts[1].replace('午前', '') 
        : parts[1]?.replace('午後', '') || '出社'
    };
  };

  const [selectedBaseType, setSelectedBaseType] = useState<BaseWorkType>(
    parseWorkType(schedule.workType).baseType
  );
  
  const [selectedHalfDayType, setSelectedHalfDayType] = useState<HalfDayWorkType>(
    parseWorkType(schedule.workType).halfDayType as HalfDayWorkType
  );

  useEffect(() => {
    const { baseType, halfDayType } = parseWorkType(schedule.workType);
    setEditedSchedule(schedule);
    setSelectedBaseType(baseType);
    setSelectedHalfDayType(halfDayType as HalfDayWorkType);
  }, [schedule]);

  const handleWorkTypeChange = (baseType: BaseWorkType) => {
    setSelectedBaseType(baseType);
    let newWorkType: WorkType = baseType;
    
    if (baseType === '午前休') {
      newWorkType = `午前休_午後${selectedHalfDayType}` as WorkType;
    } else if (baseType === '午後休') {
      newWorkType = `午後休_午前${selectedHalfDayType}` as WorkType;
    }

    setEditedSchedule(prev => ({
      ...prev,
      workType: newWorkType
    }));
  };

  const handleHalfDayTypeChange = (halfDayType: HalfDayWorkType) => {
    setSelectedHalfDayType(halfDayType);
    const newWorkType = selectedBaseType === '午前休'
      ? `午前休_午後${halfDayType}`
      : `午後休_午前${halfDayType}`;
    
    setEditedSchedule(prev => ({
      ...prev,
      workType: newWorkType as WorkType
    }));
  };

  if (!isOpen) return null;

  const formatWorkType = (workType: WorkType) => {
    if (!workType.includes('_')) return workType;
    const [base, half] = workType.split('_');
    return `${base}（${half}）`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">スケジュール編集</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              社員情報
            </label>
            <div className="p-2 bg-gray-50 rounded border">
              <div className="font-medium">{editedSchedule.employeeName}</div>
              <div className="text-sm text-gray-600">社員番号：{editedSchedule.employeeId}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                開始日
              </label>
              <input
                type="date"
                value={editedSchedule.startDate.toISOString().split('T')[0]}
                onChange={(e) => setEditedSchedule(prev => ({
                  ...prev,
                  startDate: new Date(e.target.value)
                }))}
                className="w-full p-2 border rounded focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                終了日
              </label>
              <input
                type="date"
                value={editedSchedule.endDate.toISOString().split('T')[0]}
                onChange={(e) => setEditedSchedule(prev => ({
                  ...prev,
                  endDate: new Date(e.target.value)
                }))}
                className="w-full p-2 border rounded focus:outline-none focus:border-blue-500"
                min={editedSchedule.startDate.toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              勤務形態
            </label>
            <select
              value={selectedBaseType}
              onChange={(e) => handleWorkTypeChange(e.target.value as BaseWorkType)}
              className="w-full p-2 border rounded focus:outline-none focus:border-blue-500"
            >
              {baseWorkTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {(selectedBaseType === '午前休' || selectedBaseType === '午後休') && (
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                {selectedBaseType === '午前休' ? '午後の勤務形態' : '午前の勤務形態'}
              </label>
              <select
                value={selectedHalfDayType}
                onChange={(e) => handleHalfDayTypeChange(e.target.value as HalfDayWorkType)}
                className="w-full p-2 border rounded focus:outline-none focus:border-blue-500"
              >
                {halfDayWorkTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          )}

          <div className="pt-4 border-t mt-6">
            <div className="text-sm text-gray-600 mb-4">
              設定する勤務形態：{formatWorkType(editedSchedule.workType)}
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                キャンセル
              </button>
              <button
                onClick={() => {
                  onSave(editedSchedule);
                  onClose();
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 