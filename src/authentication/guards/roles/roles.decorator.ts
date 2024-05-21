import { Reflector } from '@nestjs/core';
import { userTypes } from '../../../users/user.interface';

export const Roles = Reflector.createDecorator<userTypes[]>();
