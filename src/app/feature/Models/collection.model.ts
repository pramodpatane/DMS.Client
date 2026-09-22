export class CollectionModel {
    id: number = 0;
    recordId?: string;
    clientId: string = "";
    collectionDate!: Date;
    collectionTime: string = "";
    collectionShift: String = "";
    milkType: string = "";
    quantity: number = 0;
    fat: number = 0;
    snf: number = 0;
    temperature: number = 0;
    
    rate: number = 0;
    uom: string = "";
    totalAmount: string = "";
    paymentStatus: string = "";
    paymentMode: string = "";
    
    collectionCenter?: string;
    description: string = "";
    
    formCode: string = "";
    createdBy: string = "";
    createdDate!: Date;
    updatedBy: string = "";
    updatedDate!: Date;
    isActive: boolean = true;
    isDeleted: boolean = false;
}

export class CollectionConfiguration {

}