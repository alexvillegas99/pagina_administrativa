export interface GalleryImage {
    uid?:string;
    name: string;
    creationDate?: any;
    images: Image[];
  }
  
export interface Image {
    uid?:string;
    url: string;
    creationDate?: any;
  }
  