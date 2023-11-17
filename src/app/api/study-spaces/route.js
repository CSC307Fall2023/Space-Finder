import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { checkLoggedIn } from "@/lib/auth";

export async function GET(request) {
  const studySpaces = await prisma.studySpace.findMany({});
  return NextResponse.json(studySpaces);
}

export async function POST(request) {
    const loggedInData = await checkLoggedIn();
    if (loggedInData.loggedIn) {
        let { 
            name, 
            building, 
            longitude, 
            latitude, 
            capacity,
            rating,
            busyness,
            img
         } = await request.json();
        capacity = parseInt(capacity);
        const studyRoom = await prisma.studySpace.create({
        data: {
            ownerId: loggedInData.user?.id,
            name,
            building,
            longitude,
            latitude,
            capacity,
            rating,
            busyness,
            img
        }
        });
        return NextResponse.json(studyRoom);
    }
    return NextResponse.json({error: 'not signed in'}, {status: 403});
}