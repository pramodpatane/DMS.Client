import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { GridConfigurationModel } from '../../../core/Models/grid-configuration.model';
import { CommonAgGrid } from '../../../core/Components/common-ag-grid/common-ag-grid';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CollectionModel } from '../../Models/collection.model';
import { ClientsService } from '../../Services/clients.service';
import { DropdownModel } from '../../../auth/Models/dropdown.model';
import { SwalService } from '../../../global/swal.service';
import { CollectionsService } from '../../Services/collections.service';
import { MenuPermissionsService } from '../../../core/Services/menu.permissions.service';

@Component({
  selector: 'app-collection',
  imports: [CommonAgGrid, CommonModule, ReactiveFormsModule],
  templateUrl: './collection.html',
  styleUrl: './collection.css',
})
export class Collection implements OnInit {
  clientsList: DropdownModel[] = [];
  currentDate = new Date().toISOString().split('T')[0];
  currentTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
  IsDefaultView: boolean = true;
  FormHeaderText: string = "Add Collection";
  gridConfiguration: GridConfigurationModel = new GridConfigurationModel();
  totalCount: number = 0;
  milkCollectionForm!: FormGroup;
  gridData: any[] = [];
  canView = false;
  canAdd = false;
  canEdit = false;
  canDelete = false;

  constructor(private formBuilder: FormBuilder, private swalservice: SwalService, 
      private clientsService: ClientsService, private swalService: SwalService, 
      private collectionsService: CollectionsService, private cdr: ChangeDetectorRef,
      private menuPermissionsState: MenuPermissionsService) {     
  }

  ngOnInit() {
    this.GetActionPermissions();
    this.SetGridConfiguration();
    this.GetData();
    this.DeclareForm();
    this.GetClientsDropdown();
  }

  get form() {
    return this.milkCollectionForm.controls;
  }

  // method for reactive for building
  DeclareForm() {
    this.milkCollectionForm = this.formBuilder.group({
      recordId: [null],
      clientId: ['', Validators.required],
      collectionTime: [this.currentTime, Validators.required],
      collectionDate: [this.currentDate, [Validators.required]],
      collectionShift: ['', [Validators.required]],
      productType: [null, Validators.required],
      quantity: [null, Validators.required],
      fat: [null],
      snf: [null],
      temperature: [''],
      rate: [''],
      uom: [null, Validators.required],
      totalAmount: [''],
      paymentStatus: [''],
      paymentMode: [''],
      collectionCenter: ['', Validators.required],
      description: [''],
      isActive: [true],
      isDeleted: [false]
    });
  }

  // method to get values from rective form fields and bind to model
  ConvertFormToModel() {
    const model = new CollectionModel();
    model.recordId = this.milkCollectionForm.value.recordId;
    model.formCode = "MCLN";
    model.clientId = this.milkCollectionForm.value.clientId;
    model.collectionTime = this.milkCollectionForm.value.collectionTime;
    model.collectionDate = this.milkCollectionForm.value.collectionDate;
    model.collectionShift = this.milkCollectionForm.value.collectionShift;
    model.milkType = this.milkCollectionForm.value.milkType;
    model.quantity = this.milkCollectionForm.value.quantity;
    model.fat = this.milkCollectionForm.value.fat;
    model.snf = this.milkCollectionForm.value.snf;
    model.temperature = this.milkCollectionForm.value.temperature;
    model.rate = this.milkCollectionForm.value.rate;
    model.uom = this.milkCollectionForm.value.uom;
    model.totalAmount = this.milkCollectionForm.value.totalAmount;
    model.paymentStatus = this.milkCollectionForm.value.paymentStatus;
    model.paymentMode = this.milkCollectionForm.value.paymentMode;
    model.collectionCenter = this.milkCollectionForm.value.collectionCenter;
    model.description = this.milkCollectionForm.value.description;
    model.isActive = this.milkCollectionForm.value.isActive;
    model.isDeleted = this.milkCollectionForm.value.isDeleted;

    //console.log(model);
    return model;
  }

