import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { checkLoggedIn } from "@/lib/auth";

export async function GET(request, { params}) {
    const id = parseInt(params.id);
    const space = await prisma.studySpace.findUnique({
      where: {
        id: id
      }
    });
    return NextResponse.json(space);
  }

export async function PUT(request, { params }) {
  const loggedInData = await checkLoggedIn();
  const id = +params.id;
  if (loggedInData.loggedIn && id) {
    const { rating, busyness, comments, reservations } = await request.json();
    console.log("finding", {id, rating, busyness, comments, reservations});
    try {
      const ss = await prisma.studySpace.update({
        where: {
          id: id
        }, 
        data: {
          rating,
          busyness,
          comments,
          reservations
        }
      });
      return NextResponse.json(ss);
    } catch {
      return NextResponse.json({error: 'record not found'}, {status: 401});
    }
  }
  return NextResponse.json({error: 'not signed in'}, {status: 403});
}

export async function DELETE(request, { params }) {
  const loggedInData = await checkLoggedIn();
  const id = +params.id;
  if (loggedInData.loggedIn && id) {
    const ss = await prisma.studySpace.delete({
      where: {
        id: id
      }
    });
    return NextResponse.json({ deleted: ss });
  }
  return NextResponse.json({error: 'not signed in'}, {status: 403});
}