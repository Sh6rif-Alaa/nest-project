import { compareSync, hashSync } from "bcrypt";

export const Hash = ({ plainText, salt = process.env.SALT_ROUNDS! }: { plainText: string, salt?: string }) => {
    return hashSync(plainText, Number(salt));
}

export const Compare = ({ plainText, hash }: { plainText: string, hash: string }) => {
    return compareSync(plainText, hash);
}