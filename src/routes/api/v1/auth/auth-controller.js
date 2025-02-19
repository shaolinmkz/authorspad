import createError from 'http-errors';
import UserService from '@services/user-service';
import JWTService from '@services/jwt-service';
import { messages } from '@helpers/constants';
import BaseController from '../base-controller';

/**
 * A class representing AuthController
 *
 * @class AuthController
 * @extends {BaseController}
 */
class AuthController extends BaseController {
  /**
   * Authenticate user
   *
   * @param {object} req - Express Request object
   * @param {object} res - Express Response object
   * @param {Function} res - Express next function
   * @memberof AuthController
   */
  login() {
    return this.asyncWrapper(async (req, res) => {
      const { body: { username, password } } = req;
      const user = await this.service.getByEmailOrUsername(username);
      const valid = user.comparePassword(password);

      const { INVALID_CREDENTIALS } = messages;
      if (!valid) {
        throw createError(401, INVALID_CREDENTIALS);
      }

      const id = user.get('id');
      const token = JWTService.sign({ id, username });
      this.sendResponse(res, { token });
    });
  }

  /**
   * Get user profile
   *
   * @param {object} req - Express Request object
   * @param {object} res - Express Response object
   * @param {Function} res - Express next function
   * @memberof AuthController
   */
  profile() {
    return this.asyncWrapper(async (req, res) => {
      const { user: { id } } = req;
      const user = await this.service.getById(id, { plain: true });

      delete user.password;
      this.sendResponse(res, { user });
    });
  }
}

export default new AuthController(UserService);
