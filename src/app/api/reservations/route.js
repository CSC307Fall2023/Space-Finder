import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { checkLoggedIn } from "@/lib/auth";
import { useSearchParams } from 'next/navigation'

// in order to call this API, you must provide field to the url
// i.e. /api/reservation?ssid=1
export async function GET(request) {
    const loggedInData = await checkLoggedIn();
    if (loggedInData.loggedIn) {
        const reservations = await prisma.reservation.findMany({
            where: {
            ownerId : {
                equals: loggedInData.user?.id,
            }
            }
        });
        return NextResponse.json(reservations);
    } else {
        return NextResponse.json({error: 'not signed in'}, {status: 403});
    }
}

export async function POST(request) {
  const loggedInData = await checkLoggedIn();
  if (loggedInData.loggedIn) {
    const { ssid } = await request.json();
    const res = await prisma.reservation.create({
      data: {
        ownerId: loggedInData.user?.id,
        studySpaceId: ssid,
      }
    });
    return NextResponse.json(res);
  }
  return NextResponse.json({error: 'not signed in'}, {status: 403});
}