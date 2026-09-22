import { ColDef } from "ag-grid-community";
import { FilterData } from "./FilterData";

export class GridConfigurationModel {
    isGridViewEnabled: boolean = true;
    gridPageSizes = [10, 25, 50, 100];
    gridTitle: string = '';
    gridHeight: string = '515px';
    gridRowHeight: number = 49;
    gridWidth: string = '100%'
    gridData: [] = [];
    gridColumns: ColDef[] = [];   
    gridFilter: FilterData = new FilterData();
    isPaginationEnabled: boolean = true;
}