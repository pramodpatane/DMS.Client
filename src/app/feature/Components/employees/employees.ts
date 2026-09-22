import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { SwalService } from '../../../global/swal.service';
import { EmployeeService } from '../../Services/employee-service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { EmployeeModel } from '../../Models/employee.model';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DepartmentService } from '../../../core/Services/departments.service';
import { DropdownModel } from '../../../auth/Models/dropdown.model';
import { GridConfigurationModel } from '../../../core/Models/grid-configuration.model';
import { CommonAgGrid } from '../../../core/Components/common-ag-grid/common-ag-grid';
import { MenuPermissionsService } from '../../../core/Services/menu.permissions.service';

@Component({
  selector: 'app-employees',
  imports: [ReactiveFormsModule, CommonModule, CommonAgGrid,
    MatFormFieldModule, MatDatepickerModule, FormsModule],
  templateUrl: './employees.html',
  styleUrl: './employees.css',
})
export class Employees implements OnInit {
  employeeForm!: FormGroup;
  IsDefaultView: boolean = true;
  HeaderText: string = "Add Employee";
  ButtonText: string = "Insert";
  gridColumnFields: any[] = [];
  
  gridData: any[] = [];
  totalCount: number = 0;
  fromDate!: Date;
  DepartmentsList: DropdownModel[] = [];
  //filterdata: FilterData = new FilterData();
  gridConfiguration: GridConfigurationModel = new GridConfigurationModel();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  firstDay: any;
  canView = false;
  canAdd = false;
  canEdit = false;
  canDelete = false;
  
  constructor(private swalservice: SwalService, private employeeService: EmployeeService, private cdr: ChangeDetectorRef,
    private formBuilder: FormBuilder, private departmentService: DepartmentService,
    private menuPermissionsState: MenuPermissionsService
  ) { }

  ngOnInit() {
    this.GetActionPermissions();
    this.SetGridConfiguration();
    this.GetData();
    this.DeclareForm();  
    this.GetDepartmentDropdown();
  }

  OpenForm() {
    this.ClearForm();
    this.toggleIsDefaultView();
    this.HeaderText = "Add Employee";
    this.ButtonText = "Insert";
  }

  toggleIsDefaultView() {
    this.IsDefaultView = !this.IsDefaultView;
  }

  DeclareForm() {
    this.employeeForm = this.formBuilder.group({
      recordId: [null],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      salary: [null, [Validators.required, Validators.min(0)]],
      departmentId: [null, Validators.required],
      isActive: [true],
      isDeleted: [false]
    });
  }

