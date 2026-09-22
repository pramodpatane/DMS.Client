import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { DropdownModel } from '../../../auth/Models/dropdown.model';
import { FilterData } from '../../../core/Models/FilterData';
import { ClientsModel } from '../../Models/clients.model';
import { ClientsService } from '../../Services/clients.service';
import { SwalService } from '../../../global/swal.service';
import { CommonAgGrid } from '../../../core/Components/common-ag-grid/common-ag-grid';
import { GridConfigurationModel } from '../../../core/Models/grid-configuration.model';
import { MenuPermissionsService } from '../../../core/Services/menu.permissions.service';

@Component({
  selector: 'app-clients',
  imports: [ReactiveFormsModule, CommonModule, MatTableModule, MatPaginatorModule, MatIconModule, 
    MatFormFieldModule, MatDatepickerModule, FormsModule, CommonAgGrid],
  templateUrl: './clients.html',
  styleUrl: './clients.css',
})

export class Clients implements OnInit {
  clientForm!: FormGroup;
  IsDefaultView: boolean = true;
  HeaderText: string = "Add Client";
  ButtonText: string = "Insert";
  gridConfiguration: GridConfigurationModel = new GridConfigurationModel();
  gridData: any[] = [];
  clientsData = [];
  totalCount: number = 0;
  fromDate!: Date;
  DepartmentsList: DropdownModel[] = [];
  canView = false;
  canAdd = false;
  canEdit = false;
  canDelete = false;

  constructor(private formBuilder: FormBuilder, private clientsService: ClientsService, private cdr: ChangeDetectorRef,
    private swalService: SwalService, private menuPermissionsState: MenuPermissionsService
  ) { }

  ngOnInit() {
    this.GetActionPermissions();
    this.SetGridConfiguration();
    this.GetData();
    this.DeclareForm();
  }

  DeclareForm() {
    this.clientForm = this.formBuilder.group({
      recordId: [''],
      firstname: ['', Validators.required],
      lastname: ['', Validators.required],
      clientCode: ['', Validators.required],
      clientType: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      mobile: [null, [Validators.required, Validators.min(10)]],
      alternateMobile: [null, [Validators.required, Validators.min(10)]],
      userName: [null, Validators.required],
      taxId: ["null", Validators.required],
      address: [null, Validators.required],
      category: [null, Validators.required],
      isActive: [true],
      isDeleted: [false]
    });

    // code to select only one checkbox at a time for isActive and isDeleted
    this.clientForm.get('isActive')?.valueChanges.subscribe(value => {
      if (value) {
        this.clientForm.patchValue({ isDeleted: false }, { emitEvent: false });
      }
    });
    this.clientForm.get('isDeleted')?.valueChanges.subscribe(value => {
      if (value) {
        this.clientForm.patchValue({ isActive: false }, { emitEvent: false });
      }
    });
  }

  ConvertFormToModel() {
    const model = new ClientsModel();
    model.recordId = this.clientForm.value.recordId;
    model.firstname = this.clientForm.value.firstname;
    model.lastname = this.clientForm.value.lastname;
    model.clientCode = this.clientForm.value.clientCode;
    model.clientType = this.clientForm.value.clientType;
    model.email = this.clientForm.value.email;
    model.contactPerson = this.clientForm.value.contactPerson;
    model.mobile = this.clientForm.value.mobile;
    model.alternateMobile = this.clientForm.value.alternateMobile;
    model.category = this.clientForm.value.category;
    model.taxId = this.clientForm.value.taxId;
    model.address = this.clientForm.value.address;
    model.isActive = this.clientForm.value.isActive;
    model.isDeleted = this.clientForm.value.isDeleted;
    //console.log(model);
    return model;
  }

  convertToUpperCase(event: any): void {
    const value = event.target.value.toUpperCase();
    event.target.value = value;

    this.clientForm.get('clientCode')?.setValue(value, {
      emitEvent: false
    });
  }

  public GetActionPermissions() {
    this.canView = this.menuPermissionsState.canView('Milk Collection');
    this.canAdd = this.menuPermissionsState.canAdd('Milk Collection');
    this.canEdit = this.menuPermissionsState.canEdit('Milk Collection');
    this.canDelete = this.menuPermissionsState.canDelete('Milk Collection');
  }

