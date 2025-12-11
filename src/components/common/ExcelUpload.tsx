import { useState } from 'react';
import { Upload, FileSpreadsheet, X, Check } from 'lucide-react';
import { Button } from '../ui/Components';
import { parseExcelFile } from '../../utils/excelParser';
import type { Bond } from '../../modules/market/data';

interface ExcelUploadProps {
    onImport: (bonds: Bond[]) => void;
    onClose: () => void;
}

export const ExcelUpload = ({ onImport, onClose }: ExcelUploadProps) => {
    const [dragActive, setDragActive] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [previewCount, setPreviewCount] = useState<number>(0);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = async (uploadedFile: File) => {
        if (!uploadedFile.name.match(/\.(xlsx|xls)$/)) {
            setError("Please upload a valid Excel file (.xlsx or .xls)");
            return;
        }
        setFile(uploadedFile);
        setError(null);

        // Quick validate/preview
        setLoading(true);
        try {
            const data = await parseExcelFile(uploadedFile);
            setPreviewCount(data.length);
        } catch (err) {
            setError("Failed to parse file. Please check format.");
            setFile(null);
        } finally {
            setLoading(false);
        }
    };

    const handleImport = async () => {
        if (!file) return;
        setLoading(true);
        try {
            const data = await parseExcelFile(file);
            onImport(data);
            onClose();
        } catch (err) {
            setError("Import failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-lg w-full max-w-md shadow-xl text-slate-100 p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-slate-400 hover:text-white"
                >
                    <X size={20} />
                </button>

                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <FileSpreadsheet className="text-green-500" />
                    Import Bonds from Excel
                </h2>

                <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive ? "border-blue-500 bg-blue-500/10" : "border-slate-700 hover:border-slate-600"
                        } ${file ? "bg-slate-800/50" : ""}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    {!file ? (
                        <>
                            <Upload className="mx-auto h-12 w-12 text-slate-500 mb-4" />
                            <p className="mb-2 text-sm text-slate-300">
                                Drag and drop your file here, or
                            </p>
                            <label className="cursor-pointer text-blue-400 hover:text-blue-300 font-medium text-sm">
                                <span>browse computer</span>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept=".xlsx,.xls"
                                    onChange={handleChange}
                                />
                            </label>
                            <p className="mt-2 text-xs text-slate-500">
                                Supports .xlsx, .xls
                            </p>
                        </>
                    ) : (
                        <div className="flex flex-col items-center">
                            <FileSpreadsheet className="h-12 w-12 text-green-500 mb-2" />
                            <p className="font-medium text-slate-200">{file.name}</p>
                            <p className="text-xs text-slate-400 mt-1">
                                {(file.size / 1024).toFixed(1)} KB
                            </p>
                            {previewCount > 0 && (
                                <div className="mt-4 bg-green-900/20 text-green-400 px-3 py-1 rounded-full text-xs flex items-center gap-1 border border-green-900/50">
                                    <Check size={12} />
                                    Found {previewCount} bonds
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {error && (
                    <div className="mt-4 p-3 bg-red-900/20 border border-red-900/50 text-red-400 rounded text-sm">
                        {error}
                    </div>
                )}

                <div className="mt-6 flex justify-end gap-3">
                    <Button
                        onClick={onClose}
                        className="bg-slate-800 hover:bg-slate-700"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleImport}
                        disabled={!file || loading}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        {loading ? 'Processing...' : 'Import Data'}
                    </Button>
                </div>
            </div>
        </div>
    );
};
