"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Upload, Loader2 } from "lucide-react";
import * as XLSX from "xlsx";
import { addMultipleWords, getAllWords } from "@/app/actions/excel";

export function ExcelActions() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

      const words = jsonData.map(row => ({
        word: String(row.word || row.Word || row.Слово || row['слово'] || ''),
        translation: String(row.translation || row.Translation || row.Перевод || row['перевод'] || ''),
        example: String(row.example || row.Example || row.Пример || row['пример'] || ''),
      })).filter(w => w.word && w.translation);

      if (words.length > 0) {
        await addMultipleWords(words);
        alert(`Импортировано слов: ${words.length}`);
      } else {
        alert('Не найдено слов для импорта. Убедитесь, что есть столбцы word и translation.');
      }
    } catch (error) {
      console.error(error);
      alert('Ошибка при импорте');
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleExport = async () => {
    setLoading(true);
    try {
      const words = await getAllWords();
      const worksheet = XLSX.utils.json_to_sheet(words);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Words");
      XLSX.writeFile(workbook, "dictionary.xlsx");
    } catch (error) {
      console.error(error);
      alert('Ошибка при экспорте');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <input 
        type="file" 
        accept=".xlsx, .xls, .csv" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleImport} 
      />
      <Button 
        variant="outline" 
        size="icon" 
        onClick={() => fileInputRef.current?.click()}
        disabled={loading}
        title="Импорт Excel"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
      </Button>
      <Button 
        variant="outline" 
        size="icon" 
        onClick={handleExport}
        disabled={loading}
        title="Экспорт в Excel"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
      </Button>
    </div>
  );
}
