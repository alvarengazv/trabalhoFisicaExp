export interface ColumnData  {
    dataKey: keyof Data;
    label: string;
    numeric?: boolean;
    width: number;
}

export interface Data {
    date: string;
    temperature: number;
    timeDifference: number;
  }