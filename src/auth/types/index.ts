export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

export interface GoogleProfile {
  googleId: string;
  email: string;
  name: string;
  picture?: string;
}
