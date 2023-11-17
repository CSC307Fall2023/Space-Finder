import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import bcrypt from 'bcryptjs';
import { checkLoggedIn } from "@/lib/auth";

export async function GET(request) {
  const loggedInData = await checkLoggedIn();
  console.log(loggedInData);
  if (loggedInData.loggedIn) {
    const user = await prisma.user.findUnique({
      where: {
        id: loggedInData.user?.id
      }
    });
    if (user) {
      return NextResponse.json(user);
    } else {
      return NextResponse.json({error: 'User not found'}, {status: 404});
    }
  }
  return NextResponse.json({error: 'not signed in'}, {status: 403});
}

export async function POST(request) {
  const data = await request.json();
  const { username, email, password } = data;
  if (username && email && password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    let user;
    try {
      user = await prisma.user.create({
        data: { 
          username, 
          email, 
          password: hashedPassword,
          bio: "",
          school: "", 
          profilePic: "",
        }
      });
    } catch (e) {
      return NextResponse.json({error: e.message}, {status: 500 })
    }
    return NextResponse.json(user);
  }
  return NextResponse.json({ error: 'Email or Password not defined' }, { status: 500 });
}