  public SetGridConfiguration() {
    const columns: any[] = [
      { field: 'clientCode', width: 100, headerName: 'Farmer Code', flex: 1, sortable: true, filter: true, resizable: true },
      { field: 'firstName', width: 100, headerName: 'First Name', flex: 1, sortable: true, filter: true, resizable: true },
      { field: 'lastName', width: 100, headerName: 'Last Name', flex: 1, sortable: true, filter: true, resizable: true },
      { field: 'clientType', width: 300, headerName: 'Farmer Type', flex: 1, sortable: true, filter: true, resizable: true },
      { field: 'email', width: 300, headerName: 'Email', flex: 1, sortable: true, filter: true, resizable: true },
      { field: 'mobile', width: 100, headerName: 'Mobile', flex: 1, sortable: true, filter: true, resizable: true },
      { field: 'alternateMobile', width: 100, headerName: 'Alternate Mobile', flex: 1, sortable: true, filter: true, resizable: true },
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
    this.gridConfiguration.gridTitle = 'Farmer Master';
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

  onGridEvent(gridFilter: any): void {
    this.gridConfiguration.gridFilter = gridFilter;
    this.GetData();
  }

  toggleIsDefaultView() {
    this.IsDefaultView = !this.IsDefaultView;
  }

  OpenForm() {
    this.ClearForm();
    this.toggleIsDefaultView();
    this.HeaderText = "Add Farmer";
    this.ButtonText = "Insert";
  }

  ClearForm() {
    this.DeclareForm();
  }

  public async GetData() {
    try{
      const today = new Date();
      const dateBefore120Days = new Date();
      dateBefore120Days.setDate(today.getDate() - 120);
      this.gridConfiguration.gridFilter.fromDate = dateBefore120Days;
      this.gridConfiguration.gridFilter.toDate = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
      
       (await this.clientsService.GetAllData(this.gridConfiguration.gridFilter)).subscribe({
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
        });
      //} ✅
    }
    catch(err) {
      throw err;
    }
  }

  public async Insert() {
    try {
      let datamodel = this.ConvertFormToModel();

      this.HeaderText = "Add Farmer";
      this.toggleIsDefaultView();
      
       (await this.clientsService.InsertData(datamodel)).subscribe({
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
      this.HeaderText = "Edit Farmer";
      this.toggleIsDefaultView();
      
       (await this.clientsService.UpdateData(datamodel)).subscribe({
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

  public async Edit(recordId: string) {
    try {
      this.HeaderText = "Edit Farmer";
      this.ButtonText= "Update"; 
      //this.toggleIsDefaultView();  
      
       (await this.clientsService.GetById(recordId)).subscribe({
          next: (res) => {            
            let response = JSON.parse(JSON.stringify(res))
            //console.log(response)
            this.IsDefaultView = true;  
            this.clientForm.get('recordId')?.setValue(response.recordId);
            this.clientForm.get('name')?.setValue(response.name);
            this.clientForm.get('clientType')?.setValue(response.clientType);
            this.clientForm.get('clientCode')?.setValue(response.clientCode);
            this.clientForm.get('email')?.setValue(response.email);
            this.clientForm.get('contactPerson')?.setValue(response.contactPerson);
            this.clientForm.get('mobile')?.setValue(response.mobile);
            this.clientForm.get('category')?.setValue(response.category);
            this.clientForm.get('alternateMobile')?.setValue(response.alternateMobile);
            this.clientForm.get('address')?.setValue(response.address);
            this.clientForm.get('isActive')?.setValue(response.isActive);
            this.clientForm.get('isDeleted')?.setValue(response.isDeleted);            
          },
          error: (err) => { 
            this.swalService.ShowAlert("error", err);
          }
        });
    }
    catch(err){
      throw err;
    }
  }
  

  public async Delete(recordId: string) {
    try {
      const isConfirmed = await this.swalService.
          confirmDelete('Are you sure to delete?','You will not be able to recover this record.');

      if (isConfirmed) {
        (await this.clientsService.Delete(recordId)).subscribe({
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
}
