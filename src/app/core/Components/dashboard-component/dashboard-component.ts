import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FilterData } from '../../Models/FilterData';
import { ClientsService } from '../../../feature/Services/clients.service';
import { SwalService } from '../../../global/swal.service';
import { CollectionsService } from '../../../feature/Services/collections.service';
import { GridConfigurationModel } from '../../Models/grid-configuration.model';
import { CommonAgGrid } from '../common-ag-grid/common-ag-grid';

@Component({
  selector: 'app-dashboard-component',
  imports: [FormsModule, CommonModule, CommonAgGrid],
  templateUrl: './dashboard-component.html',
  styleUrl: './dashboard-component.css',
})
export class DashboardComponent implements OnInit {
  string1: string = "";
  string2: string = "";
  filterdata: FilterData = new FilterData();
  clientsData: any[] = [];
  totalClients: number = 0;
  totalCollections: number = 0;
  thisMonthClients: number = 0;
  thisMonthCollectionSum: number = 0;
  todaysTotalCollection: number = 0;
  gridConfiguration: GridConfigurationModel = new GridConfigurationModel();

  constructor(private clientsService: ClientsService, private cdr: ChangeDetectorRef,
    private swalService: SwalService, private collectionService: CollectionsService,
  ) {}

  ngOnInit(): void {
    this.GetClientsData();
    this.GetRecentCollectionData();
    this.GetCollectionGridHeaders();
  }

  // checkCharacterCount(): boolean {

  //   if (this.string1.length !== this.string2.length) {
  //     return false;
  //   }

  //   const charMap: { [key: string]: number } = {};

  //   // Count chars from first string
  //   for (const char of this.string1) {
  //     charMap[char] = (charMap[char] || 0) + 1;
  //   }

  //   // Decrease count using second string
  //   for (const char of this.string2) {

  //     if (!charMap[char]) {
  //       return false;
  //     }

  //     charMap[char]--;
  //   }

  //   return true;
  // }

  // method to get filter configuration from Grid View
  onGridEvent(gridFilter: any): void {
    this.gridConfiguration.gridFilter = gridFilter;
    this.GetRecentCollectionData();
  }

  public GetCollectionGridHeaders() {
    const columns: any[] = [      
      { field: 'clientName', width: 100, headerName: 'Farmer', flex: 1, sortable: true, filter: true, resizable: true },
      { field: 'centerName', width: 100, headerName: 'Center Name', flex: 1, sortable: true, filter: true, resizable: true },
      { field: 'quantity', width: 300, headerName: 'Milk', flex: 1, sortable: true, filter: true, resizable: true },
      { field: 'collectionShift', width: 100, headerName: 'Collection Shift', flex: 1, sortable: true, filter: true, resizable: true },
      { field: 'collectionDate', width: 100, headerName: 'Collection Date', flex: 1, sortable: true, filter: true, resizable: true },
    ];
    this.gridConfiguration.gridColumns = columns;
    this.gridConfiguration.gridHeight = "300px";
    this.gridConfiguration.isPaginationEnabled = false;
  }

  public async GetClientsData() {
    try{
      const today = new Date();
      const dateBefore120Days = new Date();
      dateBefore120Days.setDate(today.getDate() - 120);
      this.filterdata.fromDate = dateBefore120Days;
      this.filterdata.toDate = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
      
       (await this.clientsService.GetAllData(this.filterdata)).subscribe({
          next: (res) => {            
            let response = JSON.parse(JSON.stringify(res));
            this.clientsData = response.data;
            this.totalClients = response.totalCount;
            this.thisMonthClients = response.thisMonthTotal;            ;
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

  public async GetRecentCollectionData() {
    try{
        ( await this.collectionService.GetRecentCollections()).subscribe({
          next: (res) => {            
            let response = JSON.parse(JSON.stringify(res));
            //console.log(response);
            this.gridConfiguration.gridData = response.data;
            //this.totalCollections = response.totalCount;
            this.thisMonthCollectionSum = response.thisMonthTotalCollection;     
            this.todaysTotalCollection = response.todaysTotalCollection;
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
}
