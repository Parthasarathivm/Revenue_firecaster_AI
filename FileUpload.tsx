import { useState } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { parseCSV, validateData, cleanData } from '@/lib/csvParser';
import { MarketingData, ValidationResult } from '@/types';
import { motion } from 'framer-motion';

interface FileUploadProps {
  onDataLoaded: (data: MarketingData[]) => void;
}

export default function FileUpload({ onDataLoaded }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [fileName, setFileName] = useState<string>('');

  const handleFile = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      alert('Please upload a CSV file');
      return;
    }

    setFileName(file.name);
    const content = await file.text();
    
    try {
      const parsedData = parseCSV(content);
      const validationResult = validateData(parsedData);
      setValidation(validationResult);

      if (validationResult.isValid || validationResult.errors.length === 0) {
        const cleanedData = cleanData(parsedData);
        onDataLoaded(cleanedData);
      }
    } catch (error) {
      console.error('Error parsing CSV:', error);
      setValidation({
        isValid: false,
        errors: ['Failed to parse CSV file. Please check the format.'],
        warnings: [],
        missingValues: {},
        duplicateCount: 0,
        rowCount: 0,
      });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <Card className="border-2 border-dashed">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-6 h-6" />
          Upload Marketing Data
        </CardTitle>
        <CardDescription>
          Upload a CSV file containing Date, Channel, Campaign, Campaign Type, Clicks, Impressions, Spend, Conversions, and Revenue
        </CardDescription>
      </CardHeader>
      <CardContent>
        <motion.div
          className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
            isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' : 'border-slate-300 dark:border-slate-700'
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          whileHover={{ scale: 1.01 }}
        >
          <FileText className="w-16 h-16 mx-auto mb-4 text-slate-400" />
          <p className="text-lg font-medium mb-2">
            {fileName || 'Drag and drop your CSV file here'}
          </p>
          <p className="text-sm text-slate-500 mb-4">or</p>
          <label htmlFor="file-upload">
            <Button asChild variant="outline">
              <span className="cursor-pointer">Browse Files</span>
            </Button>
          </label>
          <input
            id="file-upload"
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFileInput}
          />
        </motion.div>

        {validation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 space-y-3"
          >
            {validation.isValid && (
              <div className="flex items-start gap-2 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-green-900 dark:text-green-100">
                    Data validated successfully!
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    {validation.rowCount} rows processed
                  </p>
                </div>
              </div>
            )}

            {validation.errors.length > 0 && (
              <div className="flex items-start gap-2 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-medium text-red-900 dark:text-red-100">Errors found:</p>
                  <ul className="text-sm text-red-700 dark:text-red-300 list-disc list-inside">
                    {validation.errors.map((error, idx) => (
                      <li key={idx}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {validation.warnings.length > 0 && (
              <div className="flex items-start gap-2 p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-900 dark:text-yellow-100">Warnings:</p>
                  <ul className="text-sm text-yellow-700 dark:text-yellow-300 list-disc list-inside">
                    {validation.warnings.map((warning, idx) => (
                      <li key={idx}>{warning}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {Object.keys(validation.missingValues).length > 0 && (
              <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
                <p className="font-medium text-slate-900 dark:text-slate-100 mb-2">Missing Values:</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                  {Object.entries(validation.missingValues).map(([field, count]) => (
                    <div key={field} className="text-slate-700 dark:text-slate-300">
                      {field}: <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
