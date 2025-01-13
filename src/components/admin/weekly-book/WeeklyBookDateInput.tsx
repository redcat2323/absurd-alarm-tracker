import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { startOfWeek, format } from "date-fns";

interface WeeklyBookDateInputProps {
  weekStartDate: string;
  onWeekStartChange: (date: string) => void;
}

export const WeeklyBookDateInput = ({ weekStartDate, onWeekStartChange }: WeeklyBookDateInputProps) => {
  const handleWeekStartChange = (date: string) => {
    const selectedDate = new Date(date);
    const sunday = startOfWeek(selectedDate, { weekStartsOn: 0 });
    onWeekStartChange(format(sunday, 'yyyy-MM-dd'));
  };

  return (
    <div>
      <Label htmlFor="week-start">Data de Início da Semana (Domingo)</Label>
      <Input
        id="week-start"
        type="date"
        value={weekStartDate}
        onChange={(e) => handleWeekStartChange(e.target.value)}
        className="mb-4"
        required
      />
    </div>
  );
};