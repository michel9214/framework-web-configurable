export interface ApiResponse<T> {
  data: T;
  message: string;
  statusCode: number;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
  role: Role;
  theme: Theme | null;
}

export interface Role {
  id: number;
  name: string;
  displayName: string;
  description?: string;
  isSystem: boolean;
  isActive: boolean;
}

export interface Theme {
  id: number;
  name: string;
  displayName: string;
  cssClass: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  isDefault: boolean;
  isActive: boolean;
}

export interface Module {
  id: number;
  name: string;
  displayName: string;
  description?: string;
  icon: string;
  order: number;
  isActive: boolean;
}

export interface Page {
  id: number;
  moduleId: number;
  parentPageId?: number | null;
  name: string;
  displayName: string;
  route: string;
  icon: string;
  order: number;
  visibleInMenu: boolean;
  isActive: boolean;
}

export interface Resource {
  id: number;
  pageId: number;
  name: string;
  displayName: string;
  code: string;
  type: 'BUTTON' | 'ACTION' | 'SECTION' | 'FIELD';
  isActive: boolean;
}

export interface MenuItem {
  id: number;
  name: string;
  displayName: string;
  icon: string;
  order: number;
  pages: MenuPage[];
}

export interface MenuPage {
  id: number;
  name: string;
  displayName: string;
  route: string;
  icon: string;
  order: number;
  children: MenuPage[];
}

export interface PageResource {
  code: string;
  displayName: string;
  type: string;
  isAllowed: boolean;
}

export interface PaginatedData<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface RoleWithPermissions extends Role {
  rolePagePermissions: { pageId: number; canAccess: boolean; page: { id: number; name: string; displayName: string; moduleId: number } }[];
  roleResourcePermissions: { resourceId: number; isAllowed: boolean; resource: { id: number; code: string; displayName: string; pageId: number } }[];
  _count: { users: number };
}
