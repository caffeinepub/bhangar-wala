export class ExternalBlob {
  private bytes?: Uint8Array<ArrayBuffer>;
  private url?: string;
  private onProgress?: (percentage: number) => void;

  private constructor() {}

  static fromBytes(bytes: Uint8Array<ArrayBuffer>): ExternalBlob {
    const blob = new ExternalBlob();
    blob.bytes = bytes;
    return blob;
  }

  static fromURL(url: string): ExternalBlob {
    const blob = new ExternalBlob();
    blob.url = url;
    return blob;
  }

  withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob {
    this.onProgress = onProgress;
    return this;
  }

  getDirectURL(): string {
    if (this.url) return this.url;
    if (this.bytes) {
      const blob = new Blob([this.bytes.buffer as ArrayBuffer]);
      return URL.createObjectURL(blob);
    }
    return '';
  }

  async getBytes(): Promise<Uint8Array<ArrayBuffer>> {
    if (this.bytes) return this.bytes;
    if (this.url) {
      const response = await fetch(this.url);
      const buffer = await response.arrayBuffer();
      return new Uint8Array(buffer) as Uint8Array<ArrayBuffer>;
    }
    return new Uint8Array(0) as Uint8Array<ArrayBuffer>;
  }
}
