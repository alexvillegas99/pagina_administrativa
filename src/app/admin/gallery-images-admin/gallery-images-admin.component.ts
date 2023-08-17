import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { GalleryImage, Image } from 'src/app/interfaces';
import { GalleryImagesService } from 'src/app/services/gallery-images.service';
import { StorageService } from 'src/app/services/storage.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-gallery-images-admin',
  templateUrl: './gallery-images-admin.component.html',
  styleUrls: ['./gallery-images-admin.component.scss'],
})
export class GalleryImagesAdminComponent implements OnInit {
  constructor(
    private readonly galleryImageService: GalleryImagesService,
    private readonly fb: FormBuilder,
    private readonly storageService: StorageService
  ) {}
  formGalleryName = this.fb.group({
    name: ['', Validators.required],
  });
  formImage = this.fb.group({
    image: ['', Validators.required],
  });
  galleries: GalleryImage[] = [];
  gallerySelected: GalleryImage;
  add_gallery = false;
  add_img = false;
  galleryIndex = 0;
  changeAddGallery() {
    this.add_gallery = !this.add_gallery;
  }
  changeAddImage() {
    console.log(this.add_img)
    this.add_img = !this.add_img;
    console.log(this.add_img)
  }
  ngOnInit(): void {
    this.getGallery();
  }
  getGallery() {
    this.galleryImageService.getGalleryCollection$().subscribe(
      (documents) => {
        this.galleries = documents;
        this.gallerySelected = this.galleries[this.galleryIndex];
      console.log(this.galleries)
      },
      (error) => {
        console.error(error);
      }
    );
  }
  addGalleryNameService() {
    const name = this.formGalleryName.controls.name.value!;
    this.galleryImageService.createGalleryImageDocument({ name, images: [] });
    this.add_gallery = false;
    this.formGalleryName.reset();
    this.getGallery()
  }
  changeGallery(index: number) {
    this.galleryIndex = index;
    this.gallerySelected = this.galleries[this.galleryIndex];

  }
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0]; // Accedemos al primer archivo seleccionado si existe.

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      return;
    }

    // Convertimos el archivo a Base64.
    const reader = new FileReader();
    reader.onload = (e) => {
      this.formImage.controls.image.setValue(e.target?.result?.toString()!);
    };
    reader.readAsDataURL(file);

    // Puedes realizar acciones adicionales con el archivo seleccionado aquí, si es necesario.
  }
  async addImage() {
    if (this.formImage.controls.image.value === '') return;

    const imgData = await this.storageService.uploadBase64({
      route: this.gallerySelected.name! + " - " + this.gallerySelected.uid,
      image: this.formImage.controls.image.value!,
    });

    const img: Image = {
      url: imgData.imageUrl,
    };
    this.galleryImageService.addImageToGalleryDocument(
      this.gallerySelected.uid!,
      img
    );
    this.add_img = false;
    this.formImage.reset();
    setTimeout(() => {
      this.getGallery();
    }, 1000);
  }
  deleteImg(img: Image) {
    Swal.fire({
      title: 'Eliminar Imagen',
      text:'Este elemento se borrara permanentemente de la base de datos, ¿Estas seguro de continuar?',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText:'Cancelar',
      reverseButtons:true,
      confirmButtonColor:"red",
    }).then((result) => {
      if (result.isConfirmed) {
        this.storageService.deleteImageByUrl(img.url);
        console.log(img.url);
        this.galleryImageService.deleteImageFromGalleryDocument(
        this.gallerySelected.uid!,
        img.url!
        );
        setTimeout(() => {
          this.getGallery();
        }, 1000);
      }
    });
  }
}
