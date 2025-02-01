'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import toast from 'react-hot-toast'
import { FileDropzone } from '@/components/myui/file-dropzone'

const formSchema = z.object({
  files: z.array(z.instanceof(File)).refine((files) => files.length > 0, {
    message: "Veuillez sélectionner au moins un fichier.",
  }),
})

interface FileUploadProps {
  acceptedFileTypes?: Record<string, string[]>
  multiple?: boolean
}

export default function FileUploadForm({ acceptedFileTypes, multiple = true }: FileUploadProps) {
  // acceptedFileTypes = {
  //   'image/*': ['.png', '.gif', '.jpeg', '.jpg'],
  //   'video/*': ['.mp4', '.avi', '.mov', '.webm']
  // }
  const [uploading, setUploading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      files: [],
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setUploading(true)
    const formData = new FormData()
    values.files.forEach(file => {
      formData.append('files', file)
    })

    try {
      await uploadFiles(formData)
      console.log('Files uploaded successfully')
      form.reset()
    } catch (error) {
      console.error('Error uploading files:', error)
    } finally {
      setUploading(false)
    }
  }
  const uploadFiles = async (formData: FormData) => {
      toast.success('Téléchargement succes')
  }

  const handleRemoveFile = (event: React.MouseEvent,file : File) => {
    event.stopPropagation()
    form.setValue('files', form.getValues('files').filter(f => f.name !== file.name))
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="files"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fichiers</FormLabel>
              <FormControl>
                <FileDropzone
                  onFilesSelected={(files) => field.onChange(
                    field.value.find(file => file.name === files[0].name) ? field.value : [...field.value, ...files]
                  )}
                  value={field.value}
                  accept={acceptedFileTypes}
                  multiple={multiple}
                  onRemove={handleRemoveFile}
                />
              </FormControl>
              <FormDescription>
                Sélectionnez {multiple ? 'un ou plusieurs fichiers' : 'un fichier'} à télécharger.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={uploading} className="relative">
          {uploading ? (
            <>
              <span className="opacity-0">Téléchargement en cours...</span>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-5 h-5 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
              </div>
            </>
          ) : (
            'Télécharger les fichiers'
          )}
        </Button>
      </form>
      {uploading && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">Téléchargement en cours...</p>
          <div className="mt-2 w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 animate-pulse"></div>
          </div>
        </div>
      )}
    </Form>
  )
}