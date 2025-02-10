import { deleteRole } from "@/actions/roles/delete";
import { getRole } from "@/actions/roles/get";
import { UpdateRole } from "@/actions/roles/update";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: { id: string } }) {

    const paramsID = await params

    const role = await getRole(paramsID.id)
   

    return NextResponse.json({ data: role.data }, { status: role.status });
}


export async function PUT(request: Request, { params }: { params: { id: string } }) {

    const paramsID = await params

    const {name, permission} = await request.json();

    const role = await UpdateRole(paramsID.id, name, permission)

    return NextResponse.json({ data: role.data }, { status: role.status });
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {

    const paramsID = await params

    const role = await deleteRole(paramsID.id)
   

    return NextResponse.json({ data: role.data }, { status: role.status });
}