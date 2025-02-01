export const getFileExtension = (filename: string): string | null => {
    const parts = filename.split(".");
    return parts.length > 1 ? parts.pop() || null : null;
};

export const addStringToFilename = (filePath: string, str: string): string => {
    const pathParts = filePath.split("/"); // Séparer le chemin du fichier
    const filename = pathParts.pop() || ""; // Récupérer le nom du fichier

    const nameParts = filename.split(".");
    if (nameParts.length > 1) {
        const extension = nameParts.pop(); // Récupère l'extension
        return `${pathParts.join("/")}/${nameParts.join(".")}_${str}.${extension}`;
    }

    return `${pathParts.join("/")}/${filename}_${str}`; // Si pas d'extension
};

export const addStringToFilenameWithNewExtension = (filePath: string, str: string, newExtension: string): string => {
    const pathParts = filePath.split("/"); // Séparer le chemin du fichier
    const filename = pathParts.pop() || ""; // Récupérer le nom du fichier

    const nameParts = filename.split(".");
    nameParts.pop(); // Supprime l'ancienne extension
    
    return `${pathParts.join("/")}/${nameParts.join(".")}_${str}.${newExtension}`;
};


export function generateToken4Chiffres(): string {
    const min = 1000; // Le minimum à 4 chiffres
    const max = 9999; // Le maximum à 4 chiffres
    const token = Math.floor(Math.random() * (max - min + 1)) + min;
    return token.toString();
}

