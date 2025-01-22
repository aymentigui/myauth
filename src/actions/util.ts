export function generateToken4Chiffres(): string {
    const min = 1000; // Le minimum à 4 chiffres
    const max = 9999; // Le maximum à 4 chiffres
    const token = Math.floor(Math.random() * (max - min + 1)) + min;
    return token.toString();
  }
  