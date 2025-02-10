import { getRoles } from "@/actions/roles/get";
import { AddRole } from "@/actions/roles/set";
import { NextResponse } from "next/server";

export async function GET(request: Request) {

    const res=await getRoles()

    return NextResponse.json({ data: res.data }, { status: res.status });
}

export async function POST(request: Request) {

    const { name, permission } = await request.json();

    const res=await AddRole(name, permission)

    return NextResponse.json({ data: res.data }, { status: res.status });
}