  public GetActionPermissions() {
    this.canView = this.menuPermissionsState.canView('Milk Collection');
    this.canAdd = this.menuPermissionsState.canAdd('Milk Collection');
    this.canEdit = this.menuPermissionsState.canEdit('Milk Collection');
    this.canDelete = this.menuPermissionsState.canDelete('Milk Collection');
  }

  public SetGridConfiguration() {
    this.gridConfiguration.gridColumns = [];
    const columns: any[] = [      
      { field: 'clientName', width: 100, headerName: 'Farmer Name', flex: 1, sortable: true, filter: true, resizable: true },
      { field: 'centerName', width: 100, headerName: 'Collection Center', flex: 1, sortable: true, filter: true, resizable: true },
      { field: 'collectionDate', width: 300, headerName: 'Collection Date', flex: 1, sortable: true, filter: true, resizable: true },
      { field: 'collectionShift', width: 100, headerName: 'Collection Shift', flex: 1, sortable: true, filter: true, resizable: true },
      { field: 'collectionTime', width: 100, headerName: 'Collection Time', flex: 1, sortable: true, filter: true, resizable: true },
      { field: 'quantity', width: 100, headerName: 'Quantity', flex: 1, sortable: true, filter: true, resizable: true },
      { field: 'milkType', width: 100, headerName: 'Milk Type', flex: 1, sortable: true, filter: true, resizable: true },
      { field: 'createdDate', width: 150, headerName: 'Created Date', flex: 1, sortable: true, filter: true, resizable: true }
    ];
    // Add Action column only when BOTH permissions are true    
    if (this.canEdit || this.canDelete) {
      columns.unshift({
        headerName: 'Actions',
        width: 110,
        pinned: 'left',
        sortable: false,
        filter: false,
        resizable: false,

        cellRenderer: (params: any) => {
          let actionButtons = '';
          if (this.canEdit) {
            actionButtons += `
              <button
                type="button"
                class="btn btn-sm btn-outline-primary edit-btn"
                title="Edit"
                data-action="edit">
                <i class="bi bi-pencil"></i>
              </button>
            `;
          }

          if (this.canDelete) {
            actionButtons += `
              <button
                type="button"
                class="btn btn-sm btn-outline-danger delete-btn"
                title="Delete"
                data-action="delete">
                <i class="bi bi-trash"></i>
              </button>
            `;
          }

          return `
            <div class="d-flex align-items-center justify-content-center gap-2 h-100">
              ${actionButtons}
            </div>
          `;
        },

        onCellClicked: (params: any) => {

          const target = params.event?.target as HTMLElement;
          const button = target.closest('button');

          if (!button) {
            return;
          }

          const action = button.getAttribute('data-action');

          if (action === 'edit' && this.canEdit) {
            this.Edit(params.data.recordId);
          }

          if (action === 'delete' && this.canDelete) {
            this.Delete(params.data.recordId);
          }
        }
      });
    }

    this.gridConfiguration.gridColumns = columns;
    this.gridConfiguration.gridTitle = 'Collection Master';
  }

  // method to get filter configuration from Grid View
  onGridEvent(gridFilter: any): void {
    this.gridConfiguration.gridFilter = gridFilter;
    this.GetData();
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.gridConfiguration.gridFilter.filterString = value;
    const gridColumnFields = this.gridConfiguration.gridColumns
    .filter(column => column.field)
    .map(column => column.field);

    const filterString = gridColumnFields
    .map(field => `${field} like '${value}%'`)
    .join(' OR ');

    this.gridConfiguration.gridFilter.skip = 0;
    this.gridConfiguration.gridFilter.filterString = filterString;
    this.GetData();
  }

  OpenForm() {
    this.toggleIsDefaultView();
  }

  toggleIsDefaultView() {
    this.IsDefaultView = !this.IsDefaultView;
  }

  onCancel() {
    this.toggleIsDefaultView();
  }

  ClearForm() {
    this.DeclareForm();
  }

