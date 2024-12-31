import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AddHabitDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  newHabitTitle: string;
  onTitleChange: (value: string) => void;
  onAddHabit: () => Promise<void>;
}

export const AddHabitDialog = ({
  isOpen,
  onOpenChange,
  newHabitTitle,
  onTitleChange,
  onAddHabit
}: AddHabitDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="w-full">Adicionar Hábito Personalizado</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Hábito Personalizado</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Nome do hábito"
            value={newHabitTitle}
            onChange={(e) => onTitleChange(e.target.value)}
          />
          <Button onClick={onAddHabit} className="w-full">
            Adicionar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};