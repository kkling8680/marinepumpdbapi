import jwt, { SignOptions, Secret } from "jsonwebtoken";

const JWT_SECRET: Secret = process.env.JWT_SECRET || "supersecret";


export function generateJWT(payload: object): string {
  return jwt.sign(payload, JWT_SECRET); 
}

export function verifyJWT<T>(token: string): T {
  return jwt.verify(token, JWT_SECRET) as T;
}