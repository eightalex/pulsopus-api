import { v4 as uuidv4 } from 'uuid';
import { DatabaseService } from '@app/database/database.service';

export class Repository<
  Type extends { id: string; createdAt: number; updatedAt: number },
> {
  private map: Map<Type['id'], Type> = new Map();
  constructor(
    private readonly initialMap: Map<Type['id'], Type>,
    private readonly databaseService: DatabaseService,
  ) {
    // this.list = [...initialMap.values()];
    this.map = new Map(initialMap);
  }

  private upd() {
    this.databaseService.computeData();
  }

  private get generateId() {
    return uuidv4();
  }

  private get list(): Type[] {
    return [...this.map.values()];
  }

  public async findById(id: Type['id']): Promise<Type | undefined> {
    return this.map.get(id);
  }

  public async findBy(by: Partial<Type>): Promise<Type[]> {
    if ('id' in by) {
      const entity = await this.findById(by.id);
      if (!entity) return [];
      return [entity];
    }
    return this.list.filter((u) =>
      Object.keys(by).every((k) => u[k] === by[k]),
    );
  }

  public async findOneBy(by: Partial<Type>): Promise<Type> {
    if ('id' in by) return this.findById(by.id);
    return this.list.find((u) => Object.keys(by).every((k) => u[k] === by[k]));
  }

  public async find(): Promise<Type[]> {
    return this.list;
  }

  public async create(entity: Type): Promise<Type> {
    const newEntity = {
      id: this.generateId(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      ...entity,
    };
    this.map.set(newEntity.id, newEntity);
    return newEntity;
  }

  public async updateOneBy(by: Partial<Type>, update: Type): Promise<Type> {
    const entity = await this.findOneBy(by);
    if (!entity) return null;
    const updatedEntity = { ...entity, ...update };
    this.list.map((e) => {
      if (e.id !== updatedEntity.id) return e;
      return updatedEntity;
    });
    this.upd();
  }

  public async update(update: Type): Promise<Type> {
    const entity = this.map.get(update.id);
    if (!entity) return this.create(update);
    const updated = {
      ...entity,
      ...update,
      updatedAt: Date.now(),
    };
    this.map.set(updated.id, updated);
    this.upd();
    return updated;
  }
}
