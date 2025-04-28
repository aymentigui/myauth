import { withAuthorizationPermission, verifySession } from "@/actions/permissions";
import { prisma } from "@/lib/db";
import { getTranslations } from "next-intl/server";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(request: Request, { params }: { params: any }) {

    const paramsID = await params

    const e = await getTranslations('Error');

    const fileexists = await prisma.files.findFirst({ where: { id: paramsID.id } });

    if (!fileexists) {
        const filePath = path.join(process.cwd(), '/public/not_found.png');
        const fileStream = fs.createReadStream(filePath);

        const readableStream = new ReadableStream({
            start(controller) {
                fileStream.on("data", (chunk) => controller.enqueue(chunk));
                fileStream.on("end", () => controller.close());
                fileStream.on("error", (err) => controller.error(err));
            },
        });

        return new Response(readableStream, {
            headers: {
                "Content-Type": "image/png",
                "X-File-Metadata": JSON.stringify(fileexists),
            },
        });
    }

    if (fileexists?.canViewUsers || fileexists?.adminViewOnly || fileexists?.canViewPermissions) {
        const session = await verifySession();
        let havePermission = false
        if (session.status !== 200 || !session.data || !session.data.user) {
            const filePath = path.join(process.cwd(), '/public/no_access.png');
            const fileStream = fs.createReadStream(filePath);
            const readableStream = new ReadableStream({
                start(controller) {
                    fileStream.on("data", (chunk) => controller.enqueue(chunk));
                    fileStream.on("end", () => controller.close());
                    fileStream.on("error", (err) => controller.error(err));
                },
            });

            return new Response(readableStream, {
                headers: {
                    "Content-Type": "image/png",
                    "X-File-Metadata": JSON.stringify(fileexists),
                },
            });
        }
        if (session.data.user.isAdmin === true) {
            havePermission = true
        }
        if (fileexists.adminViewOnly) {
            if (session.data.user.isAdmin === false && fileexists.addedFrom !== session.data.user.id) {

                const filePath = path.join(process.cwd(), '/public/no_access.png');
                const fileStream = fs.createReadStream(filePath);
                const readableStream = new ReadableStream({
                    start(controller) {
                        fileStream.on("data", (chunk) => controller.enqueue(chunk));
                        fileStream.on("end", () => controller.close());
                        fileStream.on("error", (err) => controller.error(err));
                    },
                });

                return new Response(readableStream, {
                    headers: {
                        "Content-Type": "image/png",
                        "X-File-Metadata": JSON.stringify(fileexists),
                    },
                });
            } else {
                havePermission = true
            }
        }
        if (fileexists.canViewUsers && !havePermission) {
            const users = fileexists.canViewUsers.split(',')
            if (!users.includes(session.data.user.id)) {
                const filePath = path.join(process.cwd(), '/public/no_access.png');
                const fileStream = fs.createReadStream(filePath);

                const readableStream = new ReadableStream({
                    start(controller) {
                        fileStream.on("data", (chunk) => controller.enqueue(chunk));
                        fileStream.on("end", () => controller.close());
                        fileStream.on("error", (err) => controller.error(err));
                    },
                });

                return new Response(readableStream, {
                    headers: {
                        "Content-Type": "image/png",
                        "X-File-Metadata": JSON.stringify(fileexists),
                    },
                });
            } else {
                havePermission = true
            }
        }
        if (fileexists.canViewPermissions && !havePermission) {
            const permissions = fileexists.canViewPermissions.split(',')
            const hasPermission = await withAuthorizationPermission(permissions, session.data.user.id);
            if (hasPermission.status !== 200 || !hasPermission.data.hasPermission) {
                const filePath = path.join(process.cwd(), '/public/no_access.png');
                const fileStream = fs.createReadStream(filePath);

                const readableStream = new ReadableStream({
                    start(controller) {
                        fileStream.on("data", (chunk) => controller.enqueue(chunk));
                        fileStream.on("end", () => controller.close());
                        fileStream.on("error", (err) => controller.error(err));
                    },
                });

                return new Response(readableStream, {
                    headers: {
                        "Content-Type": "image/png",
                        "X-File-Metadata": JSON.stringify(fileexists),
                    },
                });
            }
        }
    }

    const filePath = path.join(process.cwd(), fileexists.path);

    if (!fs.existsSync(filePath)) {
        const filePath = path.join(process.cwd(), '/public/not_found.jpg');
        const fileStream = fs.createReadStream(filePath);

        const readableStream = new ReadableStream({
            start(controller) {
                fileStream.on("data", (chunk) => controller.enqueue(chunk));
                fileStream.on("end", () => controller.close());
                fileStream.on("error", (err) => controller.error(err));
            },
        });

        return new Response(readableStream, {
            headers: {
                "Content-Type": "image/png",
                "X-File-Metadata": JSON.stringify(fileexists),
            },
        });
    }

    const fileStream = fs.createReadStream(filePath);

    const readableStream = new ReadableStream({
        start(controller) {
            fileStream.on("data", (chunk) => controller.enqueue(chunk));
            fileStream.on("end", () => controller.close());
            fileStream.on("error", (err) => controller.error(err));
        },
    });

    return new Response(readableStream, {
        headers: {
            "Content-Type": fileexists.mimeType,
            "X-File-Metadata": JSON.stringify(fileexists),
        },
    });

}



