import { v4 as uuidv4 } from 'uuid';
export abstract class AbstractEntity {
  public id: string = uuidv4();
}
