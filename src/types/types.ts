export type WorkType = '出社' | '在宅' | '午前休' | '午後休' | '休暇';

export interface WorkSchedule {
  employeeId: string;
  startDate: string;
  endDate: string;
  workType: WorkType;
} 