import { IAdmin } from '../modules/auth/auth.model';
import { ILawyer } from '../modules/lawyers/lawyer.model';
import { ICustomer } from '../modules/customers/customer.model';

declare global {
  namespace Express {
    interface Request {
      admin?: IAdmin;
      lawyer?: ILawyer;
      customer?: ICustomer;
      correlationId?: string;
    }
  }
}
