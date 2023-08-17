import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import {
  LotaipCategory,
  LotaipDocument,
  LotaipItem,
} from 'src/app/interfaces/lotaip.interface';
import { LotaipService } from 'src/app/services/lotaip.service';
import { StorageService } from 'src/app/services/storage.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-lotaip',
  templateUrl: './lotaip.component.html',
  styleUrls: ['./lotaip.component.scss'],
})
export class LotaipComponent implements OnInit {
  constructor(
    private readonly lotaipService: LotaipService,
    private readonly fb: FormBuilder,
    private readonly storageService:StorageService
  ) {}
  lotaipDocuments: LotaipDocument[] = [];
  categorySelected: LotaipCategory[] = [];
  addLotaip = false;
  addCategory = false;

  addItem = false;
  indexLotaipSelected = 0;
  indexCategorySelected = 0;
  lotaipForm = this.fb.group({
    lotaip: '',
  });
  categoryForm = this.fb.group({
    name: '',
  });
  itemForm = this.fb.group({
    name: '',
    pdfUrl: '',
  });

  setStateAddLotaip() {
    this.addLotaip = !this.addLotaip;
  }
  setStateAddCategory() {
    this.addCategory = !this.addCategory;
  }
  setStateAddItem() {
  
    this.addItem = !this.addItem;
  }
  ngOnInit(): void {
    this.getLotaip();
  }
  getLotaip() {
    this.lotaipService.getLotaipCollection$().subscribe(
      (documents) => {
        this.lotaipDocuments = documents;
        this.categorySelected =
          this.lotaipDocuments[this.indexLotaipSelected].category || [];
        
      },
      (error) => {
        console.error(error);
      }
    );
  }

  addLotaipService() {
    if (this.lotaipForm.controls.lotaip.value === '') return;
    const lotaip: LotaipDocument = {
      name: this.lotaipForm.controls.lotaip.value!,
    };
    this.lotaipService.createLotaipDocument(lotaip);
    this.addLotaip = false;
    this.lotaipForm.reset();
    setTimeout(() => {
      this.getLotaip();
    }, 1000);
  }

  addCategoryService() {
    if (this.categoryForm.controls.name.value === '') return;
    const category: LotaipCategory = {
      name: this.categoryForm.controls.name.value!,
      items: [],
    };
    this.lotaipService.addCategoryToLotaipDocument(
      this.lotaipDocuments[this.indexLotaipSelected].uid!,
      category
    );
    this.addCategory = false;
    this.categoryForm.reset();
    setTimeout(() => {
      this.getLotaip();
    }, 1000);
  }

  deleteLotaip(index: number) {
    Swal.fire({
      title: 'Eliminar Lotaip',
      text:'Este elemento se borrara permanentemente de la base de datos, ¿Estas seguro de continuar?',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText:'Cancelar',
      reverseButtons:true,
      confirmButtonColor:"red",
    }).then((result) => {
      if (result.isConfirmed) {
        this.lotaipService.deleteLotaipDocument(
          this.lotaipDocuments[index].uid!
        );
        setTimeout(() => {
          this.getLotaip();
        }, 1000);
      }
    });
  }

  deleteCategory(index: number) {
    Swal.fire({
      title: 'Eliminar Mes',
      text:'Este elemento se borrara permanentemente de la base de datos, ¿Estas seguro de continuar?',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText:'Cancelar',
      reverseButtons:true,
      confirmButtonColor:"red",
    }).then((result) => {
      if (result.isConfirmed) {
        this.lotaipService.deleteCategoryFromLotaipDocument(
          this.lotaipDocuments[this.indexLotaipSelected].uid!,
          this.categorySelected[index].uid!
        );
        setTimeout(() => {
          this.getLotaip();
        }, 1000);
      }
    });
  }
  deleteItem(item: LotaipItem) {
    Swal.fire({
      title: 'Eliminar Item',
      text:'Este elemento se borrara permanentemente de la base de datos, ¿Estas seguro de continuar?',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText:'Cancelar',
      reverseButtons:true,
      confirmButtonColor:"red",
    }).then((result) => {
      if (result.isConfirmed) {
        this.storageService.deleteImageByUrl(item.urlPDF);
        this.lotaipService.deleteItemFromCategorySubcollection(
          this.lotaipDocuments[this.indexLotaipSelected].uid!,
          this.categorySelected[this.indexCategorySelected].uid!,
          item.uid!
        );
        setTimeout(() => {
          this.getLotaip();
        }, 1000);
      }
    });
  }

  async addItemService() {
    if (this.itemForm.controls.name.value === '') return;
    if (this.itemForm.controls.pdfUrl.value === '') return;


    const pdf = await this.storageService.uploadPDF({
      route: this.lotaipDocuments[this.indexLotaipSelected].name +" - " + this.lotaipDocuments[this.indexLotaipSelected].uid! +'/'+this.categorySelected[this.indexCategorySelected].name +" - "+ this.categorySelected[this.indexCategorySelected].uid!,
      pdf: this.itemForm.controls.pdfUrl.value!
    })

    const item: LotaipItem = {
      name: this.itemForm.controls.name.value!,
      urlPDF: pdf.pdfUrl
    };
    this.lotaipService.addItemToCategorySubcollection(
      this.lotaipDocuments[this.indexLotaipSelected].uid!,
      this.categorySelected[this.indexCategorySelected].uid!,
      item
    );
    this.addItem = false;
    this.itemForm.reset();
    setTimeout(() => {
      this.getLotaip();
    }, 1000);
  }



  openPDF(url: string) {

    window.open(url, '_blank');
  }

  changeLotaip(index: number) {
    this.indexLotaipSelected = index;
    this.categorySelected = this.lotaipDocuments[index].category || [];
    this.indexCategorySelected = 0;
    this.addCategory = false;
    this.addItem = false;
  }

  changeCategoty(index: number) {
    this.indexCategorySelected = index;

  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0]; // Accedemos al primer archivo seleccionado si existe.
  
    if (!file) {
      return;
    }
  
    // Verificamos que el tipo del archivo sea PDF.
    if (file.type !== 'application/pdf') {
      return;
    }
  
    // Convertimos el archivo a Base64.
    const reader = new FileReader();
    reader.onload = (e) => {
      this.itemForm.controls.pdfUrl.setValue(e.target?.result?.toString()!)
    };
    reader.readAsDataURL(file);
  
    // Puedes realizar acciones adicionales con el archivo seleccionado aquí, si es necesario.
  }

  
  
  

}
