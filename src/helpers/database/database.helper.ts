import { HttpStatus, Injectable } from '@nestjs/common'
import { ObjectLiteral, Repository, SelectQueryBuilder } from 'typeorm';
import { ExceptionService } from '../../core/exception';
import { RequestHelper } from '../request/request.helper';
import { Utility } from '../utility/utility.helper';

@Injectable()
export class DatabaseHelper {
  constructor(private exception: ExceptionService) { }

  applyQueryOptions<Type extends ObjectLiteral>(
    repository: Repository<Type>,
    queryOptions: RequestHelper.QueryOptions<Type> = {},
    where: Record<string, any> = {}
  ): SelectQueryBuilder<Type> {
    const query = repository.createQueryBuilder('entity')
    this.applyIncludes(query, queryOptions)
    this.applyFilters(query, queryOptions)
    this.applySelects(query, queryOptions)
    this.applySelectsWithJoin(query, queryOptions)
    return query
  }

  notFoundByQuery(where: Record<string, any>) {
    const keyValues = Object.entries(where)
      .map(([key, value]) => `"${key}"="${value}"`)
      .join(', ')

    return this.exception.throw({
      status: HttpStatus.NOT_FOUND,
      code: 101,
      publicMessage: 'Resource was not found',
      privateMessage: `Resource with ${keyValues} was not found.`,
    })
  }

  invalidQueryWhere(...keys: string[]) {
    const keysString = keys.map(key => `"${key}"`).join(', ')

    return this.exception.throw({
      status: HttpStatus.BAD_REQUEST,
      code: 100,
      publicMessage: 'Resource was not found',
      privateMessage: `Resource where conditions for keys ${keysString} are invalid.`,
    })
  }

  /* --------------------------------- PRIVATE -------------------------------- */
  private applyIncludes<Type extends ObjectLiteral>(
    query: SelectQueryBuilder<Type>,
    queryOptions: RequestHelper.QueryOptions<Type>,
  ): void {
    const includes = (queryOptions.includes ?? []) as string[]

    const store = {}

    includes.forEach((relation, relationIndex) => {
      const keys = relation.split('.')

      const keysParent = []

      keys.forEach((key, keyIndex) => {
        const keyUnique = `${key}_${relationIndex}_${keyIndex}`

        const isRoot = keyIndex === 0

        if (isRoot) {
          const canJoin = Utility.isNull(store[key])

          if (canJoin) {
            query.leftJoinAndSelect(`entity.${key}`, `${keyUnique}`)

            store[key] = keyUnique
          }
        } else {
          const keyParent = keysParent.join('.')

          const keyParentUnique = store[keyParent]

          query.leftJoinAndSelect(`${keyParentUnique}.${key}`, `${keyUnique}`)

          store[`${keyParent}.${key}`] = keyUnique
        }

        // @ts-ignore
        keysParent.push(key)
      })
    })
  }

  private applyFilters<Type extends ObjectLiteral>(
    query: SelectQueryBuilder<Type>,
    queryOptions: RequestHelper.QueryOptions<Type>,
  ): void {
    const filters: Partial<Type> = queryOptions.filters ?? {}

    const conditions = []
    const values = {}

    for (const [key, value] of Object.entries(filters)) {
      const isArray = Array.isArray(value)

      if (isArray) {
        // @ts-ignore
        conditions.push(`entity.${key} IN (:...${key})`)

        values[key] = value
      } else if (typeof value === 'object') {
        const filters = this.buildQueryOptionsFilters(key, value)

        for (const filter of filters) {
          // @ts-ignore
          conditions.push(filter.condition)

          values[filter.key] = filter.value
        }
      } else {
        // @ts-ignore
        conditions.push(`entity.${key} = :${key}`)

        values[key] = value
      }
    }

    query.where(conditions.join(' AND '), values)
  }

