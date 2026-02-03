export interface Category {
  id: string;
  name: string;
  description?: string | null;
  color?: string | null;
  icon?: string | null;
  sortOrder: number;
  parentId?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface CategoryTree {
  id: string;
  name: string;
  description?: string | null;
  color?: string | null;
  icon?: string | null;
  sortOrder: number;
  parentId?: string | null;
  children: CategoryTree[];
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  sortOrder: number;
  parentId?: string | null;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
  sortOrder?: number;
  parentId?: string | null;
}
