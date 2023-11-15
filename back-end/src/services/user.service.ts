import {
  RequestSuccess,
  HttpCode,
  RequestFailure,
} from "../utils/request_result";
import Utils from "../utils/utils";
import User, { IUser, UserInput } from "../models/user.model";
import Borrowing from "../models/borrowing.model";
import { Access } from "../middlewares/authorization";
import { verify } from "jsonwebtoken";
import { BorrowingStatus } from "../models/constants";

interface IUserService {
  register(user: UserInput): Promise<void>;
  login(email: string, password: string): Promise<RequestSuccess<unknown>>;
  getAllUsers(): Promise<RequestSuccess<IUser[]>>;
  getUserHistory(userId: string): Promise<RequestSuccess<unknown>>;
  getUserById(userId: string): Promise<RequestSuccess<IUser>>;
  cancelRequest(requestId: string): Promise<RequestSuccess<string>>;
}

class UserService implements IUserService {
  constructor() {}
  async getUserById(userId: string): Promise<RequestSuccess<IUser>> {
    const user = (await User.findById(userId)) as IUser;
    if (user == null) {
      throw new RequestFailure(
        HttpCode.BAD_REQUEST,
        "User not found",
        "User doesn't exist"
      );
    }
    return new RequestSuccess(HttpCode.OK, user, "User found");
  }

  register = async (user: UserInput): Promise<void> => {
    const newUser: UserInput = {
      fullName: user.fullName,
      email: user.email,
      password: user.password,
    };
    const foundUser = await User.findOne({ email: user.email });
    if (foundUser != null) {
      throw new RequestFailure(
        HttpCode.BAD_REQUEST,
        "Registration failed",
        "This email address is already used"
      );
    }
    await User.create(newUser);
  };

  login = async (
    email: string,
    password: string
  ): Promise<RequestSuccess<unknown>> => {
    const query = { email: email };
    const user = await User.findOne(query);
    if (!user) {
      throw new Error("Invalid email address");
    } else {
      const result = await Utils.compareEncrypted(password, user.password);
      if (!result) {
        throw new Error("Invalid password");
      }
      const token = Access.provideToken({
        email: user.email,
        userId: user.id,
        role: user.role,
      });
      const payload = verify(token, Access.secret)
      return new RequestSuccess<unknown>(
        HttpCode.OK,
        {
          payload,
          token,
        },
        "Login succeed"
      );
    }
  };

  async getAllUsers(): Promise<RequestSuccess<IUser[]>> {
    const result = await User.find();
    return new RequestSuccess(HttpCode.OK, result, "Retrieving all user data");
  }

  async getUserHistory(userId: string): Promise<RequestSuccess<unknown>> {
    const user = await User.findById(userId);
    const borrow = await Borrowing.find({ userId: userId }).sort({
      createdAt: 1,
    });
    return new RequestSuccess(
      HttpCode.OK,
      {
        user,
        borrow,
      },
      "Retrieving user history"
    );
  }
  async cancelRequest(requestId: string): Promise<RequestSuccess<string>>{
    await Borrowing.findByIdAndUpdate(requestId, {borrowStatus: BorrowingStatus.Canceled}).sort({
      createdAt: 1,
    });
    return new RequestSuccess(
      HttpCode.OK,
      "Request canceled",
      `Canceling borrow  ${requestId}`
    );
  }
}

export { UserService, IUserService };
