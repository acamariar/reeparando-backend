export type JwtPayload = {
    sub: string;
    usuario: string;
    nivel: number;
    passwordSet: boolean;
};