  ConvertFormToModel() {
    const model = new EmployeeModel();
    model.recordId = this.employeeForm.value.recordId;
    model.firstName = this.employeeForm.value.firstName;
    model.lastName = this.employeeForm.value.lastName;
    model.email = this.employeeForm.value.email;
    model.salary = this.employeeForm.value.salary;
    model.departmentId = this.employeeForm.value.departmentId;
    model.isActive = this.employeeForm.value.isActive;
    model.isDeleted = this.employeeForm.value.isDeleted;

    model.departmentId = Number(model.departmentId);
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
    const columns: any[] = [
      { field: 'firstName', width: 100, headerName: 'First Name', flex: 1, sortable: true, filter: true, resizable: true },
      { field: 'lastName', width: 100, headerName: 'Last Name', flex: 1, sortable: true, filter: true, resizable: true },
      { field: 'email', width: 300, headerName: 'Email', flex: 1, sortable: true, filter: true, resizable: true },
      { field: 'salary', width: 100, headerName: 'Salary', flex: 1, sortable: true, filter: true, resizable: true },
      { field: 'department', width: 100, headerName: 'Department', flex: 1, sortable: true, filter: true, resizable: true },
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
    this.gridConfiguration.gridTitle = 'Employee Master';
    //this.gridConfiguration.gridFilter.pagesize = 20;
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
    //console.log('Event received from common grid:', gridFilter);
    this.gridConfiguration.gridFilter = gridFilter;
    this.GetData();
  }

  get form() {
    return this.employeeForm.controls;
  }

  async GetData() {
    try{
      const today = new Date();
      const dateBefore120Days = new Date();
      dateBefore120Days.setDate(today.getDate() - 120);
      this.gridConfiguration.gridFilter.fromDate = dateBefore120Days;
      this.gridConfiguration.gridFilter.toDate = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
      
       (await this.employeeService.GetAllData(this.gridConfiguration.gridFilter)).subscribe({
          next: (res) => {            
            let response = JSON.parse(JSON.stringify(res));
            //console.log(response)
            this.gridConfiguration.gridData = response.data;
            this.gridData = response.data;
            this.totalCount = response.totalCount;
            this.cdr.detectChanges();
          },
          error: () => {
            this.swalservice.ShowAlert("error", "");
          }
        });
      //} ✅
    }
    catch(err) {
      throw err;
    }
  }

  // insert form data method
  public async Insert() {
    try {
      let datamodel = this.ConvertFormToModel();

      this.HeaderText = "Add Employee";
      this.toggleIsDefaultView();
      
       (await this.employeeService.InsertData(datamodel)).subscribe({
          next: (res) => {
            if(res == 1) {
              this.swalservice.ShowAlert("success", "Record Inserted Successfully!");
            }
            this.GetData();
          },
          error: (err) => {
            this.swalservice.ShowAlert("error", err);
          }
        });
    }
    catch(err) {
      throw err;
    }
  }

  // update form data method
  public async Update() {
    try {
      let datamodel = this.ConvertFormToModel();
      this.HeaderText = "Edit Employee";
      this.toggleIsDefaultView();
      
       (await this.employeeService.UpdateData(datamodel)).subscribe({
          next: (res) => {            
            if(res == 1) {
              this.swalservice.ShowAlert("success", "Record Updated Successfully!");
            }
            this.GetData();
          },
          error: () => {
            this.swalservice.ShowAlert("error", "");
          }
        });
    }
    catch(err) {
      throw err;
    }
  }

  // public async Edit(recordId: string): Promise<void> {
  //   try { 
  //     this.HeaderText = "Edit Employee";
  //     this.ButtonText= "Update";
  //     this.IsDefaultView = true;
      
  //     const response = await this.employeeService.GetById(recordId); 
  //       response.subscribe({ next: (response: any) => 
  //       { 
  //         //console.log('Employee response:', response); 
  //         this.employeeForm.get('recordId')?.setValue(response.recordId);
  //         this.employeeForm.get('firstName')?.setValue(response.firstName);
  //         this.employeeForm.get('lastName')?.setValue(response.lastName);
  //         this.employeeForm.get('email')?.setValue(response.email);
  //         this.employeeForm.get('salary')?.setValue(response.salary);
  //         this.employeeForm.get('departmentId')?.setValue(response.departmentId);
  //         this.employeeForm.get('isActive')?.setValue(response.isActive);
  //         this.employeeForm.get('isDeleted')?.setValue(response.isDeleted);
  //         error: (error: any) => { 
  //             console.error('Get employee failed:', error); 
  //         } 
  //       }
  //     }); 
  //   } 
  //   catch (error) { 
  //     console.error('Edit failed:', error); 
  //   } 
  // }
  public Edit(recordId: string) {
    try {
      this.HeaderText = "Edit Employee";
      this.ButtonText= "Update";
      
      
       this.employeeService.GetById(recordId).subscribe({
          next: (res) => {            
            let response = JSON.parse(JSON.stringify(res))
            //console.log(response)
            this.employeeForm.get('recordId')?.setValue(response.recordId);
            this.employeeForm.get('firstName')?.setValue(response.firstName);
            this.employeeForm.get('lastName')?.setValue(response.lastName);
            this.employeeForm.get('email')?.setValue(response.email);
            this.employeeForm.get('salary')?.setValue(response.salary);
            this.employeeForm.get('departmentId')?.setValue(response.departmentId);
            this.employeeForm.get('isActive')?.setValue(response.isActive);
            this.employeeForm.get('isDeleted')?.setValue(response.isDeleted);
            this.toggleIsDefaultView();
          },
          error: () => {
            this.swalservice.ShowAlert("error", "");
          }
        });
    }
    catch(err){
      throw err;
    }
  }

  public async Delete(recordId: string) {
    try {
      const isConfirmed = await this.swalservice.
          confirmDelete('Are you sure to delete?','You will not be able to recover this record.');

      if (isConfirmed) {
        (await this.employeeService.Delete(recordId)).subscribe({
          next: (res) => {            
            let response = JSON.parse(JSON.stringify(res));
            if(response.isSuccess) {
              this.swalservice.ShowAlert("success", response.message);
              this.GetData();
            } else {
              this.swalservice.ShowAlert("error", response.message);
            }
          },
          error: () => {
            this.swalservice.ShowAlert("error", "");
          }
        });
      }
    }
    catch (err) {
      throw err;
    }
  }

  ClearForm() {
    this.DeclareForm();
  }

  public async GetDepartmentDropdown() {
    try {
      (await this.departmentService.GetDepartmentDropdown()).subscribe({
          next: (res) => {            
            this.DepartmentsList = JSON.parse(JSON.stringify(res));
            //console.log("Departments" + this.DepartmentsList)
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
