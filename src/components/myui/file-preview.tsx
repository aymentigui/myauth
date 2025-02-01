import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, FileImage, FileVideo, Paperclip, FileX, File, X, Trash2, Archive, Type } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import "pdfjs-dist/build/pdf.worker";
import { Button } from "../ui/button";
import * as mammoth from "mammoth"; // Pour les fichiers DOCX
import ExcelJS from "exceljs";
interface FilePreviewProps {
    file: File;
    size?: string;
    compact?: boolean;
    onRemove?: (e: React.MouseEvent, file: File) => void;
}

const FilePreview: React.FC<FilePreviewProps> = ({ file, size = "w-40 h-48", compact = false, onRemove }) => {
    const [preview, setPreview] = useState<string | null>(null);
    const [type, setType] = useState<string>("file");
    const [isHovered, setIsHovered] = useState<boolean>(false);

    useEffect(() => {
        if (!file) return;
        const fileType = file.type;
        setType(fileType);

        if (fileType.startsWith("image")) {
            setPreview(URL.createObjectURL(file));
        } else if (fileType.startsWith("video")) {
            extractVideoThumbnail(file);
        } else if (fileType === "application/pdf") {
            extractPdfThumbnail(file);
        } else if (fileType.includes("spreadsheet") || file.name.endsWith(".csv")) {
            extractSpreadsheetData(file);
        } else if (fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
            extractDocxContent(file); // Gestion des fichiers DOCX
        } else if (fileType === "text/plain" || file.name.endsWith(".txt")) {
            extractTextContent(file); // Gestion des fichiers texte
        } else if (fileType === "application/zip" || file.name.endsWith(".zip")) {
            setPreview(null); // Pas de prévisualisation pour les fichiers ZIP
        } else {
            setPreview(null);
        }
    }, [file]);

    const extractDocxContent = async (file: File) => {
        const reader = new FileReader();
        reader.onload = async (event) => {
            if (!event.target) return;
            const arrayBuffer = event.target.result as ArrayBuffer;
            const result = await mammoth.extractRawText({ arrayBuffer });
            const text = result.value; // Texte extrait du DOCX
            setPreview(text.slice(0, compact ? 100 : 200)); // Limite le texte pour la prévisualisation
        };
        reader.readAsArrayBuffer(file);
    };

    const extractTextContent = async (file: File) => {
        const reader = new FileReader();
        reader.onload = async (event) => {
            if (!event.target) return;
            const text = event.target.result as string;
            setPreview(text.slice(0, compact ? 100 : 200)); // Limite le texte pour la prévisualisation
        };
        reader.readAsText(file);
    };

    const extractPdfThumbnail = async (file: File) => {
        const reader = new FileReader();
        reader.onload = async (event) => {
            if (!event.target) return;
            const pdfData = new Uint8Array(event.target.result as ArrayBuffer);
            const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
            const page = await pdf.getPage(1);
            const scale = compact ? 0.5 : 1;
            const viewport = page.getViewport({ scale });
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");
            if (!context) return;
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            await page.render({ canvasContext: context, viewport }).promise;
            setPreview(canvas.toDataURL());
        };
        reader.readAsArrayBuffer(file);
    };

    const extractVideoThumbnail = (file: File) => {
        const video = document.createElement("video");
        video.src = URL.createObjectURL(file);
        video.currentTime = 1;
        video.onloadeddata = () => {
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");
            if (!context) return;
            canvas.width = compact ? video.videoWidth / 2 : video.videoWidth;
            canvas.height = compact ? video.videoHeight / 2 : video.videoHeight;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            setPreview(canvas.toDataURL());
        };
        video.onerror = () => setPreview(null);
    };

    const extractSpreadsheetData = async (file: File) => {
        const reader = new FileReader();
        reader.onload = async (event) => {
            if (!event.target) return;
            const data = event.target.result as ArrayBuffer;
    
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(data);
    
            const sheet = workbook.worksheets[0]; // Première feuille
            const json: string[][] = [];
    
            sheet.eachRow((row, rowNumber) => {
                if (rowNumber >= (compact ? 2 : 5)) { // Appliquer le range selon `compact`
                    json.push(row.values as string[]);
                }
            });
    
            setPreview(json.slice(0, compact ? 2 : 3).map(row => row.join(", ")).join("\n"));
        };
    
        reader.readAsArrayBuffer(file);
    };

    const renderIcon = () => {
        const iconSize = compact ? 20 : 32;
        if (type.startsWith("image")) return <FileImage size={iconSize} />;
        if (type.startsWith("video")) return <FileVideo size={iconSize} />;
        if (type === "application/pdf") return <Paperclip size={iconSize} />;
        if (type.includes("spreadsheet") || file.name.endsWith(".csv")) return <FileX size={iconSize} />;
        if (type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") return <FileText size={iconSize} />;
        if (type === "text/plain" || file.name.endsWith(".txt")) return <Type size={iconSize} />; // Icône pour les fichiers texte
        if (type === "application/zip" || file.name.endsWith(".zip")) return <Archive size={iconSize} />; // Icône pour les fichiers ZIP
        return <File size={iconSize} />;
    };

    return (
        <Card
            className={`${size} flex flex-col items-center p-2 shadow-lg relative`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {onRemove && (
                <Button
                    type="button"
                    variant={"link"}
                    className="absolute p-2 bg-red-500 z-50 bottom-2 right-2 text-white rounded-md hover:bg-red-600 shadow-md"
                    onClick={(e) => onRemove(e, file)}
                >
                    <Trash2 size={20} />
                </Button>
            )}
            {!(type.startsWith("image") || type === "application/pdf" || (type.startsWith("video") && preview)) && (
                <p className={`${compact ? 'text-xs' : 'text-sm'} font-semibold mb-1 truncate max-w-full`}>
                    {file.name}
                </p>
            )}
            <CardContent className="flex-1 w-full h-full flex items-center justify-center p-1">
                {preview ? (
                    type.startsWith("image") || type === "application/pdf" || (type.startsWith("video") && preview) ? (
                        <img
                            src={preview}
                            alt={file.name}
                            className="w-auto h-full object-contain"
                        />
                    ) : (
                        <p className={`${compact ? 'text-xxs' : 'text-xs'} text-center line-clamp-3 leading-tight`}>
                            {preview}
                        </p>
                    )
                ) : (
                    <div className={`${compact ? 'w-12 h-12' : 'w-20 h-20'} flex items-center justify-center`}>
                        {renderIcon()}
                    </div>
                )}
            </CardContent>
            {isHovered && (
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-center p-1">
                    {file.name}
                </div>
            )}
        </Card>
    );
};

export default FilePreview;