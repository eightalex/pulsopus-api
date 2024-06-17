import { DatabaseService } from '@app/database/database.service';

export class Repository<
  Type extends { id: string; createdAt: number; updatedAt: number },
> {
  private list: Type[] = [];
  constructor(
    private readonly initList: Map<Type['id'], Type>,
    private readonly databaseService: DatabaseService,
  ) {
    this.list = [...initList.values()];
  }

  private upd() {
    this.databaseService.computeData();
  }

  public async findBy(by: Partial<Type>): Promise<Type[]> {
    return this.list.filter((u) =>
      Object.keys(by).every((k) => u[k] === by[k]),
    );
  }

  public async findOneBy(by: Partial<Type>): Promise<Type> {
    return this.list.find((u) => Object.keys(by).every((k) => u[k] === by[k]));
  }

  public async find(): Promise<Type[]> {
    return this.list;
  }

  public async create(entity: Type): Promise<Type> {
    this.list = [...this.list, entity];
    return entity;
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
    let entity = null;
    this.list.map((e) => {
      update.updatedAt = Date.now();
      if (e.id !== update.id) return e;
      entity = update;
      return update;
    });
    this.upd();
    return entity;
  }
}
