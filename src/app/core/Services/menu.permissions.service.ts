import { Injectable, signal } from "@angular/core";
import { MenuItem } from "../Models/menu-items";

@Injectable({
  providedIn: 'root'
})
export class MenuPermissionsService {

  private menus = signal<MenuItem[]>([]);

  setMenus(menus: MenuItem[]): void {
    this.menus.set(menus);
  }

  clearMenus(): void {
    this.menus.set([]);
  }

  getMenus(): MenuItem[] {
    return this.menus();
  }

  getMenu(title: string): MenuItem | undefined {
    return this.menus().find(
      x => x.title.toLowerCase() === title.toLowerCase()
    );
  }

  canView(title: string): boolean {
    return this.getMenu(title)?.canView === true;
  }

  canAdd(menuCode: string): boolean {
    return this.getMenu(menuCode)?.canAdd === true;
  }

  canEdit(menuCode: string): boolean {
    return this.getMenu(menuCode)?.canEdit === true;
  }

  canDelete(menuCode: string): boolean {
    return this.getMenu(menuCode)?.canDelete === true;
  }
}