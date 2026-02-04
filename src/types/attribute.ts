export type AttributeCategory = 'dealbreaker' | 'desired';

export interface Attribute {
  id: string;
  name: string;
  category: AttributeCategory;
  createdAt: Date;
  order: number;
}

export interface AttributeInput {
  name: string;
  category: AttributeCategory;
}
