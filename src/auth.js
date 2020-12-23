import jwt from "express-jwt";
import jwks from "jwks-rsa";
import jwtAuthz from "express-jwt-authz";

export const jwtCheck = jwt({
  secret: jwks.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: "https://blightwidow.eu.auth0.com/.well-known/jwks.json",
  }),
  audience: "https://api.loot.odrel.com",
  issuer: "https://blightwidow.eu.auth0.com/",
  algorithms: ["RS256"],
});

export const isAdmin = jwtAuthz(["admin"]);

export const canWriteSimc = jwtAuthz(["admin", "write:simc"]);