  private buildQueryOptionsFilters(
    key: string,
    filter: RequestHelper.FilterCondition,
  ): { condition: string; key: string; value: any }[] {
    const conditions: {
      condition: string
      key: string
      value: any
    }[] = []

    if (filter === null) {
      conditions.push({
        condition: `entity.${key} IS NULL`,
        key: `${key}EQ`,
        value: null,
      })

      return conditions
    }

    if (Utility.isDefined(filter.eq)) {
      conditions.push({
        condition: `entity.${key} = :${key}EQ`,
        key: `${key}EQ`,
        value: filter.eq,
      })
    }

    if (Utility.isDefined(filter.neq)) {
      conditions.push({
        condition: `entity.${key} != :${key}NEQ`,
        key: `${key}NEQ`,
        value: filter.neq,
      })
    }

    if (Utility.isDefined(filter.gt)) {
      conditions.push({
        condition: `entity.${key} > :${key}GT`,
        key: `${key}GT`,
        value: filter.gt,
      })
    }

    if (Utility.isDefined(filter.gte)) {
      conditions.push({
        condition: `entity.${key} >= :${key}GTE`,
        key: `${key}GTE`,
        value: filter.gte,
      })
    }

    if (Utility.isDefined(filter.lt)) {
      conditions.push({
        condition: `entity.${key} < :${key}LT`,
        key: `${key}LT`,
        value: filter.lt,
      })
    }

    if (Utility.isDefined(filter.lte)) {
      conditions.push({
        condition: `entity.${key} <= :${key}LTE`,
        key: `${key}LTE`,
        value: filter.lte,
      })
    }

    if (Utility.isDefined(filter.in)) {
      conditions.push({
        condition: `entity.${key} IN (:...${key}IN)`,
        key: `${key}IN`,
        value: filter.in,
      })
    }

    if (Utility.isDefined(filter.nin)) {
      conditions.push({
        condition: `entity.${key} NOT IN (:...${key}NIN)`,
        key: `${key}NIN`,
        value: filter.nin,
      })
    }

    if (Utility.isDefined(filter.like)) {
      conditions.push({
        condition: `entity.${key} LIKE :${key}LIKE`,
        key: `${key}LIKE`,
        value: filter.like,
      })
    }

    if (Utility.isDefined(filter.ilike)) {
      conditions.push({
        condition: `entity.${key} ILIKE :${key}ILIKE`,
        key: `${key}ILIKE`,
        value: filter.ilike,
      })
    }

    return conditions
  }
  private applySelects<Type extends ObjectLiteral>(
    query: SelectQueryBuilder<Type>,
    queryOptions: RequestHelper.QueryOptions<Type>,
  ): void {
    const selects = queryOptions.selects;
    if (selects && selects.length > 0) {
      const selectFields = selects.map(field => `entity.${String(field)}`);
      query.select(selectFields);
    }
  }


  // ex of using applySelectsWithJoin
  // const queryOptions: RequestHelper.QueryOptions<YourEntity> = {
  //   selects: ['id', 'name'],
  //   selectsWithJoin: {
  //     'user': ['id', 'email'],
  //     'profile': ['avatar']
  //   },
  //   includes: ['user', 'profile'],
  //   filters: { status: 'active' },
  //   orders: { createdAt: 'DESC' },
  //   pagination: { page: 1, countItems: 20 }
  // };

  // const query = databaseHelper.applyQueryOptions(repository, queryOptions);
  // const results = await query.getMany();


  private applySelectsWithJoin<Type extends ObjectLiteral>(
    query: SelectQueryBuilder<Type>,
    queryOptions: RequestHelper.QueryOptions<Type>,
  ): void {
    const selectsWithJoin = queryOptions.selectsWithJoin;
    if (selectsWithJoin && Object.keys(selectsWithJoin).length > 0) {
      for (const [joinAlias, fields] of Object.entries(selectsWithJoin)) {
        fields.forEach(field => {
          query.addSelect(`${joinAlias}.${String(field)}`, `${joinAlias}_${String(field)}`);
        });
      }
    }
  }


}
