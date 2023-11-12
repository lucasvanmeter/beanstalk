import { errorResponse } from "./errors";
import { getPrivateAccountInfo } from "./nrdb";
import { Env, RequestWithDB } from "../types";
import { Users } from "../models/user";
import { PrivateAccountInfoType } from "../openapi";
//import { decode, verify } from "@tsndr/cloudflare-worker-jwt";

export async function signPassword(
  key: string,
  email: string,
  rawPassword: string,
): Promise<string> {
  const encoder = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    cryptoKey,
    encoder.encode(`${email}/${rawPassword}`),
  );

  // Taken from https://bradyjoslin.com/blog/hmac-sig-webcrypto/
  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}

export function getBearer(request: Request): null | string {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || authHeader.substring(0, 6) !== "Bearer") {
    return null;
  }
  return authHeader.substring(6).trim();
}

export async function verifyPassword(
  key: string,
  email: string,
  rawPassword: string,
  signedPassword: string,
): Promise<boolean> {
  const encoder = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );
  // Taken from https://bradyjoslin.com/blog/hmac-sig-webcrypto/
  const sigBuf = Uint8Array.from(atob(signedPassword), (c) => c.charCodeAt(0));

  return await crypto.subtle.verify(
    "HMAC",
    cryptoKey,
    sigBuf,
    encoder.encode(`${email}/${rawPassword}`),
  );
}

//async function validateToken(token: string, env: Env) {
//  const isValid = await verify(token, env.JWT_SIGNER_SECRET_KEY);
//
//  // Check for validity
//  if (!isValid) return;
//
//  return decode(token);
//}

export async function authenticatedUser(request: RequestWithDB, _: Env) {
  const access_token = getBearer(request);
  if (!access_token) {
    return errorResponse(401, "No token");
  }

  let accountInfo: PrivateAccountInfoType;
  try {
    accountInfo = await getPrivateAccountInfo(access_token);
  } catch (e) {
    if (e.statusCode == 401) {
      return errorResponse(401, "Authentication error");
    }
  }

  console.log(JSON.stringify(accountInfo));

  let user = await Users.getById(accountInfo.id);
  if (!user) {
    user = await Users.insert({
      name: accountInfo.username,
      id: accountInfo.id,
      email: accountInfo.email,
    });
  }
  //const user = await Users.getById(Number(session.payload.sub));
  //let session;

  //if (token) {
  //  // Implement your own token validation here
  //  session = await validateToken(token, env);
  //}

  //if (!token || !session) {
  //  return errorResponse(401, "Authentication error. Invalid token");
  //}
  //const user = await Users.getById(Number(session.payload.sub));

  //if (!user) {
  //  return errorResponse(401, "Authentication error. Invalid user.");
  //}
  // user_id not null implies user is logged in
  request.user_id = user.id;
  request.is_admin = user.is_admin;
}

export async function adminOnly(request: RequestWithDB, _: Env) {
  if (!request.is_admin) {
    return errorResponse(401, "Authentication error");
  }
}
