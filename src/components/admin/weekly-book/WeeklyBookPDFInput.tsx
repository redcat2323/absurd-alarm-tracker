import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface WeeklyBookPDFInputProps {
  currentPdfUrl: string | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onViewPdf: (url: string) => void;
}

export const WeeklyBookPDFInput = ({ currentPdfUrl, onFileChange, onViewPdf }: WeeklyBookPDFInputProps) => {
  return (
    <div>
      <Label htmlFor="pdf-file">PDF do Livro</Label>
      <div className="flex items-center gap-4">
        <Input
          id="pdf-file"
          type="file"
          accept=".pdf"
          onChange={onFileChange}
          className="flex-1"
        />
        {currentPdfUrl && (
          <Button
            type="button"
            variant="outline"
            onClick={() => onViewPdf(currentPdfUrl)}
          >
            Ver PDF Atual
          </Button>
        )}
      </div>
    </div>
  );
};