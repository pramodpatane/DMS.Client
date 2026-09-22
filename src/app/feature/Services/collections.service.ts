import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { CollectionsApiUrls } from "../API_Urls/collections.api.urls";
import { CollectionModel } from "../Models/collection.model";

@Injectable({
    providedIn: 'root'
})

export class CollectionsService {
    baseUrl: string = 'https://localhost:44391/';
    apiUrl: CollectionsApiUrls = new CollectionsApiUrls();

    constructor(private http: HttpClient) { }

    public async GetAllData(data: any) {
        try {
            const apiurl = `${this.baseUrl}${this.apiUrl.GetAll}`;
            return await this.http.post(apiurl, data);
        }
        catch (err) {
            throw err;
        }
    }

    public async GetRecentCollections() {
        try {
            const apiurl = `${this.baseUrl}${this.apiUrl.GetRecentCollection}`;
            return await this.http.get(apiurl);
        }
        catch (err) {
            throw err;
        }
    }

    public async GetById(id: string) {
        try {
            const apiurl = `${this.baseUrl}${this.apiUrl.GetById}(${id})`;
            return await this.http.get(apiurl);
        }
        catch (err) {
            throw err;
        }
    }

    public async InsertData(data: CollectionModel) {
        try {
            const apiurl = `${this.baseUrl}${this.apiUrl.Insert}`;
            return await this.http.post(apiurl, data);
        } catch (err) {
            throw err;
        }
    }

    public async UpdateData(data: CollectionModel) {
        try {
            const apiurl = `${this.baseUrl}${this.apiUrl.Update}`;
            return await this.http.put(apiurl, data);
        } catch (err) {
            throw err;
        }
    }

    public async Delete(recordId: string) {
        try {
            const apiurl = `${this.baseUrl}${this.apiUrl.Delete}(${recordId})`;
            return await this.http.delete(apiurl);
        } catch (err) {
            throw err;
        }
    }
}