// import { v4 as uuidv4 } from 'uuid';
export abstract class AbstractEntity {
  // public id: string = uuidv4();
  public createdAt: number = Date.now();
  public updatedAt: number = Date.now();
}
