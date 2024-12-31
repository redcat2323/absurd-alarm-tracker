import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";

interface AddHabitDialogProps {
  onCreateHabit: (title: string) => void;
}

export const AddHabitDialog = ({ onCreateHabit }: AddHabitDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newHabitTitle, setNewHabitTitle] = useState("");

  const handleCreateHabit = () => {
    if (newHabitTitle.trim()) {
      onCreateHabit(newHabitTitle.trim());
      setNewHabitTitle("");
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Plus className="w-4 h-4" />
          Adicionar Hábito
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar Novo Hábito</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <Input
            placeholder="Nome do hábito"
            value={newHabitTitle}
            onChange={(e) => setNewHabitTitle(e.target.value)}
          />
          <Button 
            onClick={handleCreateHabit}
            disabled={!newHabitTitle.trim()}
            className="w-full"
          >
            Criar Hábito
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};