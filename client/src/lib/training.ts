export type AttendanceStatus = "present" | "absent" | "excused" | "late";

export interface AttendanceRecord {
  id?: string;
  status: AttendanceStatus | string;
  notes?: string;
  createdAt?: number;
}

export interface AttendanceSummary {
  total: number;
  present: number;
  late: number;
  absent: number;
  excused: number;
  rate: number;
}

export interface PlayerMatchStatItem {
  id?: string;
  goals?: number;
  assists?: number;
  penalties?: number;
  shots?: number;
  plusMinus?: number;
  minutesPlayed?: number;
  createdAt?: number;
}

export interface PlayerMatchStatsSummary {
  matchesPlayed: number;
  totalGoals: number;
  totalAssists: number;
  totalPoints: number;
  totalPenalties: number;
  totalShots: number;
  totalPlusMinus: number;
}

export function computeAttendanceRate(items: Partial<AttendanceRecord>[]): number {
  if (!items || items.length === 0) return 0;
  const attended = items.filter((x) => x.status === "present" || x.status === "late").length;
  return Math.round((attended / items.length) * 100);
}

export function summarizeAttendance(items: Partial<AttendanceRecord>[]): AttendanceSummary {
  if (!items || items.length === 0) {
    return { total: 0, present: 0, late: 0, absent: 0, excused: 0, rate: 0 };
  }

  let present = 0;
  let late = 0;
  let absent = 0;
  let excused = 0;

  items.forEach((item) => {
    if (item.status === "present") present++;
    else if (item.status === "late") late++;
    else if (item.status === "absent") absent++;
    else if (item.status === "excused") excused++;
  });

  const total = items.length;
  const rate = Math.round(((present + late) / total) * 100);

  return { total, present, late, absent, excused, rate };
}

export function summarizePlayerMatchStats(items: Partial<PlayerMatchStatItem>[]): PlayerMatchStatsSummary {
  if (!items || items.length === 0) {
    return {
      matchesPlayed: 0,
      totalGoals: 0,
      totalAssists: 0,
      totalPoints: 0,
      totalPenalties: 0,
      totalShots: 0,
      totalPlusMinus: 0,
    };
  }

  let totalGoals = 0;
  let totalAssists = 0;
  let totalPenalties = 0;
  let totalShots = 0;
  let totalPlusMinus = 0;

  items.forEach((item) => {
    totalGoals += item.goals || 0;
    totalAssists += item.assists || 0;
    totalPenalties += item.penalties || 0;
    totalShots += item.shots || 0;
    totalPlusMinus += item.plusMinus || 0;
  });

  const totalPoints = totalGoals + totalAssists;

  return {
    matchesPlayed: items.length,
    totalGoals,
    totalAssists,
    totalPoints,
    totalPenalties,
    totalShots,
    totalPlusMinus,
  };
}
