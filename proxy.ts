import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { errors, jwtVerify } from "jose";

export async function proxy(request: NextRequest) {
  const token = request.cookies.get("auth_token");

  try {
    if (token) {
      // Verify the token using your secret
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      // This will throw an error if the token is invalid or expired
      await jwtVerify(token.value, secret);
    } else {
      // Success! Continue to the requested page
      return NextResponse.next();
    }
  } catch (error) {
    let response: NextResponse;
    if (error instanceof errors.JWTExpired) {
      // You could redirect to a specific ?session=expired URL
      // to show a "Session Expired" message on the login page
      response = NextResponse.redirect(
        new URL("/property?message=expired", request.url),
      );
    } else {
      // Redirect to login and clear the invalid cookie
      response = NextResponse.redirect(new URL("/property", request.url));
    }
    response.cookies.delete("auth_token");
    return response;
  }
}

// Only run middleware on these paths
export const config = {
  matcher: ["/property/:path*", "/api/:path*"],
  //matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
