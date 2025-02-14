import { updateImage } from "@/actions/accont-settings/updateInfo";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {

    const data = await request.formData();
    let image = data.get("file") as unknown as File;
    const res = await updateImage(image)
    return NextResponse.json(res);

}
