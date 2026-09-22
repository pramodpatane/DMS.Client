import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { EmployeeModel } from "../Models/employee.model";
import { EmployeesApiUrls } from "../API_Urls/employees.api.urls";

@Injectable({
  providedIn: "root"
})

export class EmployeeService {
  baseUrl: string = 'https://localhost:44391/';
  apiUrl: EmployeesApiUrls = new EmployeesApiUrls();

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

  public GetById(id: string) {
    try {
      const apiurl = `${this.baseUrl}${this.apiUrl.GetById}(${id})`;
      return this.http.get(apiurl);
    }
    catch (err) {
      throw err;
    }
  }

  public async InsertData(data: EmployeeModel) {
    try {
      const apiurl = `${this.baseUrl}${this.apiUrl.Insert}`;
      return await this.http.post(apiurl, data);
    } catch (err) {
      throw err;
    }
  }

  public async UpdateData(data: any) {
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