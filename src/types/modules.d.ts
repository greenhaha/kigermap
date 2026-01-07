// Type declarations for modules without types

declare module 'ali-oss' {
  interface OSSOptions {
    region: string
    bucket: string
    accessKeyId: string
    accessKeySecret: string
  }

  interface PutOptions {
    progress?: (p: number) => void
    headers?: Record<string, string>
  }

  interface PutResult {
    url: string
    name: string
  }

  class OSS {
    constructor(options: OSSOptions)
    put(name: string, file: File | Blob, options?: PutOptions): Promise<PutResult>
  }

  export default OSS
}

declare module 'heic2any' {
  interface HeicOptions {
    blob: Blob
    toType: string
    quality?: number
  }

  function heic2any(options: HeicOptions): Promise<Blob | Blob[]>
  export default heic2any
}
