export type DimensionKey = "technical" | "tactical" | "physical" | "attitude";

export interface FeedbackItem {
  id?: string;
  type?: string;
  technicalScore?: number;
  tacticalScore?: number;
  physicalScore?: number;
  attitudeScore?: number;
  comments?: string;
  strengths?: string;
  areasToImprove?: string;
  matchDate?: number;
  createdAt: number;
}

export interface DimensionScores {
  technical: number;
  tactical: number;
  physical: number;
  attitude: number;
}

export interface MonthlySummary {
  month: string;
  count: number;
  overall: number;
  averages: DimensionScores;
}

export function calculateFeedbackAverage(item: Partial<FeedbackItem>): number {
  const scores: number[] = [];
  if (typeof item.technicalScore === "number") scores.push(item.technicalScore);
  if (typeof item.tacticalScore === "number") scores.push(item.tacticalScore);
  if (typeof item.physicalScore === "number") scores.push(item.physicalScore);
  if (typeof item.attitudeScore === "number") scores.push(item.attitudeScore);

  if (scores.length === 0) return 0;
  const sum = scores.reduce((acc, curr) => acc + curr, 0);
  return Math.round((sum / scores.length) * 10) / 10;
}

export function computeDimensionAverages(items: Partial<FeedbackItem>[]): DimensionScores {
  if (!items || items.length === 0) {
    return { technical: 0, tactical: 0, physical: 0, attitude: 0 };
  }

  const totals = { technical: 0, tactical: 0, physical: 0, attitude: 0 };
  const counts = { technical: 0, tactical: 0, physical: 0, attitude: 0 };

  items.forEach((item) => {
    if (typeof item.technicalScore === "number") { totals.technical += item.technicalScore; counts.technical++; }
    if (typeof item.tacticalScore === "number") { totals.tactical += item.tacticalScore; counts.tactical++; }
    if (typeof item.physicalScore === "number") { totals.physical += item.physicalScore; counts.physical++; }
    if (typeof item.attitudeScore === "number") { totals.attitude += item.attitudeScore; counts.attitude++; }
  });

  return {
    technical: counts.technical ? Math.round((totals.technical / counts.technical) * 10) / 10 : 0,
    tactical: counts.tactical ? Math.round((totals.tactical / counts.tactical) * 10) / 10 : 0,
    physical: counts.physical ? Math.round((totals.physical / counts.physical) * 10) / 10 : 0,
    attitude: counts.attitude ? Math.round((totals.attitude / counts.attitude) * 10) / 10 : 0,
  };
}

export function groupFeedbackByMonth(items: Partial<FeedbackItem>[]): Record<string, Partial<FeedbackItem>[]> {
  const grouped: Record<string, Partial<FeedbackItem>[]> = {};

  items.forEach((item) => {
    const timestamp = item.matchDate || item.createdAt || Date.now();
    const date = new Date(timestamp);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const monthKey = `${year}-${month}`;

    if (!grouped[monthKey]) {
      grouped[monthKey] = [];
    }
    grouped[monthKey].push(item);
  });

  return grouped;
}

export function computeMonthlySummary(monthKey: string, items: Partial<FeedbackItem>[]): MonthlySummary {
  const averages = computeDimensionAverages(items);
  const overalls = items.map(calculateFeedbackAverage).filter((val) => val > 0);
  const overall = overalls.length
    ? Math.round((overalls.reduce((a, b) => a + b, 0) / overalls.length) * 10) / 10
    : 0;

  return {
    month: monthKey,
    count: items.length,
    overall,
    averages,
  };
}
