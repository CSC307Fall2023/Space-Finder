import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { checkLoggedIn } from "@/lib/auth";
import { useSearchParams } from 'next/navigation'

export async function POST(request) {
  const loggedInData = await checkLoggedIn();
  if (loggedInData.loggedIn) {
    const { ssid, text } = await request.json();
    const cmnt = await prisma.comment.create({
      data: {
        text,
        ownerId: loggedInData.user?.id,
        studySpaceId: ssid,
        votes: 0
      }
    });
    return NextResponse.json(cmnt);
  }
  return NextResponse.json({error: 'not signed in'}, {status: 403});
}