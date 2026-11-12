import { IAdmin } from '../modules/auth/auth.model';
import { ILawyer } from '../modules/lawyers/lawyer.model';

declare global {
  namespace Express {
    interface Request {
      admin?: IAdmin;
      lawyer?: ILawyer;
      correlationId?: string;
    }
  }
}
