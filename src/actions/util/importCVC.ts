import Papa from "papaparse";
import moment from "moment";

export interface ColumnCvcImport {
  title: string;
  require?: { req: boolean; message?: string };
  type?: { tp: "string" | "number" | "date"; message: string };
  condition?: { cond: (value: any) => boolean; message: string }[];
}

export const parseCSV = (
  file: File | null,
  setErrors: (errors: string[]) => void,
  setPreviewData: (data: any[]) => void,
  columns: ColumnCvcImport[]
): void => {
  if (!file) return;
  
  Papa.parse(file, {
    complete: (result) => {
      const jsonData: any[] = result.data;
      let errorMessages: string[] = [];
      
      jsonData.forEach((row, index) => {
        columns.forEach((col) => {
          const value = row[col.title];
          
          // Vérification du champ obligatoire
          if (col.require?.req && (!value || value.toString().trim() === "")) {
            errorMessages.push(`Ligne ${index + 1}: ${col.require.message}`);
          }
          
          // Vérification du type
          if (col.type) {
            if (col.type.tp === "number" && isNaN(Number(value))) {
              errorMessages.push(`Ligne ${index + 1}: ${col.type.message}`);
            }
            if (col.type.tp === "date" && value && !moment(value, ["DD/MM/YYYY", "MM-DD-YYYY", "YYYY.MM.DD", "YYYY-MM-DD", "D/M/YYYY", "M/D/YYYY"], true).isValid()) {
              errorMessages.push(`Ligne ${index + 1}: ${col.type.message}`);
            }
          }
          
          // Vérification des conditions spécifiques
          if (col.condition && value) {
            col.condition.forEach((condObj) => {
              if (!condObj.cond(value)) {
                errorMessages.push(`Ligne ${index + 1}: ${condObj.message}`);
              }
            });
          }
        });
      });
      
      if (errorMessages.length > 0) {
        setErrors(errorMessages);
        setPreviewData([]);
      } else {
        setErrors([]);
        setPreviewData(jsonData);
      }
    },
    header: true,
    skipEmptyLines: true
  });
};