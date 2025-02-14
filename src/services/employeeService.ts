import { Employee } from '../types/types';

// モックデータ
const employees: Employee[] = [
  { id: "E001", name: "山田太郎", department: "営業部" },
  { id: "E002", name: "鈴木花子", department: "総務部" },
  { id: "E003", name: "佐藤一郎", department: "開発部" },
  // 他の社員データ
];

export const findEmployeeById = (id: string): Employee | undefined => {
  return employees.find(emp => emp.id === id);
};

export const getAllEmployees = (): Employee[] => {
  return employees;
}; 