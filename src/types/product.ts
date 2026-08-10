export interface Product {
  id: number;
  name: string;
  sku: string;
  quantity: number;
  price: number;
  created_at: string;
  updated_at: string;
}

// client-supplied fields only; id + timestamps are set server-side
export interface CreateProductInput {
  name: string;
  sku: string;
  quantity: number;
  price: number;
}

export type UpdateProductInput = Partial<CreateProductInput>;
