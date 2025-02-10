"use client"
import React, { useEffect, useState } from 'react'
import { LzyImage } from '@/components/myui/pdf/lazy-image'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'
import { useSession } from '@/hooks/use-session'
import { downloadFileFromLocalHost, getImageFromLocalHost, getFileFromLocalHost, ViewFileFromLocalHost } from '@/actions/localstorage/util-client'
import FilePreview from '@/components/myui/file-preview2'
import { deleteFileDb } from '@/actions/localstorage/delete-db'
import axios from "axios"
import GetImage from '@/hooks/use-getImage'

const FilesLocalStorage = () => {
    const [src, setSrc] = useState<string | null>('https://img.freepik.com/photos-gratuite/belle-photo-du-parc-national-du-triglav-slovenie-automne_181624-25708.jpg?t=st=1735566010~exp=1735569610~hmac=42a2df53c6bb19a52106de2913435bedf8ebc0ef294bf0beaca047b88fcadd78&w=1060')
    const [file, setFile] = useState<File[] | null>([])
    const [path, setPath] = useState<string | null>(null)
    const [files, setFiles] = useState([])
    const { session } = useSession()



    useEffect(() => {
        axios("/api/files").then(res => {
            if (res.status === 200) {
                setFiles(res.data.data)
            }
        })
        getImage()
    }, [])

    const getImage = async () =>{
        setSrc(await getImageFromLocalHost("cm6zem5tn0000v8ncu48jw0gd"))
    }


    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files) {
            setFile(Array.from(event.target.files));
        }
    }

    const handleUpload = async () => {
        if (file && session?.user?.id) {
            const data = new FormData()
            file.forEach((file) => {
                data.append("file", file)
            })

            const config = {
                onUploadProgress: (progressEvent:any) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    console.log(percentCompleted);
                }
            }
            const res = await axios.post('/api/files', data, config)

            if(res.status !== 200) {
                toast.error(res.data.message)
                return
            }

            const uploadFile = res.data

            console.log(uploadFile)
            toast.success("File uploaded successfully")
        }
    }

    const handleDelete = async (id: string) => {
        const res = await deleteFileDb(id)
        if (res.status === 200) {
            toast.success(res.data.message)
            setFiles((prevFiles) => prevFiles.filter((file: any) => file.id !== id));
        }
    }

    const handleDownloadDirect = async (id: string) => {
        downloadFileFromLocalHost(id)
    }

    const handleView = async (id: string) => {
        ViewFileFromLocalHost(id)
    }

    return (
        <Card className='min-h-full'>
            <div className='flex items-center justify-center'>
                <LzyImage
                    src={GetImage("cm6zem5tn0000v8ncu48jw0gd")}
                    alt="ok"
                    load
                    className="w-[500px] h-52"
                    objet_fit='contain'
                />
            </div>
            <div className='flex items-center justify-center mt-4'>
                <input type="file" multiple onChange={handleFileChange} />
                <Button onClick={handleUpload} className="ml-2">Upload</Button>
            </div>
            {files.length > 0 && (
                <div className='flex flex-wrap gap-2 p-2'>
                    {files.map((file: any) => (
                        <FilePreview
                            key={file.id}
                            file={{ fileid: file.id, filename: file.name, filetype: file.mimeType }}
                            size='w-20 h-24'
                            onRemove={() => handleDelete(file.id)}
                            onDownload={() => handleDownloadDirect(file.id)}
                            onView={() => handleView(file.id)}
                        />
                    ))}
                </div>
            )}
        </Card>
    )
}

export default FilesLocalStorage