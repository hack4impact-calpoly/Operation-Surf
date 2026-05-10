import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
/* 
Manually added the cookies from the browser to postman
*/

// example protected route
export async function POST(): Promise<NextResponse> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw new Error("unauthorized");
    }

    return NextResponse.json(
      {
        msg: "authorized",
      },
      { status: 200 },
    );
  } catch (err) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "An unknown error occurred.",
      },
      { status: 401 },
    );
  }
}
