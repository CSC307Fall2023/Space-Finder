import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { useSearchParams } from 'next/navigation'

// in order to call this API, you must provide field to the url
// i.e. /api/reservation?ssid=1
export async function GET(request, { params }) {
    const searchParams = useSearchParams()
    const ssid = +params.id;
    const reservations = await prisma.reservation.findMany({
      where: {
        studySpaceId: {
          equals: ssid
        }
      }
    });
    return NextResponse.json(reservations);
}