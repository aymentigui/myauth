
import { updateImage } from "@/actions/accont-settings/updateInfo";
import { deleteUsers } from "@/actions/users/delete";
import { getUser } from "@/actions/users/get";
import { updateUser } from "@/actions/users/update";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: any }) {

    const paramsID = await params

    const user = await getUser(paramsID.id)

    return NextResponse.json(user);
}


export async function PUT(request: NextRequest, { params }: { params: any }) {

    const paramsID = await params

    const imageE = request.nextUrl.searchParams.get("image");

    if (imageE) {
        const data = await request.formData();
        let image = data.get("file") as unknown as File;
        const res=await updateImage(image)
        return NextResponse.json(res);
    }

    const data = await request.formData();
    let image = data.get("file") as unknown as File;
    const firstname = data.get("firstname") as string;
    const lastname = data.get("lastname") as string;
    const username = data.get("username") as string;
    const email = data.get("email") as string;
    const password = data.get("password") as string;
    const isAdmin = data.get("isAdmin") === "true";
    const roles = JSON.parse(data.get("roles") as string);

    if (!image)
        image = new File([], "default.png", { type: "image/png" });

    const res = await updateUser(paramsID.id, { image, firstname, lastname, username, email, password, isAdmin, roles })


    return NextResponse.json(res);
}

export async function DELETE(request: Request, { params }: { params: any }) {

    const paramsID = await params

    const res = await deleteUsers([paramsID.id])

    return NextResponse.json(res);
}