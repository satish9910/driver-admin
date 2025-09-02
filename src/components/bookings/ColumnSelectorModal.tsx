// ColumnSelectorModal.tsx (unchanged)
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useEffect } from "react";

interface ColumnSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableKeys: string[];
  selectedKeys: string[];
  onSave: (selectedKeys: string[]) => void;
}

export function ColumnSelectorModal({
  isOpen,
  onClose,
  availableKeys,
  selectedKeys,
  onSave,
}: ColumnSelectorModalProps) {
  const [tempSelectedKeys, setTempSelectedKeys] = useState<string[]>(selectedKeys);

  useEffect(() => {
    setTempSelectedKeys(selectedKeys);
  }, [selectedKeys, isOpen]);

  const handleToggleKey = (key: string) => {
    if (tempSelectedKeys.includes(key)) {
      setTempSelectedKeys(tempSelectedKeys.filter(k => k !== key));
    } else {
      setTempSelectedKeys([...tempSelectedKeys, key]);
    }
  };

  const handleSave = () => {
    onSave(tempSelectedKeys);
    onClose();
  };

  const selectAll = () => {
    setTempSelectedKeys([...availableKeys]);
  };

  const clearAll = () => {
    setTempSelectedKeys([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Select Columns to Display</DialogTitle>
        </DialogHeader>
        <div className="flex justify-between mb-4">
          <Button variant="outline" size="sm" onClick={selectAll}>
            Select All
          </Button>
          <Button variant="outline" size="sm" onClick={clearAll}>
            Clear All
          </Button>
        </div>
        <ScrollArea className="h-96">
          <div className="grid grid-cols-2 gap-2">
            {availableKeys.map((key) => (
              <div key={key} className="flex items-center space-x-2">
                <Checkbox
                  id={key}
                  checked={tempSelectedKeys.includes(key)}
                  onCheckedChange={() => handleToggleKey(key)}
                />
                <Label htmlFor={key} className="text-sm font-normal">
                  {key}
                </Label>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
