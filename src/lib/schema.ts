// @/utils/schema/user.ts
import { z } from "zod";

// Définir le schéma pour le formulaire de login
export const LoginSchema = z.object({
  email: z.string().min(6, { message: "Le mot de passe doit contenir au moins 6 caractères" }),
  password: z.string().min(6, { message: "Le mot de passe doit contenir au moins 6 caractères" }),
  code : z.string().optional(),
});

export const RegisterSchema = z.object({
  username: z
    .string()
    .min(3, { message: "Le nom d'utilisateur doit contenir au moins 3 caractères" })
    .max(20, { message: "Le nom d'utilisateur ne doit pas dépasser 20 caractères" }),
  email: z.string().email({ message: "Adresse e-mail invalide" }),
  password: z.string().min(6, { message: "Le mot de passe doit contenir au moins 6 caractères" }),
  passwordConfirm: z.string().min(6, { message: "Le mot de passe de confirmation est requis" }),
}).refine((data) => data.password === data.passwordConfirm, {
  path: ["passwordConfirm"],
  message: "Les mots de passe ne correspondent pas",
});

export const ResestSchema = z.object({
  password: z.string().optional(),
  passwordConfermation: z.string().optional(),
  code : z.string().optional(),
})
.refine((data) => data.password !=="" || data.password !==null || String(data.password).length < 6, {
  path: ["password"],
  message: "Le mot de passe doit contenir au moins 6 caractères",
})
.refine((data) => data.password === data.passwordConfermation, {
  path: ["passwordConfermation"],
  message: "Les mots de passe ne correspondent pas",
});