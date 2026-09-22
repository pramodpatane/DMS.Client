export class EmployeeModel {
    id: number = 0;
    recordId?: string;
    firstName: string = "";
    lastName: String = "";
    email: string = "";
    salary!: number;
    departmentId!: number;
    isActive: boolean = true;
    isDeleted: boolean = false;
    createdBy: string = "";
    createdDate: Date = new Date();
    updatedBy: string = "";
    updatedDate!: Date;
}