  // method to get collection grid data
  public async GetData() {
   try{
      const today = new Date();
      const dateBefore120Days = new Date();
      dateBefore120Days.setDate(today.getDate() - 120);
      this.gridConfiguration.gridFilter.fromDate = dateBefore120Days;
      this.gridConfiguration.gridFilter.toDate = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
      
       (await this.collectionsService.GetAllData(this.gridConfiguration.gridFilter)).subscribe({
          next: (res) => {            
            let response = JSON.parse(JSON.stringify(res));
            //console.log(response)
            this.gridConfiguration.gridData = response.data;
            this.gridData = response.data;
            this.totalCount = response.totalCount;
            this.cdr.detectChanges();
          },
          error: () => {
            this.swalService.ShowAlert("error", "");
          }
        }); //✅
    }
    catch(err) {
      throw err;
    }
  }

  // method to insert collection data
  public async Insert() {
    try {
      let datamodel = this.ConvertFormToModel();

      this.FormHeaderText = "Add Farmer";
      this.toggleIsDefaultView();
      
       (await this.collectionsService.InsertData(datamodel)).subscribe({
          next: (res) => {
            if(res == 1) {
              this.swalService.ShowAlert("success", "Record Inserted Successfully!");
            }
            this.GetData();
          },
          error: () => {
            this.swalService.ShowAlert("error", "");
          }
        });
    }
    catch(err) {
      throw err;
    }
  }

  public async Update() {
    try {
      let datamodel = this.ConvertFormToModel();
      this.FormHeaderText = "Edit Collection";
      this.toggleIsDefaultView();
      
       (await this.collectionsService.UpdateData(datamodel)).subscribe({
          next: (res) => {            
            if(res == 1) {
              this.swalService.ShowAlert("success", "Record Updated Successfully!");
            }
            this.GetData();
          },
          error: () => {
            this.swalService.ShowAlert("error", "");
          }
        });
    }
    catch(err) {
      throw err;
    }
  }

  // method to get collection record data by Id
  public Edit(recordId: any) {
    try {
      this.FormHeaderText = "Edit Colection";
      //this.ButtonText= "Update"; 
      //this.toggleIsDefaultView();  
      
      this.clientsService.GetById(recordId).subscribe({
          next: (res) => {            
            let response = JSON.parse(JSON.stringify(res))
            //console.log(response);
            this.milkCollectionForm.get('recordId')?.setValue(response.recordId);
            this.milkCollectionForm.get('name')?.setValue(response.name);
            this.milkCollectionForm.get('clientType')?.setValue(response.clientType);
            this.milkCollectionForm.get('clientCode')?.setValue(response.clientCode);
            this.milkCollectionForm.get('email')?.setValue(response.email);
            this.milkCollectionForm.get('contactPerson')?.setValue(response.contactPerson);
            this.milkCollectionForm.get('mobile')?.setValue(response.mobile);
            this.milkCollectionForm.get('category')?.setValue(response.category);
            this.milkCollectionForm.get('alternateMobile')?.setValue(response.alternateMobile);
            this.milkCollectionForm.get('address')?.setValue(response.address);
            this.milkCollectionForm.get('isActive')?.setValue(response.isActive);
            this.milkCollectionForm.get('isDeleted')?.setValue(response.isDeleted);

            this.toggleIsDefaultView();
          },
          error: () => {
            this.swalService.ShowAlert("error", "");
          }
        });
    }
    catch(err){
      throw err;
    }
  }

  // method to delete collection record
  public async Delete(recordId: any) {
    try {
      const isConfirmed = await this.swalService.
          confirmDelete('Are you sure to delete?','You will not be able to recover this record.');

      if (isConfirmed) {
        (await this.collectionsService.Delete(recordId)).subscribe({
          next: (res) => {            
            let response = JSON.parse(JSON.stringify(res));
            if(response.isSuccess) {
              this.swalService.ShowAlert("success", response.message);
              this.GetData();
            } else {
              this.swalService.ShowAlert("error", response.message);
            }
          },
          error: () => {
            this.swalService.ShowAlert("error", "");
          }
        });
      }
    }
    catch (err) {
      throw err;
    }
  }

  

  public async GetClientsDropdown() {
    try {
      (await this.clientsService.GetDropdown()).subscribe({
          next: (res) => {            
            this.clientsList = JSON.parse(JSON.stringify(res));
            //console.log("Clients" + this.clientsList);
          },
          error: () => {
            this.swalservice.ShowAlert("error", "");
          }
        });
    }
    catch (err) {
      throw err;
    }
  }
}
