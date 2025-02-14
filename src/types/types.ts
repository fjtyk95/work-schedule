export type Employee = {
  id: string;
  name: string;
  department: string;
};

export type BaseWorkType = '出社' | '在宅' | '午前休' | '午後休' | '休暇';
export type HalfDayWorkType = '出社' | '在宅';
export type WorkType = BaseWorkType | `午前休_午後${HalfDayWorkType}` | `午後休_午前${HalfDayWorkType}`;

export type WorkSchedule = {
  id: string;
  employeeId: string;
  employeeName: string;
  startDate: Date;
  endDate: Date;
  workType: WorkType;
};

// 銀行営業日判定用
export type BusinessDay = {
  date: Date;
  isBusinessDay: boolean;
}; 