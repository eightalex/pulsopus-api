import { Department, EUserRole, User } from '@app/entities';
import {
  Ability,
  AbilityBuilder,
  AbilityClass,
  ExtractSubjectType,
  InferSubjects,
} from '@casl/ability';
import { Injectable } from '@nestjs/common';
import { ECaslAction } from './casl-actions';

type Subjects = InferSubjects<typeof User | typeof Department> | 'all';

export type AppAbility = Ability<[ECaslAction, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
  createForRole(role: EUserRole) {
    const { can, cannot, build } = new AbilityBuilder<
      Ability<[ECaslAction, Subjects]>
    >(Ability as AbilityClass<AppAbility>);

    can(ECaslAction.MANAGE, 'all');
    // if (user.isAdmin) {
    //   can(ECaslAction.MANAGE, 'all'); // read-write access to everything
    // } else {
    //   can(ECaslAction.READ, 'all'); // read-only access to everything
    // }
    //
    // can(ECaslAction.UPDATE, User, { authorId: user.id });
    // cannot(ECaslAction.DELETE, User, { isPublished: true });

    return build({
      // Read https://casl.js.org/v6/en/guide/subject-type-detection#use-classes-as-subject-types for details
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }
}
