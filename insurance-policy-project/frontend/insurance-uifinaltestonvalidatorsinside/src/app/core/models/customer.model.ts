export interface Customer {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  created_at?: Date;
}

//Creating a separate interface for Customer form data
export interface CustomerFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  city: string;
  state: string;
  pincode: string;
}